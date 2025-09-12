import { generateJWT } from './ayrshare';

export const getConnectSocialsURL = async (profileKey: string): Promise<string> => {
  try {
    const jwtResponse = await generateJWT(profileKey);
    if (jwtResponse.status === 'success' && jwtResponse.url) {
      return jwtResponse.url;
    }
    throw new Error('Failed to generate JWT URL');
  } catch (error) {
    console.error('Error generating connect socials URL:', error);
    throw error;
  }
};