import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Scissors, Share2, TrendingUp } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 py-6 bg-black/40 backdrop-blur-xl border-b border-purple-900/20">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-xl shadow-lg shadow-purple-500/50">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Homehandshake
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/sign-in')}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/20 border border-purple-500/20 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">Start Your Free 14-Day Trial</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Homehandshake
          </h1>

          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            The Creator's AI Control Center
          </p>

          <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
            Clip. Create. Share. Everywhere.
            <br />
            Transform your content workflow into a money-making machine. Extract your best
            moments, turn them into viral clips, and blast them across every platform — automatically.
          </p>

          <button
            onClick={() => navigate('/sign-in')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-purple-500/25"
          >
            Start Your Free 14-Day Trial
          </button>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl p-8 border border-purple-500/20">
              <div className="bg-purple-600/10 p-3 rounded-xl w-fit mb-4">
                <Scissors className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Content Clipping</h3>
              <p className="text-gray-400">
                Automatically extract the best moments from your videos with AI-powered detection
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl p-8 border border-purple-500/20">
              <div className="bg-purple-600/10 p-3 rounded-xl w-fit mb-4">
                <Share2 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Platform Posting</h3>
              <p className="text-gray-400">
                Share your content across all social platforms with a single click
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl p-8 border border-purple-500/20">
              <div className="bg-purple-600/10 p-3 rounded-xl w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-gray-400">
                Track your content performance and engagement across all platforms
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
