import React, { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { 
  Scissors, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Send,
  History
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import SocialAccountsPanel from './SocialAccountsPanel';
import ConnectSocialsButton from './ConnectSocialsButton';
import VideoClippingPanel from './VideoClippingPanel';
import AnalyticsPanel from './AnalyticsPanel';
import PostingPanel from './PostingPanel';
import PostHistoryPanel from './PostHistoryPanel';

const Dashboard: React.FC = () => {
  const { userProfile, loading, error, refetchProfile } = useUserContext();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'clip', name: 'Clip Content', icon: Scissors },
    { id: 'post', name: 'Create Post', icon: Send },
    { id: 'history', name: 'Post History', icon: History },
    { id: 'social', name: 'Social Accounts', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Homehandshake
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={refetchProfile}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 disabled:opacity-50"
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
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Profile</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Profile Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ) : userProfile ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{userProfile.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profile Type:</span>
                        <span className="font-medium">{userProfile.title || 'User Profile'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Posts:</span>
                        <span className="font-medium">{userProfile.monthlyPostCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Quota:</span>
                        <span className="font-medium">{userProfile.monthlyPostQuota || 'Unlimited'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">Account Active</span>
                      </div>
                      {userProfile.messagingEnabled && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">Messaging Enabled</span>
                        </div>
                      )}
                      {userProfile.lastApiCall && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">
                            Last API Call: {new Date(userProfile.lastApiCall).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
                <Scissors className="h-8 w-8 mb-4" />
                <h3 className="font-semibold mb-2">Create New Clip</h3>
                <p className="text-indigo-100 mb-4 text-sm">Start clipping your content for social media</p>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Clip</span>
                </button>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                <Users className="h-8 w-8 mb-4" />
                <h3 className="font-semibold mb-2">Social Accounts</h3>
                <p className="text-emerald-100 mb-4 text-sm">
                  {userProfile?.activeSocialAccounts?.length || 0} platforms connected
                </p>
                <button 
                  onClick={() => setActiveTab('social')}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Manage</span>
                </button>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                <BarChart3 className="h-8 w-8 mb-4" />
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-orange-100 mb-4 text-sm">View your content performance</p>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>View Stats</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <SocialAccountsPanel />
        )}

        {activeTab === 'clip' && (
          <VideoClippingPanel />
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Account Settings</h3>
              <p className="text-gray-500">Manage your account preferences and settings.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;