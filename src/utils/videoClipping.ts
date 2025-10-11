import { uploadVideoToStorage } from './videoStorage';
import { uploadVideoToCloudinaryWithRetry, isValidCloudinarySize } from './cloudinary';

export interface VideoUploadResult {
  url: string;
  service: 'supabase' | 'cloudinary';
  size: number;
}

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

export const uploadVideoForVizard = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<VideoUploadResult> => {
  const MAX_SUPABASE_SIZE = 50 * 1024 * 1024;
  const MAX_CLOUDINARY_SIZE = 100 * 1024 * 1024;

  if (file.size > MAX_CLOUDINARY_SIZE) {
    throw new Error('File size exceeds 100MB limit. Current size: ' + formatFileSize(file.size));
  }

  if (onProgress) onProgress(5);

  try {
    if (file.size > MAX_SUPABASE_SIZE && isValidCloudinarySize(file, MAX_CLOUDINARY_SIZE)) {
      if (onProgress) onProgress(10);
      const cloudinaryUrl = await uploadVideoToCloudinaryWithRetry(file, (progress) => {
        if (onProgress) onProgress(10 + (progress * 0.8));
      });

      if (onProgress) onProgress(100);

      return {
        url: cloudinaryUrl,
        service: 'cloudinary',
        size: file.size,
      };
    } else {
      if (onProgress) onProgress(10);
      const uploadResult = await uploadVideoToStorage(file, userId, (progress) => {
        if (onProgress) onProgress(10 + (progress * 0.8));
      });

      if (onProgress) onProgress(100);

      return {
        url: uploadResult.url,
        service: 'supabase',
        size: file.size,
      };
    }
  } catch (error) {
    console.error('Video upload error:', error);
    throw new Error(
      'Failed to upload video: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
