import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { fetchUserProfile } from '../utils/ayrshare';

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
      console.warn('Profile key not found in user metadata');
      setError(null); // Don't show error for missing profile key
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
      // Don't show error to user, just log it
      setError(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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