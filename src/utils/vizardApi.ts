const VIZARD_API_BASE = 'https://elb-api.vizard.ai/hvizard-server-front/open-api/v1';
const VIZARD_API_KEY = '9c7070b36ebb479c822aa3eef07474f5';

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
  data: {
    projectId: string;
  } | null;
  message: string;
  serverTime: number;
  success: boolean;
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

export interface VizardProjectStatus {
  code: number;
  data: {
    clips: VizardClip[];
    finishPercent: number;
    projectId: string;
    projectName: string;
    projectStatus: number;
    videoUrl: string;
  } | null;
  message: string;
  serverTime: number;
  success: boolean;
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

export const submitVideoToVizard = async (config: VizardClipConfig): Promise<string> => {
  console.log('Submitting to Vizard with config:', {
    ...config,
    videoUrl: config.videoUrl.substring(0, 100) + '...',
  });

  const response = await fetch(`${VIZARD_API_BASE}/project/create`, {
    method: 'POST',
    headers: {
      'VIZARDAI_API_KEY': VIZARD_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  let responseText = '';
  try {
    responseText = await response.text();
  } catch (e) {
    console.error('Failed to read response text:', e);
  }

  console.log('Vizard API response status:', response.status);
  console.log('Vizard API response:', responseText);

  if (!response.ok) {
    let errorMsg = `Vizard API error (${response.status}): ${response.statusText}`;
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.message) {
        errorMsg = errorData.message;
      }
    } catch {
      if (responseText) {
        errorMsg = responseText;
      }
    }
    throw new Error(errorMsg);
  }

  let result: VizardCreateResponse;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error('Failed to parse Vizard response: ' + responseText.substring(0, 200));
  }

  if (!result.success || !result.data?.projectId) {
    throw new Error(result.message || 'Failed to create Vizard project');
  }

  console.log('Vizard project created successfully:', result.data.projectId);
  return result.data.projectId;
};

export const queryVizardProject = async (projectId: string): Promise<VizardProjectStatus> => {
  const response = await fetch(`${VIZARD_API_BASE}/project/query/${projectId}`, {
    method: 'GET',
    headers: {
      'VIZARDAI_API_KEY': VIZARD_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Vizard query error: ${response.statusText}`);
  }

  const result: VizardProjectStatus = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to query Vizard project');
  }

  return result;
};

export const pollVizardUntilComplete = async (
  projectId: string,
  onProgress?: (percent: number) => void,
  maxWaitTime: number = 600000,
  pollInterval: number = 5000
): Promise<VizardClip[]> => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await queryVizardProject(projectId);

    if (onProgress && status.data) {
      onProgress(status.data.finishPercent);
    }

    if (status.data?.projectStatus === 2) {
      return status.data.clips || [];
    }

    if (status.data?.projectStatus === 3) {
      throw new Error('Video clipping failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Video clipping timeout - please check back later');
};

export const uploadVideoToVizardAndWait = async (
  config: VizardClipConfig,
  onProgress?: (status: string, percent?: number) => void
): Promise<VizardClip[]> => {
  try {
    if (onProgress) onProgress('Submitting video to Vizard...', 5);

    const projectId = await submitVideoToVizard(config);

    if (onProgress) onProgress('Video submitted, processing...', 15);

    const clips = await pollVizardUntilComplete(
      projectId,
      (percent) => {
        // Map Vizard's progress (0-100) to our range (15-95)
        const mappedPercent = 15 + (percent * 0.8);
        if (onProgress) onProgress(`AI analyzing and clipping video... ${Math.round(percent)}%`, mappedPercent);
      }
    );

    if (onProgress) onProgress('Clipping complete!', 100);

    return clips;
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
