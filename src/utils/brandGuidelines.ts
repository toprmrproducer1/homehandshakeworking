import { supabase } from './supabase';

export interface BrandGuideline {
  id?: string;
  user_id: string;
  profile_key: string;
  guideline_name: string;
  brand_colors?: string[];
  brand_tone?: string;
  target_audience?: string;
  brand_values?: string;
  style_preferences?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const createBrandGuideline = async (
  data: Omit<BrandGuideline, 'id' | 'created_at' | 'updated_at'>
): Promise<BrandGuideline> => {
  const { data: result, error } = await supabase
    .from('brand_guidelines')
    .insert([{
      ...data,
      brand_colors: data.brand_colors || []
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create brand guideline: ${error.message}`);
  }

  return result;
};

export const getBrandGuidelines = async (
  profileKey: string,
  userId: string
): Promise<BrandGuideline[]> => {
  const { data, error } = await supabase
    .from('brand_guidelines')
    .select('*')
    .eq('user_id', userId)
    .eq('profile_key', profileKey)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch brand guidelines: ${error.message}`);
  }

  return data || [];
};

export const getDefaultBrandGuideline = async (
  profileKey: string,
  userId: string
): Promise<BrandGuideline | null> => {
  const { data, error } = await supabase
    .from('brand_guidelines')
    .select('*')
    .eq('user_id', userId)
    .eq('profile_key', profileKey)
    .eq('is_default', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch default brand guideline: ${error.message}`);
  }

  return data;
};

export const updateBrandGuideline = async (
  id: string,
  updates: Partial<Omit<BrandGuideline, 'id' | 'user_id' | 'profile_key' | 'created_at' | 'updated_at'>>
): Promise<BrandGuideline> => {
  const { data, error } = await supabase
    .from('brand_guidelines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update brand guideline: ${error.message}`);
  }

  return data;
};

export const deleteBrandGuideline = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('brand_guidelines')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete brand guideline: ${error.message}`);
  }
};

export const setDefaultBrandGuideline = async (id: string): Promise<BrandGuideline> => {
  return updateBrandGuideline(id, { is_default: true });
};
