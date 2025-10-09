import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Globe, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AdvancedAnalyticsPanel: React.FC = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'twitter', 'youtube']);
  const [dateRange, setDateRange] = useState('7days');

  const platformData = [
    { name: 'Facebook', connected: false, color: '#1877F2' },
    { name: 'Instagram', connected: true, color: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' },
    { name: 'X/Twitter', connected: true, color: '#1DA1F2' },
    { name: 'TikTok', connected: false, color: '#000000' },
    { name: 'X/Twitter', connected: false, color: '#1DA1F2' },
    { name: 'YouTube', connected: true, color: '#FF0000' },
    { name: 'TikTok', connected: false, color: '#000000' },
  ];

  const instagramStats = {
    followers: 759,
    likes: 453,
    comments: 39,
    reach: 721,
  };

  const engagementData = [
    { day: 'Mon', instagram: 450, twitter: 320, youtube: 280 },
    { day: 'Tue', instagram: 520, twitter: 380, youtube: 310 },
    { day: 'Wed', instagram: 480, twitter: 350, youtube: 290 },
    { day: 'Thu', instagram: 610, twitter: 420, youtube: 350 },
    { day: 'Fri', instagram: 550, twitter: 390, youtube: 330 },
    { day: 'Sat', instagram: 690, twitter: 480, youtube: 410 },
    { day: 'Sun', instagram: 620, twitter: 450, youtube: 380 },
  ];

  const growthData = [
    { month: 'Jan', followers: 620 },
    { month: 'Feb', followers: 680 },
    { month: 'Mar', followers: 720 },
    { month: 'Apr', followers: 759 },
  ];

  const contentPerformanceData = [
    { type: 'Images', posts: 45, engagement: 8200 },
    { type: 'Videos', posts: 32, engagement: 12400 },
    { type: 'Reels', posts: 28, engagement: 15600 },
    { type: 'Stories', posts: 52, engagement: 6800 },
  ];

  const audienceData = [
    { age: '18-24', value: 28, fill: 'rgb(168, 85, 247)' },
    { age: '25-34', value: 42, fill: 'rgb(139, 92, 246)' },
    { age: '35-44', value: 20, fill: 'rgb(124, 58, 237)' },
    { age: '45+', value: 10, fill: 'rgb(109, 40, 217)' },
  ];

  const chartConfig = {
    instagram: { label: 'Instagram', color: 'rgb(225, 48, 108)' },
    twitter: { label: 'X/Twitter', color: 'rgb(29, 161, 242)' },
    youtube: { label: 'YouTube', color: 'rgb(255, 0, 0)' },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            Social Media Analytics
          </h1>
          <p className="text-gray-400 mt-2">Track your performance across all platforms</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-purple-200 mb-4">Select Platforms</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {platformData.map((platform, index) => (
            <button
              key={index}
              disabled={!platform.connected}
              className={`p-4 rounded-xl border transition-all ${
                platform.connected
                  ? 'border-purple-500/50 bg-gradient-to-br from-purple-600 to-purple-800 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer'
                  : 'border-purple-500/20 bg-gray-800/40 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="font-medium text-white">{platform.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {platform.connected ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>Instagram Analytics</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                Last updated: 10/10/2025
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{instagramStats.followers}</div>
              <div className="text-sm text-gray-400 mt-1">Followers</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
              <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{instagramStats.likes}</div>
              <div className="text-sm text-gray-400 mt-1">Likes</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
              <MessageCircle className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{instagramStats.comments}</div>
              <div className="text-sm text-gray-400 mt-1">Comments</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
              <Globe className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{instagramStats.reach}</div>
              <div className="text-sm text-gray-400 mt-1">Reach</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Weekly Engagement
            </CardTitle>
            <CardDescription>Engagement across platforms this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="instagram" stroke="var(--color-instagram)" strokeWidth={2} />
                <Line type="monotone" dataKey="twitter" stroke="var(--color-twitter)" strokeWidth={2} />
                <Line type="monotone" dataKey="youtube" stroke="var(--color-youtube)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Follower Growth
            </CardTitle>
            <CardDescription>Monthly follower count trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ followers: { label: 'Followers', color: 'rgb(168, 85, 247)' } }} className="h-[300px]">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="followers" stroke="rgb(168, 85, 247)" fill="rgba(168, 85, 247, 0.2)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Content Performance
            </CardTitle>
            <CardDescription>Engagement by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ engagement: { label: 'Engagement', color: 'rgb(168, 85, 247)' } }} className="h-[300px]">
              <BarChart data={contentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="type" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="engagement" fill="rgb(168, 85, 247)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Audience Demographics
            </CardTitle>
            <CardDescription>Audience by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ age, percent }) => `${age}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {audienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPanel;
