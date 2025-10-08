const API_BASE_URL = 'http://localhost:4000/api';

interface CreateProfileRequest {
  email: string;
  title: string;
}

interface CreateProfileResponse {
  success: boolean;
  profileKey?: string;
  message?: string;
}

const generateRandomTitle = (): string => {
  const adjectives = [
    'Amazing', 'Creative', 'Dynamic', 'Innovative', 'Strategic',
    'Professional', 'Expert', 'Talented', 'Skilled', 'Experienced'
  ];

  const roles = [
    'Content Creator', 'Social Media Manager', 'Digital Marketer',
    'Brand Strategist', 'Influencer', 'Marketing Specialist',
    'Community Manager', 'Social Strategist', 'Content Strategist',
    'Growth Hacker'
  ];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomRole = roles[Math.floor(Math.random() * roles.length)];

  return `${randomAdjective} ${randomRole}`;
};

export const createProfile = async (email: string): Promise<CreateProfileResponse> => {
  const title = generateRandomTitle();

  try {
    const response = await fetch(`${API_BASE_URL}/create-profile`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        title,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      profileKey: data.profileKey,
      message: data.message || 'Profile created successfully',
    };
  } catch (error) {
    console.error('Profile creation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create profile',
    };
  }
};
