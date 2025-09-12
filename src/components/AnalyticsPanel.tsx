import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Share,
  RefreshCw,
  AlertCircle,
  Calendar,
  Globe
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { fetchSocialAnalytics } from '../utils/socialApi';

const AnalyticsPanel: React.FC = () => {
  const { profileKey, userProfile } = useUserContext();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', color: 'from-blue-500 to-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'from-pink-500 to-purple-600' },
    { id: 'twitter', name: 'X/Twitter', color: 'from-sky-500 to-sky-600' },
    { id: 'x', name: 'X/Twitter', color: 'from-sky-500 to-sky-600' },
    { id: 'youtube', name: 'YouTube', color: 'from-red-500 to-red-600' },
    { id: 'tiktok', name: 'TikTok', color: 'from-gray-800 to-black' },
    { id: 'tiktok', name: 'TikTok', color: 'from-gray-800 to-black' },
  ];

  useEffect(() => {
    if (userProfile?.displayNames) {
      const connectedPlatforms = userProfile.displayNames
        .map((account: any) => {
          const platform = account.platform.toLowerCase();
          // Map x/twitter to twitter for consistency
          if (platform === 'x/twitter' || platform === 'x') return 'twitter';
          return platform;
        })
        .filter((platform: string) => availablePlatforms.some(p => p.id === platform));
      setSelectedPlatforms(connectedPlatforms);
    }
  }, [userProfile]);

  const loadAnalytics = async () => {
    if (!profileKey || selectedPlatforms.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchSocialAnalytics(profileKey, selectedPlatforms);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      loadAnalytics();
    }
  }, [selectedPlatforms, profileKey]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const getPlatformMetrics = (platform: string, data: any) => {
    if (!data || !data[platform]?.analytics) return null;

    const analytics = data[platform].analytics;
    const metrics = [];

    // Common metrics across platforms
    if (analytics.followersCount !== undefined) {
      metrics.push({ label: 'Followers', value: formatNumber(analytics.followersCount), icon: Users });
    }
    if (analytics.views !== undefined) {
      metrics.push({ label: 'Views', value: formatNumber(analytics.views), icon: Eye });
    }
    if (analytics.viewCount !== undefined) {
      metrics.push({ label: 'Views', value: formatNumber(analytics.viewCount), icon: Eye });
    }
    if (analytics.likes !== undefined) {
      metrics.push({ label: 'Likes', value: formatNumber(analytics.likes), icon: Heart });
    }
    if (analytics.likeCount !== undefined) {
      metrics.push({ label: 'Likes', value: formatNumber(analytics.likeCount), icon: Heart });
    }
    if (analytics.comments !== undefined) {
      metrics.push({ label: 'Comments', value: formatNumber(analytics.comments), icon: MessageCircle });
    }
    if (analytics.commentsCount !== undefined) {
      metrics.push({ label: 'Comments', value: formatNumber(analytics.commentsCount), icon: MessageCircle });
    }
    if (analytics.shares !== undefined) {
      metrics.push({ label: 'Shares', value: formatNumber(analytics.shares), icon: Share });
    }
    if (analytics.shareCount !== undefined) {
      metrics.push({ label: 'Shares', value: formatNumber(analytics.shareCount), icon: Share });
    }

    // Platform-specific metrics
    if (platform === 'facebook') {
      if (analytics.pageImpressions) {
        metrics.push({ label: 'Impressions', value: formatNumber(analytics.pageImpressions), icon: Eye });
      }
      if (analytics.fanCount) {
        metrics.push({ label: 'Page Likes', value: formatNumber(analytics.fanCount), icon: Heart });
      }
    }

    if (platform === 'instagram') {
      if (analytics.reachCount) {
        metrics.push({ label: 'Reach', value: formatNumber(analytics.reachCount), icon: Globe });
      }
      if (analytics.mediaCount) {
        metrics.push({ label: 'Posts', value: formatNumber(analytics.mediaCount), icon: BarChart3 });
      }
    }

    if (platform === 'youtube') {
      if (analytics.subscriberCount) {
        metrics.push({ label: 'Subscribers', value: formatNumber(analytics.subscriberCount), icon: Users });
      }
      if (analytics.estimatedMinutesWatched) {
        metrics.push({ label: 'Watch Time (min)', value: formatNumber(analytics.estimatedMinutesWatched), icon: Eye });
      }
    }

    if (platform === 'tiktok') {
      if (analytics.profileViews) {
        metrics.push({ label: 'Profile Views', value: formatNumber(analytics.profileViews), icon: Eye });
      }
      if (analytics.videoCountTotal) {
        metrics.push({ label: 'Videos', value: formatNumber(analytics.videoCountTotal), icon: BarChart3 });
      }
    }

    return metrics.slice(0, 4); // Limit to 4 metrics per platform
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Social Media Analytics</h2>
          </div>
          <button
            onClick={loadAnalytics}
            disabled={loading || selectedPlatforms.length === 0}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Platform Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {availablePlatforms.map((platform) => {
              const isConnected = userProfile?.displayNames?.some((account: any) => 
                account.platform.toLowerCase() === platform.id
              );
              const isSelected = selectedPlatforms.includes(platform.id);
              
              return (
                <button
                  key={platform.id}
                  onClick={() => isConnected && handlePlatformToggle(platform.id)}
                  disabled={!isConnected}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected && isConnected
                      ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                      : isConnected
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {platform.name}
                  {!isConnected && (
                    <div className="text-xs mt-1">Not connected</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Data */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      ) : analytics && selectedPlatforms.length > 0 ? (
        <div className="grid gap-6">
          {selectedPlatforms.map((platformId) => {
            const platform = availablePlatforms.find(p => p.id === platformId);
            const metrics = getPlatformMetrics(platformId, analytics);
            
            if (!platform || !metrics || metrics.length === 0) return null;

            return (
              <div key={platformId} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`bg-gradient-to-r ${platform.color} p-2 rounded-xl`}>
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{platform.name} Analytics</h3>
                    {analytics[platformId]?.lastUpdated && (
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Last updated: {new Date(analytics[platformId].lastUpdated).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                        <Icon className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {metric.value}
                        </div>
                        <div className="text-sm text-gray-600">{metric.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional platform-specific info */}
                {analytics[platformId]?.analytics?.username && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Account:</span> @{analytics[platformId].analytics.username}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : selectedPlatforms.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Platforms Selected</h3>
            <p className="text-gray-500">Select connected platforms above to view analytics data.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsPanel;