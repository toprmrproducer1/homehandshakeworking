import { supabase } from './supabase';
import { VizardClipConfig } from './vizardApi';

export interface ClippingJob {
  id: string;
  user_id: string;
  profile_key: string;
  vizard_project_id: string;
  vizard_share_link?: string;
  task_name?: string;
  original_video_url: string;
  config: VizardClipConfig;
  status: 'processing' | 'completed' | 'failed';
  progress_percent: number;
  error_message?: string;
  clips_count: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const createClippingJob = async (
  userId: string,
  profileKey: string,
  vizardProjectId: string,
  originalVideoUrl: string,
  config: VizardClipConfig,
  vizardShareLink?: string,
  taskName?: string
): Promise<ClippingJob> => {
  const defaultTaskName = taskName || config.projectName || `Clip - ${new Date().toLocaleString()}`;

  const { data, error } = await supabase
    .from('video_clipping_jobs')
    .insert({
      user_id: userId,
      profile_key: profileKey,
      vizard_project_id: vizardProjectId,
      vizard_share_link: vizardShareLink,
      task_name: defaultTaskName,
      original_video_url: originalVideoUrl,
      config: config,
      status: 'processing',
      progress_percent: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create clipping job: ${error.message}`);
  }

  return data;
};

export const getClippingJobs = async (profileKey: string): Promise<ClippingJob[]> => {
  const { data, error } = await supabase
    .from('video_clipping_jobs')
    .select('*')
    .eq('profile_key', profileKey)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch clipping jobs: ${error.message}`);
  }

  return data || [];
};

export const getProcessingJobs = async (profileKey: string): Promise<ClippingJob[]> => {
  const { data, error } = await supabase
    .from('video_clipping_jobs')
    .select('*')
    .eq('profile_key', profileKey)
    .eq('status', 'processing')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch processing jobs: ${error.message}`);
  }

  return data || [];
};

export const updateClippingJobProgress = async (
  jobId: string,
  progressPercent: number
): Promise<void> => {
  const { error } = await supabase
    .from('video_clipping_jobs')
    .update({
      progress_percent: progressPercent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to update job progress: ${error.message}`);
  }
};

export const markJobCompleted = async (
  jobId: string,
  clipsCount: number
): Promise<void> => {
  const { error } = await supabase
    .from('video_clipping_jobs')
    .update({
      status: 'completed',
      clips_count: clipsCount,
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to mark job as completed: ${error.message}`);
  }
};

export const markJobFailed = async (
  jobId: string,
  errorMessage: string
): Promise<void> => {
  const { error } = await supabase
    .from('video_clipping_jobs')
    .update({
      status: 'failed',
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to mark job as failed: ${error.message}`);
  }
};

export const deleteClippingJob = async (jobId: string): Promise<void> => {
  const { error } = await supabase
    .from('video_clipping_jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to delete clipping job: ${error.message}`);
  }
};

export const getClippingJobByProjectId = async (
  profileKey: string,
  vizardProjectId: string
): Promise<ClippingJob | null> => {
  const { data, error } = await supabase
    .from('video_clipping_jobs')
    .select('*')
    .eq('profile_key', profileKey)
    .eq('vizard_project_id', vizardProjectId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch clipping job: ${error.message}`);
  }

  return data;
};

export const getClippingJobsByStatus = async (
  profileKey: string,
  status: 'processing' | 'completed' | 'failed'
): Promise<ClippingJob[]> => {
  const { data, error } = await supabase
    .from('video_clipping_jobs')
    .select('*')
    .eq('profile_key', profileKey)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch clipping jobs by status: ${error.message}`);
  }

  return data || [];
};
