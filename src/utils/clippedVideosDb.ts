import { supabase } from './supabase';
import { VizardClip } from './vizardApi';

export interface ClippedVideo {
  id?: string;
  user_id: string;
  profile_key: string;
  title: string;
  original_video_url: string;
  clipped_video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  start_time?: number;
  end_time?: number;
  status: 'processing' | 'completed' | 'failed';
  metadata?: any;
  vizard_project_id?: string;
  vizard_share_link?: string;
  viral_score?: number;
  viral_reason?: string;
  related_topic?: string;
  transcript?: string;
  clip_editor_url?: string;
  video_ms_duration?: number;
  parent_upload_id?: string;
  clip_index?: number;
  vizard_config?: any;
  catbox_url?: string;
  file_size?: number;
  mux_playback_id?: string;
  mux_asset_id?: string;
  mux_stream_url?: string;
  mux_thumbnail_url?: string;
  upload_service?: 'supabase' | 'cloudinary' | 'mux';
  created_at?: string;
  updated_at?: string;
}

export const createClippedVideoRecord = async (
  data: Omit<ClippedVideo, 'id' | 'created_at' | 'updated_at'>
): Promise<ClippedVideo> => {
  const { data: result, error } = await supabase
    .from('clipped_videos')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create clipped video record: ${error.message}`);
  }

  return result;
};

export const saveVizardClips = async (
  userId: string,
  profileKey: string,
  vizardProjectId: string,
  originalVideoUrl: string,
  clips: VizardClip[],
  vizardConfig?: any,
  parentUploadId?: string,
  vizardShareLink?: string
): Promise<ClippedVideo[]> => {
  const savedClips: ClippedVideo[] = [];

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];

    const clipData: Omit<ClippedVideo, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      profile_key: profileKey,
      title: clip.title || `Clip ${i + 1}`,
      original_video_url: originalVideoUrl,
      clipped_video_url: clip.videoUrl,
      duration: clip.videoMsDuration ? Math.floor(clip.videoMsDuration / 1000) : undefined,
      status: 'completed',
      vizard_project_id: vizardProjectId,
      vizard_share_link: vizardShareLink,
      viral_score: clip.viralScore ? parseInt(clip.viralScore) : undefined,
      viral_reason: clip.viralReason,
      related_topic: clip.relatedTopic,
      transcript: clip.transcript,
      clip_editor_url: clip.clipEditorUrl,
      video_ms_duration: clip.videoMsDuration,
      parent_upload_id: parentUploadId,
      clip_index: i,
      vizard_config: vizardConfig,
      metadata: {
        videoId: clip.videoId,
      },
    };

    const savedClip = await createClippedVideoRecord(clipData);
    savedClips.push(savedClip);
  }

  return savedClips;
};

export const getClippedVideos = async (
  profileKey: string,
  options?: { status?: string; limit?: number }
): Promise<ClippedVideo[]> => {
  let query = supabase
    .from('clipped_videos')
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
    throw new Error(`Failed to fetch clipped videos: ${error.message}`);
  }

  return data || [];
};

export const getClippedVideoById = async (id: string): Promise<ClippedVideo | null> => {
  const { data, error } = await supabase
    .from('clipped_videos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch clipped video: ${error.message}`);
  }

  return data;
};

export const getClippedVideosByParentId = async (parentUploadId: string): Promise<ClippedVideo[]> => {
  const { data, error } = await supabase
    .from('clipped_videos')
    .select('*')
    .eq('parent_upload_id', parentUploadId)
    .order('clip_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch clipped videos by parent: ${error.message}`);
  }

  return data || [];
};

export const updateClippedVideo = async (
  id: string,
  updates: Partial<Omit<ClippedVideo, 'id' | 'user_id' | 'profile_key' | 'created_at'>>
): Promise<ClippedVideo> => {
  const { data, error } = await supabase
    .from('clipped_videos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update clipped video: ${error.message}`);
  }

  return data;
};

export const deleteClippedVideo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clipped_videos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete clipped video: ${error.message}`);
  }
};

export const deleteClippedVideosByParentId = async (parentUploadId: string): Promise<void> => {
  const { error } = await supabase
    .from('clipped_videos')
    .delete()
    .eq('parent_upload_id', parentUploadId);

  if (error) {
    throw new Error(`Failed to delete clipped videos by parent: ${error.message}`);
  }
};

export const createProcessingRecord = async (
  userId: string,
  profileKey: string,
  originalVideoUrl: string,
  vizardProjectId: string,
  vizardConfig?: any
): Promise<ClippedVideo> => {
  return createClippedVideoRecord({
    user_id: userId,
    profile_key: profileKey,
    title: 'Processing...',
    original_video_url: originalVideoUrl,
    status: 'processing',
    vizard_project_id: vizardProjectId,
    vizard_config: vizardConfig,
  });
};
