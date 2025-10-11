const CATBOX_UPLOAD_URL = 'https://catbox.moe/user/api.php';
const CORS_PROXY = 'https://corsproxy.io/?';

export interface CatboxUploadResponse {
  url: string;
  originalSize: number;
  uploadedAt: Date;
}

export const uploadToCatbox = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CatboxUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    let uploadUrl = CATBOX_UPLOAD_URL;
    let usedProxy = false;

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Catbox upload failed: ${response.statusText}`);
      }

      const resultUrl = await response.text();

      if (!resultUrl || !resultUrl.startsWith('http')) {
        throw new Error('Invalid response from Catbox');
      }

      return {
        url: resultUrl.trim(),
        originalSize: file.size,
        uploadedAt: new Date(),
      };
    } catch (directError) {
      console.warn('Direct Catbox upload failed, trying with CORS proxy:', directError);

      uploadUrl = CORS_PROXY + encodeURIComponent(CATBOX_UPLOAD_URL);
      usedProxy = true;

      const proxyResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!proxyResponse.ok) {
        throw new Error(`Catbox upload via proxy failed: ${proxyResponse.statusText}`);
      }

      const resultUrl = await proxyResponse.text();

      if (!resultUrl || !resultUrl.startsWith('http')) {
        throw new Error('Invalid response from Catbox via proxy');
      }

      return {
        url: resultUrl.trim(),
        originalSize: file.size,
        uploadedAt: new Date(),
      };
    }
  } catch (error) {
    throw new Error(
      `Failed to upload to Catbox: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const uploadToCatboxWithFallback = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (onProgress) {
        onProgress(attempt > 0 ? 50 : 25);
      }

      const result = await uploadToCatbox(file, onProgress);

      if (onProgress) {
        onProgress(100);
      }

      return result.url;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Catbox upload attempt ${attempt + 1} failed:`, lastError);

      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to upload to Catbox after retries');
};

export const shouldUseCatbox = (file: File, maxSize: number = 30 * 1024 * 1024): boolean => {
  return file.size > maxSize;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
