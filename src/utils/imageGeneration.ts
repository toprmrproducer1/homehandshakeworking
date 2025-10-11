import { createImageGenerationJob, updateImageGenerationJob } from './imageGenerationJobs';

const IMAGE_GENERATION_WEBHOOK = 'https://primary-production-99d7.up.railway.app/webhook/c299d2eb-5c23-4481-87d2-56ecac5be92f';

export interface ImageGenerationRequest {
  inspirationImage: File;
  prompt: string;
}

export const generateImages = async (request: ImageGenerationRequest, profileKey: string) => {
  const formData = new FormData();
  formData.append('inspirationImage', request.inspirationImage);
  formData.append('prompt', request.prompt);
  formData.append('profileKey', profileKey);

  const response = await fetch(IMAGE_GENERATION_WEBHOOK, {
    method: 'POST',
    headers: {
      'profile-key': profileKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate images: ${response.statusText}`);
  }

  return response.json();
};

export const generateImagesBackground = async (
  request: ImageGenerationRequest,
  profileKey: string,
  userId: string,
  jobId: string
): Promise<void> => {
  try {
    await updateImageGenerationJob(jobId, { status: 'processing' });

    const formData = new FormData();
    formData.append('inspirationImage', request.inspirationImage);
    formData.append('prompt', request.prompt);
    formData.append('profileKey', profileKey);
    formData.append('jobId', jobId);

    const response = await fetch(IMAGE_GENERATION_WEBHOOK, {
      method: 'POST',
      headers: {
        'profile-key': profileKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to generate images: ${response.statusText}`);
    }

    const result = await response.json();
    const imageUrls = result.map((item: any) => item.data);

    await updateImageGenerationJob(jobId, {
      status: 'completed',
      generated_images: imageUrls,
    });
  } catch (error) {
    await updateImageGenerationJob(jobId, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
    throw error;
  }
};

export const getSupportedImageFormats = () => [
  'jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp', 'gif', 'tiff', 'tif', 'svg', 'ico', 'heic', 'heif'
];