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
  jobId: string,
  inspirationImageUrl?: string
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

    // Parse the nested structure: [{ data: [{ data: "url" }, ...] }]
    let imageUrls: string[] = [];

    if (Array.isArray(result) && result.length > 0) {
      // Check if it's the nested format
      if (result[0]?.data && Array.isArray(result[0].data)) {
        // Extract URLs from nested structure
        imageUrls = result[0].data.map((item: any) => item.data).filter(Boolean);
      } else {
        // Fallback to simple array format
        imageUrls = result.map((item: any) => item.data).filter(Boolean);
      }
    }


    if (imageUrls.length === 0) {
      throw new Error('No valid image URLs received from generation service');
    }

    // Update the job record with generated images
    await updateImageGenerationJob(jobId, {
      status: 'completed',
      generated_images: imageUrls,
    });

    // Import saveGeneratedImages dynamically to avoid circular dependency
    const { saveGeneratedImages } = await import('./supabase');

    // Save images to the generated_images table for display in gallery
    await saveGeneratedImages({
      user_id: userId,
      profile_key: profileKey,
      inspiration_image_url: inspirationImageUrl,
      prompt: request.prompt,
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