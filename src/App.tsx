import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AccountActivation from './components/AccountActivation';
import { UserProvider } from './contexts/UserContext';

function App() {
  const { isSignedIn, user } = useUser();

  // Add loading state for better UX
  if (isSignedIn === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isSignedIn) {
    return <LandingPage />;
  }

  const accountActive = user?.publicMetadata?.['account-active'] as boolean;
  
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