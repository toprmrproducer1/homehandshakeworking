import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { 
  Scissors, 
  Share2, 
  Zap, 
  Target, 
  Users, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Homehandshake
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="px-6 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 pt-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Transform your content workflow
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Clip, Create, and
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Share Everywhere
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for content creators to clip engaging content and distribute it across all social media platforms with Homehandshake's precision and ease.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <SignUpButton mode="modal">
                <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center">
                  Start Clipping Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </SignUpButton>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 hover:bg-indigo-50">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">50K+</div>
                <div className="text-gray-600">Content Creators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">1M+</div>
                <div className="text-gray-600">Posts Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">15+</div>
                <div className="text-gray-600">Platforms</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Content Clipping</h3>
              <p className="text-gray-600 leading-relaxed">
                Effortlessly extract the most engaging moments from your content with AI-powered clipping tools.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Platform Sharing</h3>
              <p className="text-gray-600 leading-relaxed">
                Post to all your social media accounts simultaneously with platform-optimized formatting.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Process and distribute your content in seconds, not hours. Maximize your reach in minimal time.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Targeted Distribution</h3>
              <p className="text-gray-600 leading-relaxed">
                Customize content for each platform to maximize engagement and reach your target audience.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together with your team to create, review, and schedule content across all platforms.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-violet-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Track performance across platforms and optimize your content strategy with detailed analytics.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join thousands of creators who are already maximizing their reach with Homehandshake.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center text-indigo-100">
                <CheckCircle className="h-5 w-5 mr-2" />
                Free 14-day trial
              </div>
              <div className="flex items-center text-indigo-100">
                <CheckCircle className="h-5 w-5 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center text-indigo-100">
                <CheckCircle className="h-5 w-5 mr-2" />
                Cancel anytime
              </div>
            </div>
            
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Start Your Free Trial
              </button>
            </SignUpButton>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;