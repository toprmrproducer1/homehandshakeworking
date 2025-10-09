import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProfile } from '../utils/profileApi';
import { ShimmerButton } from './ui/shimmer-button';

const AccountActivation: React.FC = () => {
  const { user } = useUser();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const handleCreateProfile = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error('No email address found');
      return;
    }

    setIsCreatingProfile(true);
    const loadingToast = toast.loading('Creating profile...');

    try {
      const result = await createProfile(
        user.primaryEmailAddress.emailAddress,
        user.id
      );

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(
          result.message || 'Profile created successfully!',
          { duration: 6000 }
        );

        if (result.profileKey) {
          toast.success(
            `Profile Key: ${result.profileKey}`,
            { duration: 8000 }
          );
        }

        if (result.bucketName) {
          toast.success(
            `Bucket Created: ${result.bucketName}`,
            { duration: 6000 }
          );
        }

        if (result.refId) {
          toast.success(
            `Reference ID: ${result.refId}`,
            { duration: 6000 }
          );
        }

        if (result.clerkUpdated) {
          toast.success(
            'Clerk metadata updated successfully',
            { duration: 5000 }
          );
        }
      } else {
        toast.error(result.message || 'Failed to create profile');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred');
      console.error('Profile creation error:', error);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="px-6 py-6 bg-black/40 backdrop-blur-xl border-b border-purple-900/20">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-xl shadow-lg shadow-purple-500/50">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Homehandshake
            </span>
          </div>

          <UserButton appearance={{
            elements: {
              avatarBox: "h-10 w-10"
            }
          }} />
        </nav>
      </header>

      <main className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl p-12 border border-purple-500/20 backdrop-blur-xl">
            <div className="bg-gradient-to-r from-orange-900/40 to-yellow-900/40 p-4 rounded-full w-fit mx-auto mb-8 border border-orange-500/20">
              <AlertCircle className="h-12 w-12 text-orange-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              Account Activation Pending
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Thank you for signing up! Your account will be activated within
              <span className="font-semibold text-purple-400"> 24-36 hours</span>.
            </p>

            <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
              <h3 className="text-lg font-semibold text-purple-200 mb-4">What happens next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Our team will review and activate your account</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">You'll receive an email confirmation once activated</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Full access to all Homehandshake features will be enabled</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/10 rounded-2xl p-6 mb-8 border border-purple-500/10">
              <p className="text-gray-400">
                Questions about your account activation?
                <a href="mailto:support@homehandshake.com" className="text-purple-400 hover:text-purple-300 font-medium ml-1">
                  Contact our support team
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShimmerButton
                onClick={handleCreateProfile}
                disabled={isCreatingProfile}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
                background="linear-gradient(to right, rgb(147 51 234), rgb(126 34 206))"
              >
                {isCreatingProfile ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating Profile...
                  </span>
                ) : (
                  'Create Profile'
                )}
              </ShimmerButton>

              <ShimmerButton
                onClick={() => window.location.reload()}
                background="linear-gradient(to right, rgb(147 51 234), rgb(168 85 247))"
              >
                Refresh Status
              </ShimmerButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountActivation;
