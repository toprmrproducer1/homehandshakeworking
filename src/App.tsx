import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AccountActivation from './components/AccountActivation';
import { UserProvider } from './contexts/UserContext';

function App() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Monitor user metadata changes
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log('🔄 User metadata updated:', user.publicMetadata);
    }
  }, [isLoaded, isSignedIn, user?.publicMetadata]);

  // Periodically check for metadata updates for unactivated accounts
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const accountActive = user?.publicMetadata?.['account-active'];
    const profileKey = user?.publicMetadata?.['profile-key'] || user?.publicMetadata?.['Profile-Key'];
    const isActive = (accountActive === true || accountActive === 'true') && !!profileKey;

    if (!isActive) {
      const intervalId = setInterval(async () => {
        try {
          console.log('🔄 Checking for account activation updates...');
          await user.reload();
        } catch (error) {
          console.error('Failed to reload user metadata:', error);
        }
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [isLoaded, isSignedIn, user]);

  // Show loading while Clerk initializes or user data is loading
  if (!isLoaded || isSignedIn === undefined || isSignedIn === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Homehandshake...</p>
        </div>
      </div>
    );
  }

  // Not signed in - show public routes
  if (!isSignedIn) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Check if account is active - STRICTLY check, default to false if not explicitly true
  const accountActive = user?.publicMetadata?.['account-active'];
  const profileKey = user?.publicMetadata?.['profile-key'] || user?.publicMetadata?.['Profile-Key'];

  // Only allow activation if explicitly set to true (boolean) or 'true' (string)
  // AND has a profile key (meaning profile was created and activated)
  // Any undefined, null, false, or other value = NOT ACTIVE
  const isActive = (accountActive === true || accountActive === 'true') && !!profileKey;

  // Console log Clerk metadata for debugging
  console.log('=== APP.TSX ACTIVATION CHECK ===');
  console.log('Clerk isLoaded:', isLoaded);
  console.log('User ID:', user?.id);
  console.log('User Email:', user?.primaryEmailAddress?.emailAddress);
  console.log('Clerk Public Metadata:', JSON.stringify(user?.publicMetadata, null, 2));
  console.log('Account Active Raw:', accountActive, '(type:', typeof accountActive, ')');
  console.log('Profile Key:', profileKey);
  console.log('Account Active Status (isActive):', isActive);
  console.log('🎯 Should show:', isActive ? 'DASHBOARD ✅' : 'ACTIVATION PAGE ⚠️');
  console.log('================================');

  // Always wrap in UserProvider, but show activation page if not active
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={isActive ? <Dashboard /> : <AccountActivation />} />
        <Route path="/dashboard" element={isActive ? <Dashboard /> : <AccountActivation />} />
        <Route path="/sso-callback" element={isActive ? <Dashboard /> : <AccountActivation />} />
        <Route path="*" element={isActive ? <Dashboard /> : <AccountActivation />} />
      </Routes>
    </UserProvider>
  );
}

export default App;