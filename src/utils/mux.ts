export interface MuxUploadUrls {
  uploadUrl: string;
  uploadId: string;
}

export interface MuxVideoUrls {
  playbackId: string;
  assetId: string;
  streamUrl: string;
  mp4Highest: string;
  mp4Download: string;
  audioOnly: string;
  thumbnail: string;
  animatedGif: string;
  staticRenditionsReady: boolean;
}

export interface MuxUploadStatus {
  uploadId: string;
  assetId: string | null;
  status: 'waiting' | 'asset_created' | 'errored' | 'cancelled' | 'timed_out';
  videoUrls: MuxVideoUrls | null;
}

export const getMuxUploadUrl = async (): Promise<MuxUploadUrls> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not found');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/mux-upload-init`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Mux upload URL: ${errorText}`);
  }

  const data = await response.json();

  if (!data.uploadUrl || !data.uploadId) {
    throw new Error('Invalid response from Mux upload initialization');
  }

  return {
    uploadUrl: data.uploadUrl,
    uploadId: data.uploadId,
  };
};

export const uploadVideoToMux = async (
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
    xhr.send(file);
  });
};

export const getMuxUploadStatus = async (uploadId: string): Promise<MuxUploadStatus> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not found');
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/mux-upload-status?uploadId=${uploadId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get upload status: ${errorText}`);
  }

  const data = await response.json();
  return data;
};

export const pollMuxUploadUntilReady = async (
  uploadId: string,
  onProgress?: (status: string) => void,
  maxWaitTime: number = 900000,
  pollInterval: number = 5000
): Promise<MuxVideoUrls> => {
  const startTime = Date.now();
  let waitingForRenditions = false;

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getMuxUploadStatus(uploadId);

    if (status.status === 'errored' || status.status === 'cancelled' || status.status === 'timed_out') {
      throw new Error(`Upload ${status.status}`);
    }

    if (status.status === 'asset_created' && status.videoUrls) {
      if (!status.videoUrls.staticRenditionsReady) {
        if (!waitingForRenditions) {
          console.log('Mux asset created, waiting for static renditions to be ready...');
          waitingForRenditions = true;
        }
        if (onProgress) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          onProgress(`Processing video for download (${elapsed}s elapsed)...`);
        }
      } else {
        if (onProgress) {
          onProgress('Video processing complete!');
        }
        console.log('Mux static renditions ready, returning URLs');
        return status.videoUrls;
      }
    } else {
      if (onProgress) {
        onProgress(`Uploading: ${status.status}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Mux processing timeout - video may still be encoding. Please try again in a few minutes.');
};

export const uploadVideoToMuxComplete = async (
  file: File,
  onProgress?: (status: string, percent?: number) => void
): Promise<{ url: string; videoUrls: MuxVideoUrls }> => {
  try {
    if (onProgress) onProgress('Initializing Mux upload...', 5);

    const { uploadUrl, uploadId } = await getMuxUploadUrl();

    if (onProgress) onProgress('Uploading to Mux...', 10);

    await uploadVideoToMux(uploadUrl, file, (progress) => {
      const mappedProgress = 10 + (progress * 0.3);
      if (onProgress) onProgress(`Uploading... ${Math.round(progress)}%`, mappedProgress);
    });

    if (onProgress) onProgress('Upload complete, processing video...', 40);

    const videoUrls = await pollMuxUploadUntilReady(
      uploadId,
      (status) => {
        const progressPercent = 40 + Math.min(50, Math.floor((Date.now() % 300000) / 6000));
        if (onProgress) onProgress(status, progressPercent);
      }
    );

    if (onProgress) onProgress('Video ready for download!', 100);

    return {
      url: videoUrls.mp4Download,
      videoUrls,
    };
  } catch (error) {
    console.error('Mux upload error:', error);
    throw new Error(`Failed to upload to Mux: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
