import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Globe, RefreshCw, Calendar, Eye, Share, AlertCircle, Facebook, Instagram, Twitter, Youtube, Sparkles } from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { fetchSocialAnalytics } from '../utils/ayrshare';
import { generateSocialMediaInsights } from '../utils/openai';
import { fetchEngagementHistory, getEngagementChartData, fillMissingDates } from '../utils/engagementTracking';

const AdvancedAnalyticsPanel: React.FC = () => {
  const { userProfile, profileKey } = useUserContext();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(30);
  const [engagementHistory, setEngagementHistory] = useState<any[]>([]);
  const [platformInsights, setPlatformInsights] = useState<{ [key: string]: any }>({});
  const [loadingInsights, setLoadingInsights] = useState<{ [key: string]: boolean }>({});
  const [platformData, setPlatformData] = useState<Array<{id: string, name: string, connected: boolean, color: string, icon: any}>>([]);

  const allPlatforms = [
    { id: 'facebook', name: 'Facebook', color: '#1877F2', colorClass: 'from-blue-500 to-blue-600', icon: Facebook },
    { id: 'instagram', name: 'Instagram', color: '#E1306C', colorClass: 'from-pink-500 to-purple-600', icon: Instagram },
    { id: 'twitter', name: 'X/Twitter', color: '#1DA1F2', colorClass: 'from-sky-500 to-sky-600', icon: Twitter },
    { id: 'youtube', name: 'YouTube', color: '#FF0000', colorClass: 'from-red-500 to-red-600', icon: Youtube },
  ];

  useEffect(() => {
    if (userProfile?.displayNames) {
      const connectedPlatformIds = userProfile.displayNames.map((account: any) => {
        const platform = account.platform.toLowerCase();
        if (platform === 'x/twitter' || platform === 'x') return 'twitter';
        return platform;
      });

      const platforms = allPlatforms.map(platform => ({
        ...platform,
        connected: connectedPlatformIds.includes(platform.id)
      }));

      setPlatformData(platforms);
      loadAllData();
    } else {
      setPlatformData(allPlatforms.map(p => ({ ...p, connected: false })));
    }
  }, [userProfile, profileKey]);

  const getConnectedPlatforms = () => {
    return platformData.filter(p => p.connected).map(p => p.id);
  };

  const loadAllData = async () => {
    const connectedPlatforms = getConnectedPlatforms();
    if (!profileKey || connectedPlatforms.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const [analyticsData, historyData] = await Promise.all([
        fetchSocialAnalytics(profileKey, connectedPlatforms),
        fetchEngagementHistory(profileKey, connectedPlatforms, dateRange)
      ]);

      setAnalytics(analyticsData);
      setEngagementHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadInsightsForPlatform = async (platform: string) => {
    if (!profileKey || !analytics?.[platform]) return;

    setLoadingInsights(prev => ({ ...prev, [platform]: true }));

    try {
      const result = await generateSocialMediaInsights(
        analytics[platform].analytics,
        allPlatforms.find(p => p.id === platform)?.name || platform
      );
      setPlatformInsights(prev => ({ ...prev, [platform]: result }));
    } catch (err) {
    } finally {
      setLoadingInsights(prev => ({ ...prev, [platform]: false }));
    }
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const getPlatformMetrics = (platform: string, data: any) => {
    if (!data || !data[platform]?.analytics) return [];

    const analytics = data[platform].analytics;
    const metrics = [];

    if (platform === 'facebook') {
      if (analytics.fanCount !== undefined) metrics.push({ label: 'Page Likes', value: formatNumber(analytics.fanCount), icon: Heart });
      if (analytics.followersCount !== undefined) metrics.push({ label: 'Followers', value: formatNumber(analytics.followersCount), icon: Users });
      if (analytics.pageImpressions !== undefined) metrics.push({ label: 'Impressions', value: formatNumber(analytics.pageImpressions), icon: Eye });
      if (analytics.pageEngagement !== undefined) metrics.push({ label: 'Engagement', value: formatNumber(analytics.pageEngagement), icon: Heart });
    }

    if (platform === 'instagram') {
      if (analytics.followersCount !== undefined) metrics.push({ label: 'Followers', value: formatNumber(analytics.followersCount), icon: Users });
      if (analytics.likeCount !== undefined) metrics.push({ label: 'Likes', value: formatNumber(analytics.likeCount), icon: Heart });
      if (analytics.commentsCount !== undefined) metrics.push({ label: 'Comments', value: formatNumber(analytics.commentsCount), icon: MessageCircle });
      if (analytics.reachCount !== undefined) metrics.push({ label: 'Reach', value: formatNumber(analytics.reachCount), icon: Globe });
    }

    if (platform === 'twitter') {
      if (analytics.followersCount !== undefined) metrics.push({ label: 'Followers', value: formatNumber(analytics.followersCount), icon: Users });
      if (analytics.likeCount !== undefined) metrics.push({ label: 'Likes', value: formatNumber(analytics.likeCount), icon: Heart });
      if (analytics.retweetCount !== undefined) metrics.push({ label: 'Retweets', value: formatNumber(analytics.retweetCount), icon: Share });
      if (analytics.impressions !== undefined) metrics.push({ label: 'Impressions', value: formatNumber(analytics.impressions), icon: Eye });
    }

    if (platform === 'youtube') {
      if (analytics.subscriberCount !== undefined) metrics.push({ label: 'Subscribers', value: formatNumber(analytics.subscriberCount), icon: Users });
      if (analytics.viewCount !== undefined) metrics.push({ label: 'Views', value: formatNumber(analytics.viewCount), icon: Eye });
      if (analytics.likeCount !== undefined) metrics.push({ label: 'Likes', value: formatNumber(analytics.likeCount), icon: Heart });
      if (analytics.commentCount !== undefined) metrics.push({ label: 'Comments', value: formatNumber(analytics.commentCount), icon: MessageCircle });
    }

    return metrics;
  };

  const getPlatformChartData = (platform: string) => {
    const platformHistory = engagementHistory.filter(h => h.platform === platform);
    return platformHistory.map(h => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      engagement: h.engagement,
      followers: h.followers
    }));
  };

  const connectedPlatforms = getConnectedPlatforms();

  return (
    <div className="space-y-6">
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
            onClick={loadAllData}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

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
            const platform = platformData.find(p => p.id === platformId);
            if (!platform) return null;

            const metrics = analytics ? getPlatformMetrics(platformId, analytics) : [];
            const PlatformIcon = platform.icon;
            const insights = platformInsights[platformId];
            const isLoadingInsights = loadingInsights[platformId];
            const chartData = getPlatformChartData(platformId);

            return (
              <div
                key={platformId}
                className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 overflow-hidden backdrop-blur-xl hover:border-purple-500/40 transition-all"
              >
                {/* Platform Header */}
                <div className="p-8 border-b border-purple-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`bg-gradient-to-r ${platform.colorClass} p-3 rounded-xl shadow-lg`}>
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
                    {!insights && (
                      <button
                        onClick={() => loadInsightsForPlatform(platformId)}
                        disabled={isLoadingInsights}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50"
                      >
                        {isLoadingInsights ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Generate AI Insights</span>
                          </>
                        )}
                      </button>
                    )}
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
                </div>

                {/* AI Insights */}
                {insights && (
                  <div className="p-8 border-b border-purple-500/20 bg-blue-900/10">
                    <div className="flex items-start space-x-3 mb-4">
                      <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white mb-2">AI-Powered Insights</h4>
                        <p className="text-sm text-gray-300">{insights.insights}</p>
                      </div>
                    </div>
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-blue-500/20">
                        <h5 className="font-medium text-white mb-3 flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span>Recommendations</span>
                        </h5>
                        <ul className="space-y-2">
                          {insights.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Engagement Chart */}
                {chartData.length > 0 && (
                  <div className="p-8">
                    <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                      <span>Engagement Trend (Last {dateRange} Days)</span>
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                          <XAxis dataKey="date" stroke="rgba(156, 163, 175, 0.5)" />
                          <YAxis stroke="rgba(156, 163, 175, 0.5)" />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-black/90 border border-purple-500/30 rounded-lg p-3">
                                    <p className="text-white font-medium">{payload[0].payload.date}</p>
                                    <p className="text-purple-300">Engagement: {payload[0].value}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="engagement"
                            stroke={platform.color}
                            fill={platform.color}
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Account Username */}
                {analytics?.[platformId]?.analytics?.username && (
                  <div className="px-8 pb-8">
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

export default AdvancedAnalyticsPanel;
