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
  console.log('UserContext - Clerk Metadata:', user?.publicMetadata);
  console.log('UserContext - Profile Key:', profileKey);
  console.log('UserContext - Account Active Raw:', accountActiveRaw);
  console.log('UserContext - Account Active:', isAccountActive);

  const fetchProfile = async (forceRefresh = false) => {
    if (!profileKey) {
      console.warn('[UserContext] Profile key not found in user metadata');
      setError(null);
      setLoading(false);
      return;
    }

    try {
      console.log(`[UserContext] Fetching profile (forceRefresh: ${forceRefresh})`);
      setLoading(true);
      setError(null);

      const profile = await fetchUserProfile(profileKey);

      console.log('[UserContext] Profile fetched successfully');
      console.log('[UserContext] Profile object:', profile);
      console.log('[UserContext] Display names:', profile.displayNames);
      console.log('[UserContext] Display names length:', profile.displayNames?.length || 0);
      console.log('[UserContext] Active social accounts:', profile.activeSocialAccounts);

      setUserProfile(profile);
    } catch (err) {
      console.error('[UserContext] Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
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