import { supabase } from './supabase';

export interface ImageGenerationJob {
  id?: string;
  user_id: string;
  profile_key: string;
  inspiration_image_url?: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_images?: string[];
  error_message?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export const createImageGenerationJob = async (
  data: Omit<ImageGenerationJob, 'id' | 'status' | 'created_at' | 'updated_at' | 'completed_at'>
): Promise<ImageGenerationJob> => {
  const { data: result, error } = await supabase
    .from('image_generation_jobs')
    .insert([{
      ...data,
      status: 'pending',
      generated_images: []
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create image generation job: ${error.message}`);
  }

  return result;
};

export const getImageGenerationJobs = async (
  profileKey: string,
  options?: { status?: string; limit?: number }
): Promise<ImageGenerationJob[]> => {
  let query = supabase
    .from('image_generation_jobs')
    .select('*')
    .eq('profile_key', profileKey)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch image generation jobs: ${error.message}`);
  }

  return data || [];
};

export const getImageGenerationJob = async (jobId: string): Promise<ImageGenerationJob | null> => {
  const { data, error } = await supabase
    .from('image_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch image generation job: ${error.message}`);
  }

  return data;
};

export const updateImageGenerationJob = async (
  jobId: string,
  updates: Partial<Omit<ImageGenerationJob, 'id' | 'user_id' | 'profile_key' | 'created_at'>>
): Promise<ImageGenerationJob> => {
  const { data, error } = await supabase
    .from('image_generation_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update image generation job: ${error.message}`);
  }

  return data;
};

export const deleteImageGenerationJob = async (jobId: string): Promise<void> => {
  const { error } = await supabase
    .from('image_generation_jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to delete image generation job: ${error.message}`);
  }
};

export const getPendingJobs = async (profileKey: string): Promise<ImageGenerationJob[]> => {
  return getImageGenerationJobs(profileKey, { status: 'pending' });
};

export const getProcessingJobs = async (profileKey: string): Promise<ImageGenerationJob[]> => {
  return getImageGenerationJobs(profileKey, { status: 'processing' });
};

export const getActiveJobs = async (profileKey: string): Promise<ImageGenerationJob[]> => {
  const { data, error } = await supabase
    .from('image_generation_jobs')
    .select('*')
    .eq('profile_key', profileKey)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch active jobs: ${error.message}`);
  }

  return data || [];
};

export const pollJobStatus = async (jobId: string): Promise<ImageGenerationJob> => {
  const job = await getImageGenerationJob(jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  return job;
};
