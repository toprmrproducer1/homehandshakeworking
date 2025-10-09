/*
  # Create Generated Images Table

  1. New Tables
    - `generated_images`
      - `id` (uuid, primary key) - Unique identifier for each generated image
      - `user_id` (text) - Clerk user ID who generated the image
      - `profile_key` (text) - Ayrshare profile key
      - `prompt` (text) - The text prompt used to generate the image
      - `image_url` (text) - URL of the generated image
      - `thumbnail_url` (text, nullable) - Thumbnail version of the image
      - `width` (integer, nullable) - Image width in pixels
      - `height` (integer, nullable) - Image height in pixels
      - `style` (text, nullable) - Style or model used for generation
      - `status` (text) - Generation status: 'generating', 'completed', 'failed'
      - `metadata` (jsonb, nullable) - Additional metadata about the generation
      - `created_at` (timestamptz) - Timestamp when the image was created
      - `updated_at` (timestamptz) - Timestamp when the image was last updated

  2. Security
    - Enable RLS on `generated_images` table
    - Add policy for authenticated users to read their own images
    - Add policy for authenticated users to insert their own images
    - Add policy for authenticated users to update their own images
    - Add policy for authenticated users to delete their own images

  3. Indexes
    - Add index on `user_id` for faster user-specific queries
    - Add index on `profile_key` for faster profile-specific queries
    - Add index on `created_at` for sorting by date
    - Add index on `status` for filtering by generation status
*/

CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  prompt text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  width integer,
  height integer,
  style text,
  status text NOT NULL DEFAULT 'completed',
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own images
CREATE POLICY "Users can read own generated images"
  ON generated_images
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

-- Policy for users to insert their own images
CREATE POLICY "Users can insert own generated images"
  ON generated_images
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy for users to update their own images
CREATE POLICY "Users can update own generated images"
  ON generated_images
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy for users to delete their own images
CREATE POLICY "Users can delete own generated images"
  ON generated_images
  FOR DELETE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_profile_key ON generated_images(profile_key);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_status ON generated_images(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_generated_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_generated_images_updated_at_trigger ON generated_images;
CREATE TRIGGER update_generated_images_updated_at_trigger
  BEFORE UPDATE ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_images_updated_at();
