import { supabase } from './supabase';

const VIDEOS_BUCKET = 'videos';

export interface VideoUploadResponse {
  url: string;
  path: string;
  originalSize: number;
  uploadedAt: Date;
}

export const uploadVideoToStorage = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<VideoUploadResponse> => {
  try {
    if (onProgress) onProgress(10);

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    if (onProgress) onProgress(20);

    const { data, error } = await supabase.storage
      .from(VIDEOS_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'video/mp4',
      });

    if (error) {
      throw new Error(`Failed to upload video: ${error.message}`);
    }

    if (onProgress) onProgress(80);

    const { data: urlData } = supabase.storage
      .from(VIDEOS_BUCKET)
      .getPublicUrl(data.path);

    if (onProgress) onProgress(100);

    return {
      url: urlData.publicUrl,
      path: data.path,
      originalSize: file.size,
      uploadedAt: new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to upload video to storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const deleteVideoFromStorage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(VIDEOS_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete video: ${error.message}`);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const isVideoSizeAcceptable = (file: File): boolean => {
  const MAX_SIZE = 10 * 1024 * 1024 * 1024;
  return file.size <= MAX_SIZE;
};
