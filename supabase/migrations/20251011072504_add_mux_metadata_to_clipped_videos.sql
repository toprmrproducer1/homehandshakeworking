/*
  # Add Mux Video Metadata to Clipped Videos Table

  1. New Columns
    - `mux_playback_id` (text, nullable) - Mux playback ID for streaming
    - `mux_asset_id` (text, nullable) - Mux asset ID for management
    - `mux_stream_url` (text, nullable) - HLS stream URL from Mux
    - `mux_thumbnail_url` (text, nullable) - Thumbnail image URL from Mux
    - `upload_service` (text, nullable) - Service used for upload: 'supabase', 'cloudinary', or 'mux'

  2. Indexes
    - Add index on `mux_playback_id` for faster lookups
    - Add index on `mux_asset_id` for asset management queries
    - Add index on `upload_service` for filtering by service

  3. Notes
    - Using IF NOT EXISTS to prevent errors on existing columns
    - Backward compatible with existing records
    - Supports multiple video hosting services
*/

-- Add mux_playback_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'mux_playback_id'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN mux_playback_id text;
  END IF;
END $$;

-- Add mux_asset_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'mux_asset_id'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN mux_asset_id text;
  END IF;
END $$;

-- Add mux_stream_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'mux_stream_url'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN mux_stream_url text;
  END IF;
END $$;

-- Add mux_thumbnail_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'mux_thumbnail_url'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN mux_thumbnail_url text;
  END IF;
END $$;

-- Add upload_service column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'upload_service'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN upload_service text;
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_clipped_videos_mux_playback_id ON clipped_videos(mux_playback_id);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_mux_asset_id ON clipped_videos(mux_asset_id);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_upload_service ON clipped_videos(upload_service);
