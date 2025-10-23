import React, { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Scissors, Users, ChartBar as BarChart3, Settings, Plus, ExternalLink, RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Calendar, Send, History, Image, Wand as Wand2, TrendingUp, Zap, Video, ImageIcon, Sparkles, FolderOpen } from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { BentoGrid } from './ui/bento-grid';
import SidebarMenu from './SidebarMenu';
import SocialAccountsPanel from './SocialAccountsPanel';
import ConnectSocialsButton from './ConnectSocialsButton';
import VideoClippingPanel from './VideoClippingPanel';
import ImageGenerationPanel from './ImageGenerationPanel';
import AnalyticsPanel from './AnalyticsPanel';
import AdvancedAnalyticsPanel from './AdvancedAnalyticsPanel';
import PostingPanel from './PostingPanel';
import PostHistoryPanel from './PostHistoryPanel';
import ProfileSettingsPanel from './ProfileSettingsPanel';
import OverviewDashboard from './OverviewDashboard';
import LibraryPanel from './LibraryPanel';
import SettingsPanel from './SettingsPanel';

const Dashboard: React.FC = () => {
  const { userProfile, loading, error, refetchProfile } = useUserContext();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'clip', name: 'Clip Content', icon: Scissors },
    { id: 'generate', name: 'Generate Images', icon: Wand2 },
    { id: 'post', name: 'Create Post', icon: Send },
    { id: 'history', name: 'Post History', icon: History },
    { id: 'library', name: 'Library', icon: FolderOpen },
    { id: 'social', name: 'Social Accounts', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <SidebarMenu activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Header */}
      <header className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-purple-900/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-xl shadow-lg shadow-purple-500/50">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-purple-700 dark:from-white dark:via-purple-200 dark:to-purple-400 bg-clip-text text-transparent">
              Homehandshake
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={refetchProfile}
              disabled={loading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 disabled:opacity-50"
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
        <div className="bg-gradient-to-br from-gray-50 via-purple-50 to-white dark:from-purple-900/20 dark:to-black rounded-2xl border border-gray-200 dark:border-purple-500/20 mb-8 overflow-x-auto backdrop-blur-xl scrollbar-hide">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-4 flex items-center justify-center space-x-2 font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-500/10'
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
          <OverviewDashboard />
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
          <AdvancedAnalyticsPanel />
        )}

        {activeTab === 'library' && (
          <LibraryPanel />
        )}

        {activeTab === 'profile' && (
          <ProfileSettingsPanel />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel />
        )}
      </div>
    </div>
  );
};

export default Dashboard;