import { supabase } from './supabase';

export interface GenerationBatch {
  id?: string;
  user_id: string;
  profile_key: string;
  batch_name: string;
  batch_type: 'image' | 'video' | 'mixed';
  item_count?: number;
  average_viral_score?: number;
  created_at?: string;
  updated_at?: string;
}

export const createGenerationBatch = async (
  data: Omit<GenerationBatch, 'id' | 'item_count' | 'average_viral_score' | 'created_at' | 'updated_at'>
): Promise<GenerationBatch> => {
  const { data: result, error } = await supabase
    .from('generation_batches')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create generation batch: ${error.message}`);
  }

  return result;
};

export const getGenerationBatches = async (
  profileKey: string,
  userId: string,
  batchType?: 'image' | 'video' | 'mixed'
): Promise<GenerationBatch[]> => {
  let query = supabase
    .from('generation_batches')
    .select('*')
    .eq('user_id', userId)
    .eq('profile_key', profileKey);

  if (batchType) {
    query = query.eq('batch_type', batchType);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch generation batches: ${error.message}`);
  }

  return data || [];
};

export const getGenerationBatch = async (batchId: string): Promise<GenerationBatch | null> => {
  const { data, error } = await supabase
    .from('generation_batches')
    .select('*')
    .eq('id', batchId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch generation batch: ${error.message}`);
  }

  return data;
};

export const updateGenerationBatch = async (
  batchId: string,
  updates: Partial<Omit<GenerationBatch, 'id' | 'user_id' | 'profile_key' | 'created_at' | 'updated_at'>>
): Promise<GenerationBatch> => {
  const { data, error } = await supabase
    .from('generation_batches')
    .update(updates)
    .eq('id', batchId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update generation batch: ${error.message}`);
  }

  return data;
};

export const deleteGenerationBatch = async (batchId: string): Promise<void> => {
  const { error } = await supabase
    .from('generation_batches')
    .delete()
    .eq('id', batchId);

  if (error) {
    throw new Error(`Failed to delete generation batch: ${error.message}`);
  }
};

export const assignImagesToBatch = async (imageIds: string[], batchId: string): Promise<void> => {
  const { error } = await supabase
    .from('generated_images')
    .update({ batch_id: batchId })
    .in('id', imageIds);

  if (error) {
    throw new Error(`Failed to assign images to batch: ${error.message}`);
  }
};

export const assignVideosToBatch = async (videoIds: string[], batchId: string): Promise<void> => {
  const { error } = await supabase
    .from('clipped_videos')
    .update({ batch_id: batchId })
    .in('id', videoIds);

  if (error) {
    throw new Error(`Failed to assign videos to batch: ${error.message}`);
  }
};

export const removeImagesFromBatch = async (imageIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('generated_images')
    .update({ batch_id: null })
    .in('id', imageIds);

  if (error) {
    throw new Error(`Failed to remove images from batch: ${error.message}`);
  }
};

export const removeVideosFromBatch = async (videoIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('clipped_videos')
    .update({ batch_id: null })
    .in('id', videoIds);

  if (error) {
    throw new Error(`Failed to remove videos from batch: ${error.message}`);
  }
};

export const getBatchImages = async (batchId: string) => {
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch batch images: ${error.message}`);
  }

  return data || [];
};

export const getBatchVideos = async (batchId: string) => {
  const { data, error } = await supabase
    .from('clipped_videos')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch batch videos: ${error.message}`);
  }

  return data || [];
};
