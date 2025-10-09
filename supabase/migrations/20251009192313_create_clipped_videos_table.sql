/*
  # Create Clipped Videos Table

  1. New Tables
    - `clipped_videos`
      - `id` (uuid, primary key) - Unique identifier for each clipped video
      - `user_id` (text) - Clerk user ID who created the clip
      - `title` (text) - Title or name of the clipped video
      - `original_video_url` (text) - URL of the original source video
      - `clipped_video_url` (text) - URL of the processed/clipped video
      - `thumbnail_url` (text, nullable) - Thumbnail image URL for the clip
      - `duration` (integer, nullable) - Duration of the clip in seconds
      - `start_time` (integer, nullable) - Start time of the clip in the original video
      - `end_time` (integer, nullable) - End time of the clip in the original video
      - `status` (text) - Processing status: 'processing', 'completed', 'failed'
      - `metadata` (jsonb, nullable) - Additional metadata about the clip
      - `created_at` (timestamptz) - Timestamp when the clip was created
      - `updated_at` (timestamptz) - Timestamp when the clip was last updated

  2. Security
    - Enable RLS on `clipped_videos` table
    - Add policy for authenticated users to read their own clips
    - Add policy for authenticated users to insert their own clips
    - Add policy for authenticated users to update their own clips
    - Add policy for authenticated users to delete their own clips

  3. Indexes
    - Add index on `user_id` for faster user-specific queries
    - Add index on `created_at` for sorting by date
    - Add index on `status` for filtering by processing status
*/

CREATE TABLE IF NOT EXISTS clipped_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  original_video_url text NOT NULL,
  clipped_video_url text,
  thumbnail_url text,
  duration integer,
  start_time integer,
  end_time integer,
  status text NOT NULL DEFAULT 'processing',
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clipped_videos ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own clips
CREATE POLICY "Users can read own clipped videos"
  ON clipped_videos
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

-- Policy for users to insert their own clips
CREATE POLICY "Users can insert own clipped videos"
  ON clipped_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy for users to update their own clips
CREATE POLICY "Users can update own clipped videos"
  ON clipped_videos
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy for users to delete their own clips
CREATE POLICY "Users can delete own clipped videos"
  ON clipped_videos
  FOR DELETE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clipped_videos_user_id ON clipped_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_created_at ON clipped_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_status ON clipped_videos(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clipped_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_clipped_videos_updated_at_trigger ON clipped_videos;
CREATE TRIGGER update_clipped_videos_updated_at_trigger
  BEFORE UPDATE ON clipped_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_clipped_videos_updated_at();