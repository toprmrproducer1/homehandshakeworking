import React, { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Scissors,
  Image as ImageIcon,
  Send,
  History,
  Users,
  BarChart3,
  Settings,
  FolderOpen,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import AccountActivation from './AccountActivation';
import OverviewPanel from './OverviewPanel';
import VideoClippingPanel from './VideoClippingPanel';
import ImageGenerationPanel from './ImageGenerationPanel';
import PostingPanel from './PostingPanel';
import PostHistoryPanel from './PostHistoryPanel';
import SocialAccountsPanel from './SocialAccountsPanel';
import AdvancedAnalyticsPanel from './AdvancedAnalyticsPanel';
import ProfileSettingsPanel from './ProfileSettingsPanel';
import MediaLibraryPanel from './MediaLibraryPanel';

const DashboardNew: React.FC = () => {
  const { isAccountActive } = useUserContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAccountActive) {
    return <AccountActivation />;
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'library', label: 'Library', icon: FolderOpen },
    { id: 'clip', label: 'Video Clipper', icon: Scissors },
    { id: 'generate', label: 'AI Images', icon: ImageIcon },
    { id: 'post', label: 'Create Post', icon: Send },
    { id: 'history', label: 'Post History', icon: History },
    { id: 'social', label: 'Socials', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white">Creator</h1>
            <p className="text-sm text-slate-400">Dashboard</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-slate-400 mb-3">Unlock premium features</p>
            <button className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl ml-12 lg:ml-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search post, image or content"
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
              </button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10"
                  }
                }}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {activeTab === 'overview' && <OverviewPanel />}
          {activeTab === 'library' && <MediaLibraryPanel />}
          {activeTab === 'clip' && <VideoClippingPanel />}
          {activeTab === 'generate' && <ImageGenerationPanel />}
          {activeTab === 'post' && <PostingPanel />}
          {activeTab === 'history' && <PostHistoryPanel />}
          {activeTab === 'social' && <SocialAccountsPanel />}
          {activeTab === 'analytics' && <AdvancedAnalyticsPanel />}
          {activeTab === 'settings' && <ProfileSettingsPanel />}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardNew;
