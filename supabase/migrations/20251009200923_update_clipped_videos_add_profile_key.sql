/*
  # Update Clipped Videos Table

  1. Changes
    - Add `profile_key` column to store Ayrshare profile key
    - Add `catbox_url` column for catbox.moe URLs
    - Add `file_size` column for video file size
    - Add indexes for efficient querying

  2. Notes
    - Using IF NOT EXISTS to prevent errors on existing columns
    - Indexes help with sorting and filtering by date and user
*/

-- Add profile_key column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'profile_key'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN profile_key text;
  END IF;
END $$;

-- Add catbox_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'catbox_url'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN catbox_url text;
  END IF;
END $$;

-- Add file_size column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN file_size bigint;
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_clipped_videos_user_id ON clipped_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_profile_key ON clipped_videos(profile_key);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_created_at ON clipped_videos(created_at DESC);