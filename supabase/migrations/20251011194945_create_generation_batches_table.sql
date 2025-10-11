/*
  # Create Generation Batches Table

  This migration creates a table to group related content generations (images/videos) into batches
  for better organization and management.

  1. New Tables
    - `generation_batches`
      - `id` (uuid, primary key)
      - `user_id` (text) - Clerk user ID
      - `profile_key` (text) - Ayrshare profile key
      - `batch_name` (text) - Name of the batch
      - `batch_type` (text) - Type of content: image, video, or mixed
      - `item_count` (integer) - Number of items in this batch
      - `average_viral_score` (numeric) - Average viral score of items in batch
      - `created_at` (timestamptz) - Batch creation time
      - `updated_at` (timestamptz) - Last update time

  2. Table Updates
    - Add `batch_id` column to `generated_images` table
    - Add `batch_id` column to `clipped_videos` table
    - Add `viral_score` column to `generated_images` table

  3. Security
    - Enable RLS on `generation_batches` table
    - Add policies for authenticated users to manage their own batches

  4. Indexes
    - Add indexes for efficient querying and sorting
*/

CREATE TABLE IF NOT EXISTS generation_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  batch_name text NOT NULL,
  batch_type text NOT NULL DEFAULT 'mixed',
  item_count integer DEFAULT 0,
  average_viral_score numeric(3, 1) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT batch_type_check CHECK (batch_type IN ('image', 'video', 'mixed'))
);

ALTER TABLE generation_batches ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_generation_batches_user_id ON generation_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_batches_profile_key ON generation_batches(profile_key);
CREATE INDEX IF NOT EXISTS idx_generation_batches_batch_type ON generation_batches(batch_type);
CREATE INDEX IF NOT EXISTS idx_generation_batches_created_at ON generation_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_batches_viral_score ON generation_batches(average_viral_score DESC);

-- Add batch_id and viral_score to generated_images if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_images' AND column_name = 'batch_id'
  ) THEN
    ALTER TABLE generated_images ADD COLUMN batch_id uuid REFERENCES generation_batches(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_generated_images_batch_id ON generated_images(batch_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_images' AND column_name = 'viral_score'
  ) THEN
    ALTER TABLE generated_images ADD COLUMN viral_score numeric(3, 1) DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_generated_images_viral_score ON generated_images(viral_score DESC);
  END IF;
END $$;

-- Add batch_id to clipped_videos if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'batch_id'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN batch_id uuid REFERENCES generation_batches(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_clipped_videos_batch_id ON clipped_videos(batch_id);
  END IF;
END $$;

-- RLS Policies for generation_batches
CREATE POLICY "Users can view own generation batches"
  ON generation_batches
  FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can insert own generation batches"
  ON generation_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can update own generation batches"
  ON generation_batches
  FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text)
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can delete own generation batches"
  ON generation_batches
  FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_generation_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_generation_batches_updated_at
  BEFORE UPDATE ON generation_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_generation_batches_updated_at();

-- Create function to auto-update batch statistics
CREATE OR REPLACE FUNCTION update_batch_statistics()
RETURNS TRIGGER AS $$
DECLARE
  batch_uuid uuid;
  img_count integer;
  vid_count integer;
  total_count integer;
  avg_score numeric;
BEGIN
  batch_uuid := COALESCE(NEW.batch_id, OLD.batch_id);
  
  IF batch_uuid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Count images in batch
  SELECT COUNT(*), COALESCE(AVG(viral_score), 0)
  INTO img_count, avg_score
  FROM generated_images
  WHERE batch_id = batch_uuid;

  -- Count videos in batch
  SELECT COUNT(*)
  INTO vid_count
  FROM clipped_videos
  WHERE batch_id = batch_uuid;

  total_count := img_count + vid_count;

  -- Update batch statistics
  UPDATE generation_batches
  SET 
    item_count = total_count,
    average_viral_score = avg_score
  WHERE id = batch_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update batch statistics when items are added/removed/updated
CREATE TRIGGER trigger_update_batch_stats_on_image_insert
  AFTER INSERT ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_statistics();

CREATE TRIGGER trigger_update_batch_stats_on_image_update
  AFTER UPDATE ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_statistics();

CREATE TRIGGER trigger_update_batch_stats_on_image_delete
  AFTER DELETE ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_statistics();

CREATE TRIGGER trigger_update_batch_stats_on_video_insert
  AFTER INSERT ON clipped_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_statistics();

CREATE TRIGGER trigger_update_batch_stats_on_video_update
  AFTER UPDATE ON clipped_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_statistics();

CREATE TRIGGER trigger_update_batch_stats_on_video_delete
  AFTER DELETE ON clipped_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_statistics();
