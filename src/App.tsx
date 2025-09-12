import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AccountActivation from './components/AccountActivation';
import { UserProvider } from './contexts/UserContext';

function App() {
  const { isSignedIn, user } = useUser();

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
      </Routes>
    </UserProvider>
  );
}

export default App;