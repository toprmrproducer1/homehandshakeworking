const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

export interface CloudinaryUploadResponse {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  resourceType: string;
  originalSize: number;
  uploadedAt: Date;
}

export const uploadVideoToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured');
  }

  try {
    if (onProgress) onProgress(5);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'video-clips');
    formData.append('resource_type', 'video');

    if (onProgress) onProgress(10);

    const uploadUrl = 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/video/upload';

    const xhr = new XMLHttpRequest();

    return new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          const mappedProgress = 10 + (percentComplete * 0.8);
          onProgress(mappedProgress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
              url: response.url,
              secureUrl: response.secure_url,
              publicId: response.public_id,
            });

            if (onProgress) onProgress(100);

            resolve({
              url: response.url,
              secureUrl: response.secure_url,
              publicId: response.public_id,
              format: response.format,
              resourceType: response.resource_type,
              originalSize: file.size,
              uploadedAt: new Date(),
            });
          } catch (error) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error?.message || 'Upload failed with status ' + xhr.status));
          } catch {
            reject(new Error('Upload failed with status ' + xhr.status));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(
      'Failed to upload to Cloudinary: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
};

export const uploadVideoToCloudinaryWithRetry = async (
  file: File,
  onProgress?: (progress: number) => void,
  maxRetries: number = 2
): Promise<string> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (onProgress && attempt > 0) {
        onProgress(attempt * 10);
      }

      const result = await uploadVideoToCloudinary(file, onProgress);

      if (onProgress) {
        onProgress(100);
      }

      return result.secureUrl;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Failed to upload to Cloudinary after retries');
};

export const isValidCloudinarySize = (file: File, maxSize: number = 100 * 1024 * 1024): boolean => {
  return file.size <= maxSize;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};
