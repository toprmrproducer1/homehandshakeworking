import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Create a fallback component for missing environment variables
const MissingEnvComponent = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl w-fit mx-auto mb-6">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h1>
      <p className="text-gray-600 mb-6">
        The application needs to be configured with environment variables to function properly.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 text-left">
        <p className="text-sm text-gray-700 mb-2">Required environment variables:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• VITE_CLERK_PUBLISHABLE_KEY</li>
          <li>• VITE_SOCIAL_API_KEY</li>
          <li>• VITE_SOCIAL_DOMAIN</li>
          <li>• VITE_SOCIAL_PRIVATE_KEY</li>
        </ul>
      </div>
    </div>
  </div>
);

const AppWithErrorBoundary = () => {
  if (!PUBLISHABLE_KEY) {
    return <MissingEnvComponent />;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithErrorBoundary />
  </StrictMode>
);