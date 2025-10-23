import { supabase } from './supabase';

export interface UserPreferences {
  id: string;
  user_id: string;
  profile_key?: string;
  theme_preference: 'light' | 'dark' | 'auto';
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_posts: boolean;
  notifications_analytics: boolean;
  created_at: string;
  updated_at: string;
}

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return null;
  }
};

export const createUserPreferences = async (
  userId: string,
  profileKey?: string,
  preferences?: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        profile_key: profileKey,
        ...preferences
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserPreferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (
  userId: string,
  updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at'>>
): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    return null;
  }
};

export const upsertUserPreferences = async (
  userId: string,
  profileKey?: string,
  preferences?: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserPreferences | null> => {
  try {
    const existing = await getUserPreferences(userId);

    if (existing) {
      return await updateUserPreferences(userId, { ...preferences, profile_key: profileKey });
    } else {
      return await createUserPreferences(userId, profileKey, preferences);
    }
  } catch (error) {
    console.error('Error in upsertUserPreferences:', error);
    return null;
  }
};
