import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Database features may not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface GeneratedImage {
  id?: string;
  user_id: string;
  profile_key: string;
  inspiration_image_url?: string;
  prompt: string;
  generated_images: string[];
  created_at?: string;
  updated_at?: string;
}

export const saveGeneratedImages = async (data: Omit<GeneratedImage, 'id' | 'created_at' | 'updated_at'>) => {
  // Validate that we have image URLs
  if (!data.generated_images || data.generated_images.length === 0) {
    throw new Error('No generated images to save');
  }
  
  // Validate that all URLs are valid
  const validUrls = data.generated_images.filter(url => url && url.startsWith('http'));
  if (validUrls.length === 0) {
    throw new Error('No valid image URLs found');
  }
  
  const { data: result, error } = await supabase
    .from('generated_images')
    .insert([{
      ...data,
      generated_images: validUrls
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save generated images: ${error.message}`);
  }

  return result;
};

export const getGeneratedImages = async (profileKey: string) => {
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('profile_key', profileKey)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch generated images: ${error.message}`);
  }

  return data || [];
};

export const deleteGeneratedImage = async (id: string) => {
  const { error} = await supabase
    .from('generated_images')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete generated image: ${error.message}`);
  }
};

export interface ClippedVideo {
  id?: string;
  user_id: string;
  profile_key?: string;
  title: string;
  original_video_url: string;
  clipped_video_url?: string;
  catbox_url?: string;
  thumbnail_url?: string;
  duration?: number;
  start_time?: number;
  end_time?: number;
  status?: string;
  file_size?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export const saveClippedVideo = async (data: Omit<ClippedVideo, 'id' | 'created_at' | 'updated_at'>) => {
  const { data: result, error } = await supabase
    .from('clipped_videos')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to save clipped video: ${error.message}`);
  }

  return result;
};

export const getClippedVideos = async (profileKey: string) => {
  const { data, error } = await supabase
    .from('clipped_videos')
    .select('*')
    .eq('profile_key', profileKey)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch clipped videos: ${error.message}`);
  }

  return data || [];
};

export const updateClippedVideo = async (id: string, updates: Partial<ClippedVideo>) => {
  const { data, error } = await supabase
    .from('clipped_videos')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update clipped video: ${error.message}`);
  }

  return data;
};

export const deleteClippedVideo = async (id: string) => {
  const { error } = await supabase
    .from('clipped_videos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete clipped video: ${error.message}`);
  }
};

export const getAllMediaByUser = async (userId: string) => {
  const [images, videos] = await Promise.all([
    supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('clipped_videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  ]);

  if (images.error) throw new Error(`Failed to fetch images: ${images.error.message}`);
  if (videos.error) throw new Error(`Failed to fetch videos: ${videos.error.message}`);

  return {
    images: images.data || [],
    videos: videos.data || []
  };
};