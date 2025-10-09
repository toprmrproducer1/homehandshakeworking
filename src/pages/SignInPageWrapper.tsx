import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPageWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-in"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-gray-900 border border-purple-500/20",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "bg-gray-800 border-gray-700 hover:bg-gray-700",
            formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
            footerActionLink: "text-purple-400 hover:text-purple-300"
          }
        }}
      />
    </div>
  );
};

export default SignInPageWrapper;
