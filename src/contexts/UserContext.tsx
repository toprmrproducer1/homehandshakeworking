import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

interface UserProfile {
  id: string;
  email: string;
  profileKey?: string;
  isActive: boolean;
}

interface UserContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetchProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = () => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    try {
      const accountActive = user.publicMetadata?.['account-active'];
      const profileKey = user.publicMetadata?.['profile-key'] as string | undefined;

      setUserProfile({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        profileKey,
        isActive: accountActive === true || accountActive === 'true'
      });
      setError(null);
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, isLoaded]);

  const refetchProfile = () => {
    setLoading(true);
    fetchProfile();
  };

  return (
    <UserContext.Provider value={{ userProfile, loading, error, refetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
