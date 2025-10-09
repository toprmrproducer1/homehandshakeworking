import React, { useState, useEffect } from 'react';
import { useUserContext } from '../contexts/UserContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  RefreshCw,
  Calendar,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchSocialAnalytics } from '../utils/ayrshare';

const OverviewPanel: React.FC = () => {
  const { profileKey, userProfile, loading: profileLoading } = useUserContext();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7days');

  const engagementData = [
    { day: 'Mon', engagement: 320 },
    { day: 'Tue', engagement: 380 },
    { day: 'Wed', engagement: 350 },
    { day: 'Thu', engagement: 420 },
    { day: 'Fri', engagement: 390 },
    { day: 'Sat', engagement: 480 },
    { day: 'Sun', engagement: 450 }
  ];

  const performanceData = [
    { date: '13', value: 35 },
    { date: '14', value: 42 },
    { date: '15', value: 38 },
    { date: '16', value: 45 },
    { date: '17', value: 52 },
    { date: '18', value: 48 },
    { date: '19', value: 55 },
    { date: '20', value: 50 },
    { date: '21', value: 58 },
    { date: '22', value: 53 }
  ];

  const activityHeatmap = [
    [0, 0, 1, 0, 2, 1, 0],
    [1, 2, 2, 1, 0, 0, 1],
    [0, 1, 3, 2, 1, 0, 0],
    [2, 1, 1, 0, 2, 3, 2],
    [1, 0, 2, 1, 1, 2, 1],
    [0, 1, 0, 2, 3, 2, 1],
    [2, 2, 1, 1, 0, 1, 2]
  ];

  useEffect(() => {
    loadAnalytics();
  }, [profileKey, dateRange]);

  const loadAnalytics = async () => {
    if (!profileKey || !userProfile?.displayNames) return;

    try {
      setLoading(true);
      const platforms = userProfile.displayNames.map((acc: any) => {
        const platform = acc.platform.toLowerCase();
        return platform === 'x/twitter' || platform === 'x' ? 'twitter' : platform;
      });
      const data = await fetchSocialAnalytics(profileKey, platforms);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'twitter':
      case 'x':
      case 'x/twitter': return <Twitter className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'from-blue-500 to-blue-600';
      case 'twitter':
      case 'x':
      case 'x/twitter': return 'from-sky-400 to-sky-500';
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'youtube': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getActivityColor = (value: number) => {
    if (value === 0) return 'bg-slate-800';
    if (value === 1) return 'bg-cyan-900';
    if (value === 2) return 'bg-cyan-700';
    return 'bg-cyan-500';
  };

  const connectedAccounts = userProfile?.displayNames || [];
  const totalFollowers = connectedAccounts.reduce((sum: number, acc: any) => {
    const analytics = analytics?.[acc.platform.toLowerCase()]?.analytics;
    return sum + (analytics?.followersCount || analytics?.subscriberCount || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 mt-1">Track your social media performance</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
        >
          <option value="1day">1 Day</option>
          <option value="7days">7 Days</option>
          <option value="30days">30 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Connected Accounts</h3>
              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="text-sm text-slate-400 hover:text-white flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refreshed 20 sec ago</span>
              </button>
            </div>

            {profileLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse h-40" />
                ))}
              </div>
            ) : connectedAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectedAccounts.map((account: any, index: number) => {
                  const platformAnalytics = analytics?.[account.platform.toLowerCase()]?.analytics;
                  const followers = platformAnalytics?.followersCount || platformAnalytics?.subscriberCount || 0;
                  const engagement = platformAnalytics?.likes || platformAnalytics?.likeCount || 0;

                  return (
                    <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-all">
                      <div className={`bg-gradient-to-r ${getPlatformColor(account.platform)} p-2 rounded-lg w-fit mb-3`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div className="mb-3">
                        <h4 className="text-white font-semibold capitalize flex items-center space-x-2">
                          <span>{account.platform === 'twitter' ? 'X/Twitter' : account.platform}</span>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </h4>
                        <p className="text-sm text-slate-400">{account.displayName || account.username}</p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Followers</span>
                            <span className="text-green-400">+{Math.floor(Math.random() * 200) + 100}</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{formatNumber(followers)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                          <div>
                            <div className="text-xs text-slate-400">Likes</div>
                            <div className="text-sm font-semibold text-white">{formatNumber(engagement)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">Comments</div>
                            <div className="text-sm font-semibold text-white">{formatNumber(Math.floor(engagement * 0.1))}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No connected accounts</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Engagement</h3>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>1 Day</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Active Promotion</h3>
              <span className="text-sm text-slate-400">30 Days</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <Instagram className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-white font-medium">Instagram</span>
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <span className="text-2xl font-bold text-white">{formatNumber(totalFollowers)}</span>
                  </div>
                  <div className="text-xs text-slate-400">Followers</div>
                  <div className="text-xs text-green-400">+1800 in last 2 hr</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-2xl font-bold text-white">₹5,000</span>
                  </div>
                  <div className="text-xs text-slate-400">Spending</div>
                  <div className="text-xs text-orange-400">3 days left</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span className="text-2xl font-bold text-white">1.5L</span>
                  </div>
                  <div className="text-xs text-slate-400">Reach</div>
                  <div className="text-xs text-slate-400">account reached</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Most Active Time</h3>
              <span className="text-sm text-slate-400">1 Day</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <Instagram className="h-5 w-5 text-pink-400" />
                  <span className="text-white">Instagram</span>
                </div>
                <button className="text-sm text-slate-400 hover:text-white">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {activityHeatmap.flat().map((value, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded ${getActivityColor(value)} transition-colors hover:ring-2 hover:ring-cyan-500`}
                  />
                ))}
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Most active time</span>
                  <span className="text-white font-semibold">12:00 PM - 13:45 PM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Engagements</span>
                  <span className="text-white font-semibold">14,487</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Likes</span>
                  <span className="text-white font-semibold">+1,254</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
