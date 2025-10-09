import React, { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Scissors, Users, ChartBar as BarChart3, Settings, Plus, ExternalLink, RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Calendar, Send, History, Image, Wand as Wand2, TrendingUp, Zap, Video, ImageIcon } from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { BentoGrid } from './ui/bento-grid';
import SocialAccountsPanel from './SocialAccountsPanel';
import ConnectSocialsButton from './ConnectSocialsButton';
import VideoClippingPanel from './VideoClippingPanel';
import ImageGenerationPanel from './ImageGenerationPanel';
import AnalyticsPanel from './AnalyticsPanel';
import PostingPanel from './PostingPanel';
import PostHistoryPanel from './PostHistoryPanel';
import AccountActivation from './AccountActivation';

const Dashboard: React.FC = () => {
  const { userProfile, loading, error, refetchProfile, isAccountActive } = useUserContext();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAccountActive) {
    return <AccountActivation />;
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'clip', name: 'Clip Content', icon: Scissors },
    { id: 'generate', name: 'Generate Images', icon: Wand2 },
    { id: 'post', name: 'Create Post', icon: Send },
    { id: 'history', name: 'Post History', icon: History },
    { id: 'social', name: 'Social Accounts', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-purple-900/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-xl shadow-lg shadow-purple-500/50">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Homehandshake
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={refetchProfile}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <UserButton appearance={{
              elements: {
                avatarBox: "h-10 w-10"
              }
            }} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 mb-8 overflow-hidden backdrop-blur-xl">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-300">Error Loading Profile</h3>
                <p className="text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Profile Overview */}
            <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">Account Overview</h2>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-purple-900/20 rounded w-1/3"></div>
                  <div className="h-4 bg-purple-900/20 rounded w-1/2"></div>
                  <div className="h-4 bg-purple-900/20 rounded w-1/4"></div>
                </div>
              ) : userProfile ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="font-medium text-white">{userProfile.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profile Type:</span>
                        <span className="font-medium text-white">{userProfile.title || 'User Profile'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Posts:</span>
                        <span className="font-medium text-white">{userProfile.monthlyPostCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Quota:</span>
                        <span className="font-medium text-white">{userProfile.monthlyPostQuota || 'Unlimited'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-purple-200 mb-4">Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Account Active</span>
                      </div>
                      {userProfile.messagingEnabled && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-gray-300">Messaging Enabled</span>
                        </div>
                      )}
                      {userProfile.lastApiCall && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-purple-400" />
                          <span className="text-gray-300">
                            Last API Call: {new Date(userProfile.lastApiCall).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* BentoGrid Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6 px-4">Quick Actions</h2>
              <BentoGrid items={[
                {
                  title: "Clip Videos",
                  description: "AI-powered video clipping for viral content",
                  icon: <Video className="h-5 w-5 text-purple-400" />,
                  status: "Ready",
                  tags: ["AI", "Video"],
                  cta: "Start Clipping →",
                  colSpan: 1,
                  onClick: () => setActiveTab('clipping')
                },
                {
                  title: "Generate Images",
                  description: "Create stunning visuals with AI assistance",
                  icon: <ImageIcon className="h-5 w-5 text-purple-400" />,
                  status: "Active",
                  tags: ["AI", "Images"],
                  cta: "Generate Now →",
                  colSpan: 1,
                  onClick: () => setActiveTab('generate')
                },
                {
                  title: "Post to Socials",
                  description: "Share content across all your platforms instantly",
                  icon: <Send className="h-5 w-5 text-purple-400" />,
                  status: "Live",
                  tags: ["Multi-platform"],
                  meta: `${userProfile?.activeSocialAccounts?.length || 0} connected`,
                  cta: "Create Post →",
                  colSpan: 1,
                  onClick: () => setActiveTab('posting')
                },
                {
                  title: "Analytics Dashboard",
                  description: "Track engagement and performance metrics across platforms",
                  icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
                  status: "Updated",
                  tags: ["Insights", "Data"],
                  cta: "View Analytics →",
                  colSpan: 2,
                  onClick: () => setActiveTab('analytics')
                },
                {
                  title: "Post History",
                  description: "Browse your content history and performance",
                  icon: <History className="h-5 w-5 text-purple-400" />,
                  status: "Ready",
                  tags: ["Archive"],
                  meta: `${userProfile?.monthlyPostCount || 0} posts`,
                  cta: "View History →",
                  colSpan: 1,
                  onClick: () => setActiveTab('history')
                }
              ]} />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <SocialAccountsPanel />
        )}

        {activeTab === 'clip' && (
          <VideoClippingPanel />
        )}

        {activeTab === 'generate' && (
          <ImageGenerationPanel />
        )}

        {activeTab === 'post' && (
          <PostingPanel />
        )}

        {activeTab === 'history' && (
          <PostHistoryPanel />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel />
        )}

        {activeTab === 'settings' && (
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">Settings</h2>
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-200 mb-2">Account Settings</h3>
              <p className="text-gray-400">Manage your account preferences and settings.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;