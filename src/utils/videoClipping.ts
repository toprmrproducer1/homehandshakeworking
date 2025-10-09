const UPLOAD_WEBHOOK = 'https://n8n.srv834400.hstgr.cloud/webhook/4d8f013f-2026-45d0-be1d-b915e16de3fa';
const FETCH_WEBHOOK = 'https://n8n.srv834400.hstgr.cloud/webhook/bcd49dcb-3103-4152-aefc-32c7d8c552fe';

export interface VideoClipRequest {
  videoType: number;
  videoUrl?: string;
  ext?: string;
  videoFile?: File;
}

export const uploadVideoForClipping = async (request: VideoClipRequest, profileKey: string) => {
  const headers: Record<string, string> = {
    'profile-key': profileKey,
  };

  let body: FormData | string;

  if (request.videoType === 1 && request.videoFile) {
    // Send video as binary for videoType 1
    const formData = new FormData();
    formData.append('videoType', request.videoType.toString());
    formData.append('ext', request.ext || '');
    formData.append('video', request.videoFile);
    body = formData;
  } else {
    // Send video URL for other types
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({
      videoType: request.videoType,
      videoUrl: request.videoUrl,
    });
  }

  const response = await fetch(UPLOAD_WEBHOOK, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload video: ${response.statusText}`);
  }

  return response.json();
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