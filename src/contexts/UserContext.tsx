import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { fetchUserProfile } from '../utils/ayrshare';

interface UserContextType {
  profileKey: string;
  userProfile: any;
  loading: boolean;
  error: string | null;
  refetchProfile: () => void;
  isAccountActive: boolean;
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

  const profileKey = ((user?.publicMetadata?.['profile-key'] || user?.publicMetadata?.['Profile-Key']) as string) || '';
  const accountActiveRaw = user?.publicMetadata?.['account-active'];
  const isAccountActive = accountActiveRaw === true || accountActiveRaw === 'true';

  // Console log for debugging

  const fetchProfile = async (forceRefresh = false) => {
    if (!profileKey) {
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Add cache busting for force refresh
      const profile = await fetchUserProfile(profileKey);
      setUserProfile(profile);
    } catch (err) {
      setError(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileKey) {
      fetchProfile(false);
    }
  }, [profileKey]);

  // Auto-refresh every 30 seconds to keep social accounts up to date
  useEffect(() => {
    if (!profileKey) return;

    const intervalId = setInterval(() => {
      fetchProfile(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [profileKey]);

  return (
    <UserContext.Provider value={{
      profileKey,
      userProfile,
      loading,
      error,
      refetchProfile: fetchProfile,
      isAccountActive
    }}>
      {children}
    </UserContext.Provider>
  );
};