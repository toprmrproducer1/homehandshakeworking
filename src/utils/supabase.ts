import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface GeneratedImage {
  id?: string;
  user_id: string;
  profile_key: string;
  inspiration_image_url?: string;
  prompt: string;
  generated_images: string[];
  viral_score?: number;
  batch_id?: string;
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
  const { error } = await supabase
    .from('generated_images')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete generated image: ${error.message}`);
  }
};