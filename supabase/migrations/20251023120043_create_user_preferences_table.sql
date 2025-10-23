/*
  # Create User Preferences Table

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text, unique) - Clerk user ID
      - `profile_key` (text) - Ayrshare profile key
      - `theme_preference` (text) - User's theme choice: 'light', 'dark', or 'auto'
      - `notifications_email` (boolean) - Email notifications enabled
      - `notifications_push` (boolean) - Push notifications enabled
      - `notifications_posts` (boolean) - Post update notifications
      - `notifications_analytics` (boolean) - Analytics report notifications
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for authenticated users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  profile_key text,
  theme_preference text DEFAULT 'dark' NOT NULL,
  notifications_email boolean DEFAULT true,
  notifications_push boolean DEFAULT false,
  notifications_posts boolean DEFAULT true,
  notifications_analytics boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text)
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

COMMENT ON TABLE user_preferences IS 'Stores user preferences including theme and notification settings';
COMMENT ON COLUMN user_preferences.theme_preference IS 'User theme preference: light, dark, or auto';
