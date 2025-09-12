import React from 'react';
import { useUserContext } from '../contexts/UserContext';
import ConnectSocialsButton from './ConnectSocialsButton';
import { 
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ExternalLink,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SocialAccountsPanel: React.FC = () => {
  const { userProfile, loading } = useUserContext();

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'twitter':
      case 'x': return <Twitter className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'linkedin': return <Linkedin className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'from-blue-500 to-blue-600';
      case 'twitter':
      case 'x': 
      case 'x/twitter': return 'from-sky-500 to-sky-600';
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'linkedin': return 'from-blue-600 to-blue-700';
      case 'youtube': return 'from-red-500 to-red-600';
      case 'tiktok': return 'from-gray-800 to-black';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Focus on main 5 platforms - match exactly what comes from API
  const mainPlatforms = ['facebook', 'instagram', 'twitter', 'x', 'x/twitter', 'youtube', 'tiktok'];
  
  const getConnectedAccounts = () => {
    if (!userProfile?.displayNames) return [];
    
    // Return all accounts from displayNames - they're already connected
    return userProfile.displayNames || [];
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Media Accounts</h2>
            <p className="text-gray-600">
              Manage your connected social media platforms for content distribution
            </p>
          </div>
          <ConnectSocialsButton />
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Connected Platforms</h3>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl p-6 h-32"></div>
              </div>
            ))}
          </div>
        ) : getConnectedAccounts().length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getConnectedAccounts().map((account: any, index: number) => (
              <div key={index} className="group bg-gradient-to-r bg-gray-50 hover:bg-gray-100 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className={`bg-gradient-to-r ${getPlatformColor(account.platform)} p-2 rounded-lg text-white`}>
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {account.platform === 'twitter' ? 'X/Twitter' : account.platform}
                  </h4>
                  <p className="text-sm text-gray-600 font-medium">
                    {account.displayName || account.username}
                  </p>
                  {account.username && account.username !== account.displayName && (
                    <p className="text-xs text-gray-500">@{account.username}</p>
                  )}
                </div>

                {account.profileUrl && (
                  <a
                    href={account.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 mt-3 group-hover:underline"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Additional info for specific platforms */}
                {account.platform === 'instagram' && account.type && (
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      {account.type}
                    </span>
                    {account.usedQuota !== undefined && (
                      <span className="text-xs text-gray-500">
                        {account.usedQuota}/50 posts used
                      </span>
                    )}
                  </div>
                )}

                {account.platform === 'linkedin' && account.refreshDaysRemaining && (
                  <div className="mt-3">
                    <span className="text-xs text-orange-600">
                      Refresh required in {account.refreshDaysRemaining} days
                    </span>
                  </div>
                )}

                {account.messagingActive && (
                  <div className="mt-3 flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">Messaging enabled</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Social Accounts Connected</h3>
            <p className="text-gray-500 mb-6">
              Connect your social media accounts to start sharing your content across platforms
            </p>
            <ConnectSocialsButton />
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {getConnectedAccounts().length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Summary</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {getConnectedAccounts().length}
              </div>
              <div className="text-gray-600">Connected Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {userProfile.monthlyPostCount || 0}
              </div>
              <div className="text-gray-600">Posts This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {userProfile.monthlyPostQuota || '∞'}
              </div>
              <div className="text-gray-600">Monthly Quota</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userProfile.messagingConversationMonthlyCount || 0}
              </div>
              <div className="text-gray-600">Conversations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAccountsPanel;