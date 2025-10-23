import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  MessageCircle,
  Heart,
  RefreshCw,
  Calendar,
  Eye,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Filter
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { fetchSocialAnalytics, normalizeAnalytics } from '../utils/ayrshare';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchEngagementHistory, syncEngagementData, getEngagementChartData, fillMissingDates } from '../utils/engagementTracking';

const OverviewDashboard: React.FC = () => {
  const { profileKey, userProfile, loading: profileLoading, refetchProfile } = useUserContext();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7 Days');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [engagementData, setEngagementData] = useState<any[]>([]);

  useEffect(() => {
    if (profileKey && userProfile?.displayNames && userProfile.displayNames.length > 0) {
      loadAnalytics();
      loadEngagementData();
    }
  }, [profileKey, userProfile, selectedTimeframe]);

  const loadAnalytics = async () => {
    if (!profileKey || !userProfile?.displayNames || userProfile.displayNames.length === 0) return;

    try {
      setLoading(true);
      const platforms = userProfile.displayNames
        .map((account: any) => {
          const platform = account.platform.toLowerCase();
          if (platform === 'x/twitter' || platform === 'x') return 'twitter';
          return platform;
        })
        .filter((platform: string) => platform);

      if (platforms.length > 0) {
        const data = await fetchSocialAnalytics(profileKey, platforms);
        setAnalytics(data);

        await syncEngagementData(profileKey, platforms);
      }
    } catch (err) {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const loadEngagementData = async () => {
    if (!profileKey || !userProfile?.displayNames || userProfile.displayNames.length === 0) return;

    try {
      const platforms = userProfile.displayNames
        .map((account: any) => {
          const platform = account.platform.toLowerCase();
          if (platform === 'x/twitter' || platform === 'x') return 'twitter';
          return platform;
        })
        .filter((platform: string) => platform);

      const days = selectedTimeframe === '1 Day' ? 1 :
                   selectedTimeframe === '7 Days' ? 7 :
                   selectedTimeframe === '30 Days' ? 30 : 90;

      const history = await fetchEngagementHistory(profileKey, platforms, days);
      const chartData = getEngagementChartData(history, platforms);
      const filledData = fillMissingDates(chartData, Math.min(days, 11), platforms);

      setEngagementData(filledData);
    } catch (err) {
      setEngagementData([]);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'twitter':
      case 'x':
      case 'x/twitter': return <Twitter className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };



  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchProfile();
    await loadAnalytics();
    await loadEngagementData();
    setLastRefreshTime(new Date());
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTimeSinceRefresh = () => {
    const seconds = Math.floor((new Date().getTime() - lastRefreshTime.getTime()) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr ago`;
  };

  const getConnectedAccounts = () => {
    if (!userProfile?.displayNames) return [];
    return userProfile.displayNames || [];
  };

  return (
    <div className="space-y-6">
      {/* Header with Timeframe */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
          >
            <option value="1 Day">1 Day</option>
            <option value="7 Days">7 Days</option>
            <option value="30 Days">30 Days</option>
            <option value="90 Days">90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Connected Accounts Section */}
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-purple-200">Connected accounts</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Refreshed {getTimeSinceRefresh()}</span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 hover:bg-purple-500/10 rounded-lg transition-colors"
                title="Click to refresh connected accounts"
              >
                <RefreshCw className={`h-4 w-4 text-purple-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {profileLoading || loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-purple-900/10 rounded-xl p-4 animate-pulse">
                  <div className="h-8 w-8 bg-purple-500/20 rounded mb-2"></div>
                  <div className="h-4 bg-purple-500/20 rounded mb-2"></div>
                  <div className="h-3 bg-purple-500/20 rounded"></div>
                </div>
              ))
            ) : getConnectedAccounts().length > 0 ? (
              getConnectedAccounts().map((account: any, index: number) => {
                const platformId = account.platform.toLowerCase() === 'x/twitter' || account.platform.toLowerCase() === 'x' ? 'twitter' : account.platform.toLowerCase();
                const platformAnalytics = analytics?.[platformId]?.analytics || {};
                const metrics = normalizeAnalytics(platformId, platformAnalytics);

                return (
                  <div key={index} className="bg-gradient-to-br from-purple-800/20 to-black rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white">
                        {getPlatformIcon(account.platform)}
                      </div>
                      <span className="text-white font-medium text-sm capitalize">
                        {account.platform === 'x' || account.platform === 'x/twitter' ? 'Twitter' : account.platform}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {account.platform.toLowerCase() === 'youtube' ? 'Subscribers' : 'Followers'}
                        </span>
                        <span className="text-sm font-bold text-white">{formatNumber(metrics.followers)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Comments</span>
                          <div className="text-white font-medium">{formatNumber(metrics.comments)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Likes</span>
                          <div className="text-white font-medium">{formatNumber(metrics.likes)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-400">No accounts connected</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-purple-200">Quick Stats</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="text-xs text-gray-400">Total Followers</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(getConnectedAccounts().reduce((sum: number, acc: any) => {
                  const platformId = acc.platform.toLowerCase() === 'x/twitter' || acc.platform.toLowerCase() === 'x' ? 'twitter' : acc.platform.toLowerCase();
                  const platformAnalytics = analytics?.[platformId]?.analytics || {};
                  const metrics = normalizeAnalytics(platformId, platformAnalytics);
                  return sum + metrics.followers;
                }, 0))}
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-pink-400" />
                <span className="text-xs text-gray-400">Total Likes</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(getConnectedAccounts().reduce((sum: number, acc: any) => {
                  const platformId = acc.platform.toLowerCase() === 'x/twitter' || acc.platform.toLowerCase() === 'x' ? 'twitter' : acc.platform.toLowerCase();
                  const platformAnalytics = analytics?.[platformId]?.analytics || {};
                  const metrics = normalizeAnalytics(platformId, platformAnalytics);
                  return sum + metrics.likes;
                }, 0))}
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                <span className="text-xs text-gray-400">Total Comments</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(getConnectedAccounts().reduce((sum: number, acc: any) => {
                  const platformId = acc.platform.toLowerCase() === 'x/twitter' || acc.platform.toLowerCase() === 'x' ? 'twitter' : acc.platform.toLowerCase();
                  const platformAnalytics = analytics?.[platformId]?.analytics || {};
                  const metrics = normalizeAnalytics(platformId, platformAnalytics);
                  return sum + metrics.comments;
                }, 0))}
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-xs text-gray-400">Platforms</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {getConnectedAccounts().length}
              </div>
              <div className="text-xs text-gray-400">Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-purple-200">Engagement</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">Instagram</span>
              </button>
              <button className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-500">Youtube</span>
              </button>
              <button className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-500">Twitter</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Refreshed 20 sec ago</span>
              <button
                onClick={handleRefresh}
                className="p-1 hover:bg-purple-500/10 rounded transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          {engagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                {getConnectedAccounts().map((account: any, index: number) => {
                  const platformId = account.platform.toLowerCase() === 'x/twitter' || account.platform.toLowerCase() === 'x' ? 'twitter' : account.platform.toLowerCase();
                  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
                  return (
                    <Line
                      key={platformId}
                      type="monotone"
                      dataKey={platformId}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <p>Loading engagement data...</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default OverviewDashboard;
