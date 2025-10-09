import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AccountActivation from './components/AccountActivation';
import SignInPageWrapper from './pages/SignInPageWrapper';
import { UserProvider } from './contexts/UserContext';

function App() {
  const { isSignedIn, user } = useUser();

  // Show loading while Clerk initializes
  if (isSignedIn === undefined || isSignedIn === null) {
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
        <Route path="/sign-in" element={<SignInPageWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Check if account is active - default to false if not set
  const accountActive = user?.publicMetadata?.['account-active'] as boolean ?? false;

  // Console log Clerk metadata for debugging
  console.log('Clerk Public Metadata:', user?.publicMetadata);
  console.log('Account Active Status:', accountActive);

  if (!accountActive) {
    return <AccountActivation />;
  }

  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </UserProvider>
  );
}

export default App;