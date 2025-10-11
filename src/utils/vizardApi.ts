const VIZARD_API_BASE = 'https://elb-api.vizard.ai/hvizard-server-front/open-api/v1';
const VIZARD_API_KEY = import.meta.env.VITE_VIZARD_API_KEY;

if (!VIZARD_API_KEY) {
  console.error('VITE_VIZARD_API_KEY is not set in environment variables');
}

export interface VizardClipConfig {
  lang: string;
  preferLength: number[];
  videoUrl: string;
  videoType: number;
  ratioOfClip?: number;
  templateId?: number;
  removeSilenceSwitch?: number;
  maxClipNumber?: number;
  keywords?: string;
  subtitleSwitch?: number;
  headlineSwitch?: number;
  projectName?: string;
  ext?: string;
  emojiSwitch?: number;
  highlightSwitch?: number;
  autoBrollSwitch?: number;
}

export interface VizardCreateResponse {
  code: number;
  projectId?: string;
  shareLink?: string;
  message?: string;
  serverTime?: number;
  success?: boolean;
}

export interface VizardClip {
  clipEditorUrl: string;
  relatedTopic: string | null;
  title: string;
  transcript: string | null;
  videoId: number;
  videoMsDuration: number;
  videoUrl: string;
  viralReason: string;
  viralScore: string;
}

export interface VizardVideo {
  videoUrl: string;
  videoMsDuration: number;
  title: string;
  viralReason: string;
  viralScore: number;
  transcript: string;
  relatedTopic: string[];
}

export interface VizardQueryResponse {
  code: number;
  videos?: VizardVideo[];
  msg?: string;
}

export const VIZARD_VIDEO_TYPES = {
  REMOTE_FILE: 1,
  YOUTUBE: 2,
  GOOGLE_DRIVE: 3,
  VIMEO: 4,
  STREAMYARD: 5,
  TIKTOK: 6,
  TWITTER: 7,
  RUMBLE: 8,
  TWITCH: 9,
  LOOM: 10,
  FACEBOOK: 11,
  LINKEDIN: 12,
};

export const VIZARD_CLIP_RATIOS = {
  VERTICAL_9_16: 1,
  SQUARE_1_1: 2,
  PORTRAIT_4_5: 3,
  HORIZONTAL_16_9: 4,
};

export const VIZARD_PREFER_LENGTHS = {
  AUTO: 0,
  UNDER_30S: 1,
  THIRTY_TO_60S: 2,
  SIXTY_TO_90S: 3,
  NINETY_TO_180S: 4,
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export const getVizardErrorMessage = (code: number, defaultMsg?: string): string => {
  const errorMessages: { [key: number]: string } = {
    1000: 'Video is still processing. Please wait...',
    2000: 'Success',
    4001: 'Invalid API key or unauthorized access. Please check your Vizard API configuration.',
    4002: 'Video clipping failed. Please try again with a different video.',
    4003: 'Rate limit exceeded. Please wait a few minutes before trying again.',
    4004: 'Unsupported video format. Please use MP4, AVI, MOV, or 3GP format.',
    4005: 'The video file appears to be corrupted or broken. Please try a different video.',
    4006: 'Invalid parameters provided. Please check your video settings.',
    4007: 'Insufficient account minutes. Please upgrade your Vizard plan or wait for reset.',
    4008: 'Cannot download video from the provided URL. The video may still be processing. Please wait a few minutes and try again, or verify the URL is publicly accessible.',
    4009: 'Invalid video URL format. Please provide a valid, publicly accessible video URL.',
    4010: 'Cannot detect spoken language in video. Try selecting a specific language instead of auto-detect, or use a video with clearer audio.',
    4011: 'Video processing is taking longer than expected. Please try again in a few minutes.',
  };

  return errorMessages[code] || defaultMsg || `Vizard API error (code: ${code})`;
};

export const submitVideoToVizard = async (config: VizardClipConfig, retries: number = 3): Promise<{ projectId: string; shareLink?: string }> => {
  if (!VIZARD_API_KEY) {
    throw new Error('Vizard API key is not configured. Please add VITE_VIZARD_API_KEY to your environment variables.');
  }

  if (!config.videoUrl || config.videoUrl.trim() === '') {
    throw new Error('Video URL is required for Vizard processing');
  }

  try {
    new URL(config.videoUrl);
  } catch {
    throw new Error('Invalid video URL format. Please provide a valid URL.');
  }

  console.log('Submitting to Vizard with config:', {
    ...config,
    videoUrl: config.videoUrl.substring(0, 100) + '...',
    videoUrlFull: config.videoUrl,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${VIZARD_API_BASE}/project/create`, {
        method: 'POST',
        headers: {
          'VIZARDAI_API_KEY': VIZARD_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        console.error('Failed to read response text:', e);
        throw new Error('Failed to read Vizard API response');
      }

      console.log('Vizard API response status:', response.status);
      console.log('Vizard API response:', responseText);

      if (!response.ok) {
        let errorMsg = `Vizard API error (${response.status}): ${response.statusText}`;
        let errorCode: number | null = null;

        try {
          const errorData = JSON.parse(responseText);
          if (errorData.code) {
            errorCode = errorData.code;
            errorMsg = getVizardErrorMessage(errorData.code, errorData.errMsg || errorData.message);
          } else if (errorData.message) {
            errorMsg = errorData.message;
          }
        } catch {
          if (responseText) {
            errorMsg = responseText;
          }
        }

        if (response.status >= 500 && attempt < retries - 1) {
          console.log(`Vizard server error, retrying... (${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }

        throw new Error(errorMsg);
      }

      let result: VizardCreateResponse;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Failed to parse Vizard response: ' + responseText.substring(0, 200));
      }

      if (result.code !== 2000 || !result.projectId) {
        throw new Error(getVizardErrorMessage(result.code, result.message || 'Failed to create Vizard project'));
      }

      console.log('Vizard project created successfully:', result.projectId);
      console.log('Vizard share link:', result.shareLink);

      return {
        projectId: result.projectId,
        shareLink: result.shareLink,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Vizard API request timeout');
        lastError = new Error('Vizard API request timed out. Please try again.');
      }

      if (attempt < retries - 1) {
        console.log(`Retrying Vizard submission... (${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to submit video to Vizard after retries');
};

export const queryVizardProject = async (projectId: string, retries: number = 2): Promise<VizardQueryResponse> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(`${VIZARD_API_BASE}/project/query/${projectId}`, {
        method: 'GET',
        headers: {
          'VIZARDAI_API_KEY': VIZARD_API_KEY,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 500 && attempt < retries - 1) {
          console.log(`Vizard query error, retrying... (${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error(`Vizard query error: ${response.statusText}`);
      }

      const result: VizardQueryResponse = await response.json();
      console.log('Vizard query response:', result);

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error('Vizard query timed out');
      }

      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to query Vizard project status');
};

export const pollVizardUntilComplete = async (
  projectId: string,
  onProgress?: (percent: number) => void,
  maxWaitTime: number = 600000,
  pollInterval: number = 5000
): Promise<VizardVideo[]> => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const result = await queryVizardProject(projectId);

    if (result.code === 2000 && result.videos) {
      if (onProgress) onProgress(100);
      return result.videos;
    }

    if (result.code === 4002) {
      throw new Error('Video clipping failed: ' + (result.msg || 'Unknown error'));
    }

    if (result.code === 1000) {
      console.log('Video still processing...');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Video clipping timeout - please check back later');
};

export const uploadVideoToVizardAndWait = async (
  config: VizardClipConfig,
  onProgress?: (status: string, percent?: number) => void
): Promise<VizardVideo[]> => {
  try {
    if (onProgress) onProgress('Submitting video to Vizard...', 5);

    const projectId = await submitVideoToVizard(config);

    if (onProgress) onProgress('Video submitted, processing...', 15);

    const videos = await pollVizardUntilComplete(
      projectId,
      (percent) => {
        const mappedPercent = 15 + (percent * 0.8);
        if (onProgress) onProgress(`AI analyzing and clipping video... ${Math.round(percent)}%`, mappedPercent);
      }
    );

    if (onProgress) onProgress('Clipping complete!', 100);

    return videos;
  } catch (error) {
    console.error('Vizard upload error:', error);
    throw error;
  }
};

export const getVideoTypeOptions = () => [
  { value: VIZARD_VIDEO_TYPES.REMOTE_FILE, label: 'Remote video file', requiresFile: true },
  { value: VIZARD_VIDEO_TYPES.YOUTUBE, label: 'YouTube' },
  { value: VIZARD_VIDEO_TYPES.GOOGLE_DRIVE, label: 'Google Drive' },
  { value: VIZARD_VIDEO_TYPES.VIMEO, label: 'Vimeo' },
  { value: VIZARD_VIDEO_TYPES.STREAMYARD, label: 'StreamYard' },
  { value: VIZARD_VIDEO_TYPES.TIKTOK, label: 'TikTok' },
  { value: VIZARD_VIDEO_TYPES.TWITTER, label: 'Twitter' },
  { value: VIZARD_VIDEO_TYPES.RUMBLE, label: 'Rumble' },
  { value: VIZARD_VIDEO_TYPES.TWITCH, label: 'Twitch' },
  { value: VIZARD_VIDEO_TYPES.LOOM, label: 'Loom' },
  { value: VIZARD_VIDEO_TYPES.FACEBOOK, label: 'Facebook' },
  { value: VIZARD_VIDEO_TYPES.LINKEDIN, label: 'LinkedIn' },
];

export const getSupportedVideoExtensions = () => ['mp4', '3gp', 'avi', 'mov'];
