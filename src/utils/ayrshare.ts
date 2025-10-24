const API_KEY = import.meta.env.VITE_AYRSHARE_API_KEY;
const BASE_URL = 'https://api.ayrshare.com/api';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const generateJWT = async (profileKey: string) => {
  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/generate-ayrshare-jwt`;
  const domain = import.meta.env.VITE_AYRSHARE_DOMAIN;
  const privateKey = import.meta.env.VITE_AYRSHARE_PRIVATE_KEY;

  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileKey,
      apiKey: API_KEY,
      domain,
      privateKey,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Failed to generate JWT: ${response.statusText}`);
  }

  return response.json();
};

export const fetchSocialAnalytics = async (profileKey: string, platforms: string[]) => {
  const response = await fetch(`${BASE_URL}/analytics/social`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platforms: platforms,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  return response.json();
};

export const fetchUserProfile = async (profileKey: string) => {
  console.log('[Ayrshare] Fetching user profile with key:', profileKey);

  const response = await fetch(`${BASE_URL}/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('[Ayrshare] Failed to fetch profile:', response.status, response.statusText);
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[Ayrshare] Profile data received:', data);
  console.log('[Ayrshare] Display names array:', data.displayNames);
  console.log('[Ayrshare] Active social accounts:', data.activeSocialAccounts);

  return data;
};

export const fetchPostHistory = async (profileKey: string, platform: string) => {
  const response = await fetch(`${BASE_URL}/history/${platform}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch post history: ${response.statusText}`);
  }

  return response.json();
};

export const validatePost = async (profileKey: string, post: string, platforms: string[], mediaUrls?: string[]) => {
  const response = await fetch(`${BASE_URL}/validate/post`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post,
      platforms,
      ...(mediaUrls && mediaUrls.length > 0 && { mediaUrls }),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate post: ${response.statusText}`);
  }

  return response.json();
};

export const publishPost = async (profileKey: string, post: string, platforms: string[], mediaUrls?: string[], additionalOptions?: any) => {
  const response = await fetch(`${BASE_URL}/post`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post,
      platforms,
      ...(mediaUrls && mediaUrls.length > 0 && { mediaUrls }),
      ...additionalOptions,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to publish post: ${response.statusText}`);
  }

  return response.json();
};

export const uploadMediaFile = async (file: File, fileName?: string, description?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (fileName) {
    formData.append('fileName', fileName);
  }
  if (description) {
    formData.append('description', description);
  }

  const response = await fetch(`${BASE_URL}/media/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to upload file: ${response.statusText}`);
  }

  return response.json();
};

export interface NormalizedAnalytics {
  followers: number;
  comments: number;
  likes: number;
}

export const normalizeAnalytics = (platform: string, analytics: any): NormalizedAnalytics => {
  if (!analytics) {
    return { followers: 0, comments: 0, likes: 0 };
  }

  let followers = 0;
  let comments = 0;
  let likes = 0;

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case 'instagram':
      followers = analytics.followersCount || 0;
      comments = analytics.commentsCount || 0;
      likes = analytics.likeCount || 0;
      break;

    case 'twitter':
    case 'x':
    case 'x/twitter':
      followers = analytics.followersCount || 0;
      comments = analytics.tweetCount || 0;
      likes = analytics.likeCount || 0;
      break;

    case 'youtube':
      followers = analytics.subscriberCount || 0;
      comments = analytics.comments || 0;
      likes = analytics.likes || 0;
      break;

    case 'tiktok':
      followers = analytics.followerCount || 0;
      comments = analytics.commentCountTotal || 0;
      likes = analytics.likeCountTotal || 0;
      break;

    case 'facebook':
      followers = analytics.followersCount || analytics.fanCount || 0;
      comments = analytics.pagePostEngagements || 0;
      likes = analytics.reactions?.total || 0;
      break;

    case 'threads':
      followers = analytics.followersCount || 0;
      comments = analytics.replies || 0;
      likes = analytics.likes || 0;
      break;

    case 'linkedin':
      followers = analytics.followers?.totalFollowerCount || 0;
      comments = analytics.commentCount || 0;
      likes = analytics.likeCount || 0;
      break;

    case 'bluesky':
      followers = analytics.followersCount || 0;
      comments = 0;
      likes = 0;
      break;

    case 'reddit':
      followers = analytics.friends || 0;
      comments = analytics.commentKarma || 0;
      likes = analytics.linkKarma || 0;
      break;

    case 'pinterest':
      followers = analytics.board?.followerCount || 0;
      comments = 0;
      likes = 0;
      break;

    default:
      followers = analytics.followersCount || analytics.followerCount || analytics.subscriberCount || analytics.fanCount || 0;
      comments = analytics.commentsCount || analytics.comments || analytics.commentCount || 0;
      likes = analytics.likesCount || analytics.likeCount || analytics.likes || 0;
  }

  return { followers, comments, likes };
};