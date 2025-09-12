import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AccountActivation from './components/AccountActivation';
import { UserProvider } from './contexts/UserContext';

function App() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl w-fit mx-auto mb-4">
            <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Homehandshake</h2>
          <p className="text-gray-600">Please wait while we initialize the application...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  const accountActive = user?.publicMetadata?.['account-active'] as boolean ?? false;
  
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