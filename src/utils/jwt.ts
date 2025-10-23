import { generateJWT } from './ayrshare';

export const getConnectSocialsURL = async (profileKey: string): Promise<string> => {
  try {
    console.log('Calling generateJWT with profileKey:', profileKey);
    const jwtResponse = await generateJWT(profileKey);
    console.log('JWT Response:', jwtResponse);

    if (jwtResponse.status === 'success' && jwtResponse.url) {
      return jwtResponse.url;
    }

    if (jwtResponse.error) {
      throw new Error(`Ayrshare error: ${jwtResponse.error}`);
    }

    throw new Error('Failed to generate JWT URL: No URL in response');
  } catch (error) {
    console.error('Error in getConnectSocialsURL:', error);
    throw error;
  }
};