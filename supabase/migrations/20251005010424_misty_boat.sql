/*
  # Create generated images table

  1. New Tables
    - `generated_images`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth.users)
      - `profile_key` (text, for Ayrshare integration)
      - `inspiration_image_url` (text, optional URL of inspiration image)
      - `prompt` (text, the generation prompt)
      - `generated_images` (text array, URLs of generated images)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `generated_images` table
    - Add policy for authenticated users to manage their own generated images
    - Add policy for users to read their own generated images

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on profile_key for Ayrshare integration
    - Add index on created_at for chronological ordering
*/

CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  inspiration_image_url text,
  prompt text NOT NULL,
  generated_images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own generated images"
  ON generated_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can read their own generated images"
  ON generated_images
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own generated images"
  ON generated_images
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id)
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own generated images"
  ON generated_images
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_profile_key ON generated_images(profile_key);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_generated_images_updated_at
  BEFORE UPDATE ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();