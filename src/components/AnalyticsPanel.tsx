import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  RefreshCw,
  AlertCircle,
  Calendar,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { fetchSocialAnalytics } from '../utils/ayrshare';

const AnalyticsPanel: React.FC = () => {
  const { profileKey, userProfile } = useUserContext();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600' },
    { id: 'twitter', name: 'X/Twitter', icon: Twitter, color: 'from-sky-500 to-sky-600' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  ];

  const getConnectedPlatforms = () => {
    if (!userProfile?.displayNames) return [];
    return userProfile.displayNames
      .map((account: any) => {
        const platform = account.platform.toLowerCase();
        if (platform === 'x/twitter' || platform === 'x') return 'twitter';
        return platform;
      })
      .filter((platform: string) => availablePlatforms.some(p => p.id === platform));
  };

  const loadAllAnalytics = async () => {
    const connectedPlatforms = getConnectedPlatforms();
    if (!profileKey || connectedPlatforms.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchSocialAnalytics(profileKey, connectedPlatforms);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [profileKey, userProfile]);

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

    if (platform === 'facebook') {
      if (analytics.fanCount !== undefined) {
        metrics.push({ label: 'Page Likes', value: formatNumber(analytics.fanCount), icon: Heart });
      }
      if (analytics.followersCount !== undefined) {
        metrics.push({ label: 'Followers', value: formatNumber(analytics.followersCount), icon: Users });
      }
      if (analytics.pageImpressions !== undefined) {
        metrics.push({ label: 'Impressions', value: formatNumber(analytics.pageImpressions), icon: Eye });
      }
      if (analytics.pageEngagement !== undefined) {
        metrics.push({ label: 'Engagement', value: formatNumber(analytics.pageEngagement), icon: Heart });
      }
    }

    if (platform === 'instagram') {
      if (analytics.followersCount !== undefined) {
        metrics.push({ label: 'Followers', value: formatNumber(analytics.followersCount), icon: Users });
      }
      if (analytics.likeCount !== undefined) {
        metrics.push({ label: 'Likes', value: formatNumber(analytics.likeCount), icon: Heart });
      }
      if (analytics.commentsCount !== undefined) {
        metrics.push({ label: 'Comments', value: formatNumber(analytics.commentsCount), icon: MessageCircle });
      }
      if (analytics.reachCount !== undefined) {
        metrics.push({ label: 'Reach', value: formatNumber(analytics.reachCount), icon: Globe });
      }
    }

    if (platform === 'twitter') {
      if (analytics.followersCount !== undefined) {
        metrics.push({ label: 'Followers', value: formatNumber(analytics.followersCount), icon: Users });
      }
      if (analytics.likeCount !== undefined) {
        metrics.push({ label: 'Likes', value: formatNumber(analytics.likeCount), icon: Heart });
      }
      if (analytics.retweetCount !== undefined) {
        metrics.push({ label: 'Retweets', value: formatNumber(analytics.retweetCount), icon: Share });
      }
      if (analytics.impressions !== undefined) {
        metrics.push({ label: 'Impressions', value: formatNumber(analytics.impressions), icon: Eye });
      }
    }

    if (platform === 'youtube') {
      if (analytics.subscriberCount !== undefined) {
        metrics.push({ label: 'Subscribers', value: formatNumber(analytics.subscriberCount), icon: Users });
      }
      if (analytics.viewCount !== undefined) {
        metrics.push({ label: 'Views', value: formatNumber(analytics.viewCount), icon: Eye });
      }
      if (analytics.likeCount !== undefined) {
        metrics.push({ label: 'Likes', value: formatNumber(analytics.likeCount), icon: Heart });
      }
      if (analytics.commentCount !== undefined) {
        metrics.push({ label: 'Comments', value: formatNumber(analytics.commentCount), icon: MessageCircle });
      }
    }

    return metrics.length > 0 ? metrics.slice(0, 4) : null;
  };

  const connectedPlatforms = getConnectedPlatforms();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-xl shadow-lg shadow-purple-500/50">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Social Media Analytics</h2>
              <p className="text-sm text-gray-400 mt-1">Track your performance across all platforms</p>
            </div>
          </div>
          <button
            onClick={loadAllAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-300">Error Loading Analytics</h3>
              <p className="text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-12 backdrop-blur-xl">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400 text-lg">Loading analytics data...</p>
          </div>
        </div>
      ) : connectedPlatforms.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-12 backdrop-blur-xl">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-200 mb-2">No Connected Platforms</h3>
            <p className="text-gray-400">Connect your social media accounts to view analytics.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {connectedPlatforms.map((platformId) => {
            const platform = availablePlatforms.find(p => p.id === platformId);
            if (!platform) return null;

            const metrics = analytics ? getPlatformMetrics(platformId, analytics) : null;
            const PlatformIcon = platform.icon;

            return (
              <div
                key={platformId}
                className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-8 backdrop-blur-xl hover:border-purple-500/40 transition-all"
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`bg-gradient-to-r ${platform.color} p-3 rounded-xl shadow-lg`}>
                      <PlatformIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{platform.name} Analytics</h3>
                      {analytics?.[platformId]?.lastUpdated && (
                        <p className="text-sm text-gray-400 flex items-center space-x-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Last updated: {new Date(analytics[platformId].lastUpdated).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                {metrics && metrics.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.map((metric, index) => {
                      const Icon = metric.icon;
                      return (
                        <div
                          key={index}
                          className="bg-black/30 rounded-xl p-5 text-center border border-purple-500/10 hover:border-purple-500/30 transition-all"
                        >
                          <Icon className="h-7 w-7 text-purple-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white mb-1">
                            {metric.value}
                          </div>
                          <div className="text-xs text-gray-400">{metric.label}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500">No analytics data available for this platform</p>
                  </div>
                )}

                {/* Account Username */}
                {analytics?.[platformId]?.analytics?.username && (
                  <div className="mt-6 pt-6 border-t border-purple-500/20">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-purple-200">Account:</span> @{analytics[platformId].analytics.username}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
