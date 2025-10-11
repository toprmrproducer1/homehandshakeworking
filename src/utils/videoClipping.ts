const UPLOAD_WEBHOOK = 'https://n8n.srv834400.hstgr.cloud/webhook/4d8f013f-2026-45d0-be1d-b915e16de3fa';
const FETCH_WEBHOOK = 'https://n8n.srv834400.hstgr.cloud/webhook/bcd49dcb-3103-4152-aefc-32c7d8c552fe';
const BIG_VIDEO_WEBHOOK = 'https://n8n.srv834400.hstgr.cloud/webhook/bigvideo';

export interface VideoClipRequest {
  videoType: number;
  videoUrl?: string;
  ext?: string;
  videoFile?: File;
}

export interface ClippedVideoResponse {
  viralScore?: string;
  relatedTopic?: string | null;
  transcript?: string | null;
  videoUrl: string;
  clipEditorUrl?: string;
  videoMsDuration?: number;
  videoId?: number;
  title?: string;
  viralReason?: string;
}

export const uploadVideoForClipping = async (request: VideoClipRequest, profileKey: string): Promise<ClippedVideoResponse[]> => {
  const headers: Record<string, string> = {
    'profile-key': profileKey,
  };

  let body: FormData | string;

  if (request.videoType === 1 && request.videoFile) {
    const formData = new FormData();
    formData.append('video', request.videoFile);
    body = formData;
  } else if (request.videoUrl) {
    const formData = new FormData();
    formData.append('url', request.videoUrl);
    body = formData;
  } else {
    throw new Error('Either videoFile or videoUrl must be provided');
  }

  const response = await fetch(UPLOAD_WEBHOOK, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload video for clipping: ${response.statusText}`);
  }

  const result = await response.json();

  return Array.isArray(result) ? result : [result];
};

export const fetchClippedVideos = async (profileKey: string) => {
  const response = await fetch(FETCH_WEBHOOK, {
    method: 'GET',
    headers: {
      'profile-key': profileKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch clipped videos: ${response.statusText}`);
  }

  return response.json();
};

export const getVideoTypeOptions = () => [
  { value: 1, label: 'Remote video file', requiresFile: true },
  { value: 2, label: 'YouTube' },
  { value: 3, label: 'Google Drive' },
  { value: 4, label: 'Vimeo' },
  { value: 5, label: 'StreamYard' },
  { value: 6, label: 'TikTok' },
  { value: 7, label: 'Twitter' },
  { value: 8, label: 'Rumble' },
  { value: 9, label: 'Twitch' },
  { value: 10, label: 'Loom' },
  { value: 11, label: 'Facebook' },
  { value: 12, label: 'LinkedIn' },
];

export const getSupportedVideoExtensions = () => ['mp4', '3gp', 'avi', 'mov'];

export const uploadLargeVideoToBigWebhook = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const MAX_SIZE = 200 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    throw new Error(`File size exceeds 200MB limit. Current size: ${formatFileSize(file.size)}`);
  }

  if (onProgress) {
    onProgress(10);
  }

  const formData = new FormData();
  formData.append('file', file);

  if (onProgress) {
    onProgress(30);
  }

  const response = await fetch(BIG_VIDEO_WEBHOOK, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Big video webhook upload failed: ${response.statusText}`);
  }

  if (onProgress) {
    onProgress(80);
  }

  const result = await response.json();

  if (onProgress) {
    onProgress(100);
  }

  if (Array.isArray(result) && result.length > 0 && result[0].videoUrl) {
    return result[0].videoUrl;
  } else if (result.videoUrl) {
    return result.videoUrl;
  } else {
    throw new Error('Invalid response from big video webhook: no videoUrl found');
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};