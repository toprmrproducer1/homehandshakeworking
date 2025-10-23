import { generateJWT } from './ayrshare';

export const getConnectSocialsURL = async (profileKey: string): Promise<string> => {
  try {
    const jwtResponse = await generateJWT(profileKey);

    if (jwtResponse.status === 'success' && jwtResponse.url) {
      return jwtResponse.url;
    }

    if (jwtResponse.error) {
      throw new Error(`Ayrshare error: ${jwtResponse.error}`);
    }

    throw new Error('Failed to generate JWT URL: No URL in response');
  } catch (error) {
    throw error;
  }
};