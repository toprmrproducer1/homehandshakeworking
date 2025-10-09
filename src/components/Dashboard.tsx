import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black/40 backdrop-blur-xl border-b border-purple-900/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-xl shadow-lg shadow-purple-500/50">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Homehandshake
            </span>
          </div>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10"
              }
            }}
          />
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-400">
              Your content control center
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Content Clipping</h3>
              <p className="text-gray-400 mb-4">
                Create viral clips from your videos
              </p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                Start Clipping
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Social Accounts</h3>
              <p className="text-gray-400 mb-4">
                Manage your connected platforms
              </p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                Connect Accounts
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-400 mb-4">
                Track your content performance
              </p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
