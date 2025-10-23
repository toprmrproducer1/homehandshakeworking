import { supabase } from './supabase';
import { fetchSocialAnalytics } from './ayrshare';

export interface EngagementDataPoint {
  date: string;
  platform: string;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
}

export interface PlatformEngagement {
  [platform: string]: number;
}

export const calculateEngagement = (analytics: any, platform: string): number => {
  let engagement = 0;

  switch (platform.toLowerCase()) {
    case 'instagram':
      engagement = (analytics.likeCount || 0) + (analytics.commentsCount || 0) + (analytics.shareCount || 0);
      break;

    case 'facebook':
      engagement = (analytics.pageEngagement || 0) + (analytics.reactions?.total || 0);
      break;

    case 'twitter':
    case 'x':
      engagement = (analytics.likeCount || 0) + (analytics.retweetCount || 0) + (analytics.replyCount || 0);
      break;

    case 'youtube':
      engagement = (analytics.likeCount || 0) + (analytics.commentCount || 0) + (analytics.shareCount || 0);
      break;

    case 'tiktok':
      engagement = (analytics.likeCountTotal || 0) + (analytics.commentCountTotal || 0) + (analytics.shareCountTotal || 0);
      break;

    case 'linkedin':
      engagement = (analytics.likeCount || 0) + (analytics.commentCount || 0) + (analytics.shareCount || 0);
      break;

    default:
      engagement = (analytics.likeCount || analytics.likes || 0) +
                   (analytics.commentsCount || analytics.comments || 0) +
                   (analytics.shareCount || analytics.shares || 0);
  }

  return engagement;
};

export const fetchEngagementHistory = async (
  profileKey: string,
  platforms: string[],
  days: number = 30
): Promise<EngagementDataPoint[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('engagement_history')
    .select('*')
    .eq('profile_key', profileKey)
    .in('platform', platforms)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    return [];
  }

  return (data || []).map(row => ({
    date: row.date,
    platform: row.platform,
    engagement: calculateEngagement(row.raw_data, row.platform),
    likes: row.likes || 0,
    comments: row.comments || 0,
    shares: row.shares || 0,
    followers: row.followers || 0,
  }));
};

export const saveEngagementSnapshot = async (
  profileKey: string,
  platform: string,
  analyticsData: any
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];

  const engagementData = {
    profile_key: profileKey,
    platform: platform.toLowerCase(),
    date: today,
    followers: analyticsData.followersCount || analyticsData.subscriberCount || analyticsData.fanCount || 0,
    likes: analyticsData.likeCount || analyticsData.likes || 0,
    comments: analyticsData.commentsCount || analyticsData.commentCount || analyticsData.comments || 0,
    shares: analyticsData.shareCount || analyticsData.shares || 0,
    raw_data: analyticsData,
  };

  const { error } = await supabase
    .from('engagement_history')
    .upsert(engagementData, {
      onConflict: 'profile_key,platform,date',
    });

  if (error) {
  }
};

export const syncEngagementData = async (
  profileKey: string,
  platforms: string[]
): Promise<void> => {
  try {
    const analyticsData = await fetchSocialAnalytics(profileKey, platforms);

    for (const platform of platforms) {
      if (analyticsData[platform]?.analytics) {
        await saveEngagementSnapshot(profileKey, platform, analyticsData[platform].analytics);
      }
    }
  } catch (error) {
  }
};

export const getEngagementChartData = (
  engagementHistory: EngagementDataPoint[],
  platforms: string[]
): any[] => {
  const dateMap: { [date: string]: any } = {};

  engagementHistory.forEach(point => {
    const dateKey = new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { date: dateKey };
    }

    dateMap[dateKey][point.platform] = point.engagement;
  });

  return Object.values(dateMap);
};

export const fillMissingDates = (
  chartData: any[],
  days: number,
  platforms: string[]
): any[] => {
  if (chartData.length === 0) {
    const result: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dataPoint: any = { date: dateKey };
      platforms.forEach(platform => {
        dataPoint[platform] = 0;
      });
      result.push(dataPoint);
    }
    return result;
  }

  return chartData;
};
