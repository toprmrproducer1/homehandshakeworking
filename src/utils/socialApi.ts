const API_KEY = import.meta.env.VITE_SOCIAL_API_KEY;
const BASE_URL = 'https://api.homehandshake.com/api';

// Helper function to check if API is configured
const checkApiConfiguration = () => {
  if (!API_KEY) {
    throw new Error('API key not configured. Please contact support.');
  }
};

export const generateJWT = async (profileKey: string) => {
  checkApiConfiguration();
  
  const response = await fetch(`${BASE_URL}/profiles/generateJWT`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      domain: import.meta.env.VITE_SOCIAL_DOMAIN,
      privateKey: import.meta.env.VITE_SOCIAL_PRIVATE_KEY,
      profileKey: profileKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate JWT: ${response.statusText}`);
  }

  return response.json();
};

export const fetchSocialAnalytics = async (profileKey: string, platforms: string[]) => {
  checkApiConfiguration();
  
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
  checkApiConfiguration();
  
  const response = await fetch(`${BASE_URL}/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  return response.json();
};

export const fetchPostHistory = async (profileKey: string, platform: string) => {
  checkApiConfiguration();
  
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
  checkApiConfiguration();
  
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
  checkApiConfiguration();
  
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