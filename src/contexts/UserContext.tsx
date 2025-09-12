import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { fetchUserProfile } from '../utils/socialApi';

interface UserContextType {
  profileKey: string;
  userProfile: any;
  loading: boolean;
  error: string | null;
  refetchProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileKey = (user?.publicMetadata?.['Profile-Key'] as string) || '';

  const fetchProfile = async () => {
    if (!profileKey) {
      setError('Profile key not found in user metadata. Please contact support to activate your account.');
      setLoading(false);
      return;
    }

    // Check if API key is available
    if (!import.meta.env.VITE_SOCIAL_API_KEY) {
      setError('API configuration missing. Please contact support.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await fetchUserProfile(profileKey);
      setUserProfile(profile);
    } catch (err) {
      console.error('Profile fetch error:', err);
      
      // Handle different types of network errors
      if (err instanceof Error) {
        if (err.message === 'Failed to fetch') {
          setError('Unable to connect to the server. Please check your internet connection and try again. If the problem persists, the API server may be temporarily unavailable.');
        } else if (err.message.includes('CORS')) {
          setError('Cross-origin request blocked. Please contact support to configure the API server.');
        } else if (err.message.includes('401') || err.message.includes('403')) {
          setError('Authentication failed. Please check your API credentials or contact support.');
        } else if (err.message.includes('404')) {
          setError('API endpoint not found. Please contact support to verify the API configuration.');
        } else if (err.message.includes('500')) {
          setError('Server error occurred. Please try again later or contact support.');
        } else {
          setError(`${err.message}. Please try refreshing the page or contact support if the issue persists.`);
        }
      } else {
        setError('An unexpected error occurred. Please try refreshing the page or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileKey) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [profileKey]);

  return (
    <UserContext.Provider value={{
      profileKey,
      userProfile,
      loading,
      error,
      refetchProfile: fetchProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};