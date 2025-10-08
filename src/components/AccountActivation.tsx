import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProfile } from '../utils/profileApi';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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

      {/* Main Content */}
      <main className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-full w-fit mx-auto mb-8">
              <AlertCircle className="h-12 w-12 text-orange-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Account Activation Pending
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Thank you for signing up! Your account will be activated within
              <span className="font-semibold text-indigo-600"> 24-36 hours</span>.
            </p>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Our team will review and activate your account</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">You'll receive an email confirmation once activated</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Full access to all Homehandshake features will be enabled</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <p className="text-gray-600">
                Questions about your account activation? 
                <a href="mailto:support@homehandshake.com" className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
                  Contact our support team
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateProfile}
                disabled={isCreatingProfile}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingProfile ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountActivation;