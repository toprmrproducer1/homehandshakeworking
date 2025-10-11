import { uploadVideoToStorage } from './videoStorage';
import { uploadVideoToCloudinaryWithRetry, isValidCloudinarySize } from './cloudinary';
import { uploadVideoToMuxComplete, MuxVideoUrls } from './mux';

export interface VideoUploadResult {
  url: string;
  service: 'supabase' | 'cloudinary' | 'mux';
  size: number;
  extension: string;
  muxVideoUrls?: MuxVideoUrls;
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
  const MAX_MUX_SIZE = 200 * 1024 * 1024 * 1024;

  if (file.size > MAX_MUX_SIZE) {
    throw new Error('File size exceeds 200GB limit. Current size: ' + formatFileSize(file.size));
  }

  const fileExtension = getFileExtension(file.name);
  if (!fileExtension) {
    throw new Error('Could not determine file extension');
  }

  if (onProgress) onProgress(5);

  try {
    if (file.size > MAX_SUPABASE_SIZE) {
      console.log(`File size ${formatFileSize(file.size)} exceeds Supabase limit, using Mux for upload`);
      if (onProgress) onProgress(10);

      try {
        const muxResult = await uploadVideoToMuxComplete(file, (status, progress) => {
          if (onProgress && progress) {
            const mappedProgress = 10 + (progress * 0.9);
            onProgress(mappedProgress);
          }
        });

        if (onProgress) onProgress(100);

        console.log('Mux upload complete. Using download URL:', muxResult.url);

        const videoUrl = muxResult.videoUrls.mp4Download || muxResult.videoUrls.mp4Highest;

        if (!videoUrl) {
          throw new Error('No downloadable video URL available from Mux');
        }

        return {
          url: videoUrl,
          service: 'mux',
          size: file.size,
          extension: fileExtension,
          muxVideoUrls: muxResult.videoUrls,
        };
      } catch (muxError) {
        console.error('Mux upload failed:', muxError);
        const errorMsg = muxError instanceof Error ? muxError.message : 'Unknown error';

        if (errorMsg.includes('timeout')) {
          throw new Error(
            `Mux video processing is taking longer than expected. This is normal for large files (${formatFileSize(file.size)}). ` +
            'The video is still being processed. Please try submitting to Vizard again in a few minutes, ' +
            'or use a smaller video file.'
          );
        }

        throw new Error(`Failed to upload large video to Mux: ${errorMsg}`);
      }
    } else {
      console.log(`File size ${formatFileSize(file.size)} within Supabase limit, using Supabase storage`);
      if (onProgress) onProgress(10);
      const uploadResult = await uploadVideoToStorage(file, userId, (progress) => {
        if (onProgress) onProgress(10 + (progress * 0.8));
      });

      if (onProgress) onProgress(100);

      return {
        url: uploadResult.url,
        service: 'supabase',
        size: file.size,
        extension: fileExtension,
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

const getFileExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ext;
};
