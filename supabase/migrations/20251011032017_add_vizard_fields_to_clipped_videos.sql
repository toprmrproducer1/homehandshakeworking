/*
  # Add Vizard-Specific Fields to Clipped Videos Table

  1. New Columns
    - `vizard_project_id` (text, nullable) - Vizard project ID for tracking processing
    - `viral_score` (integer, nullable) - Viral potential score from Vizard (0-10)
    - `viral_reason` (text, nullable) - Explanation of why the clip might be viral
    - `related_topic` (text, nullable) - Topic or category identified by Vizard
    - `transcript` (text, nullable) - Full transcript of the video clip
    - `clip_editor_url` (text, nullable) - URL to edit the clip in Vizard
    - `video_ms_duration` (integer, nullable) - Duration in milliseconds
    - `parent_upload_id` (uuid, nullable) - Reference to parent upload for grouped clips
    - `clip_index` (integer, nullable) - Order index for clips from same source
    - `vizard_config` (jsonb, nullable) - Store Vizard configuration used for clipping

  2. Indexes
    - Add index on `vizard_project_id` for faster project-based queries
    - Add index on `parent_upload_id` for grouping related clips

  3. Notes
    - Using IF NOT EXISTS to prevent errors on existing columns
    - Backward compatible with existing clipped_videos records
    - Supports both legacy n8n workflow and new Vizard workflow
*/

-- Add vizard_project_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'vizard_project_id'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN vizard_project_id text;
  END IF;
END $$;

-- Add viral_score column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'viral_score'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN viral_score integer;
  END IF;
END $$;

-- Add viral_reason column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'viral_reason'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN viral_reason text;
  END IF;
END $$;

-- Add related_topic column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'related_topic'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN related_topic text;
  END IF;
END $$;

-- Add transcript column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'transcript'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN transcript text;
  END IF;
END $$;

-- Add clip_editor_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'clip_editor_url'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN clip_editor_url text;
  END IF;
END $$;

-- Add video_ms_duration column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'video_ms_duration'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN video_ms_duration integer;
  END IF;
END $$;

-- Add parent_upload_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'parent_upload_id'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN parent_upload_id uuid;
  END IF;
END $$;

-- Add clip_index column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'clip_index'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN clip_index integer;
  END IF;
END $$;

-- Add vizard_config column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'vizard_config'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN vizard_config jsonb;
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_clipped_videos_vizard_project_id ON clipped_videos(vizard_project_id);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_parent_upload_id ON clipped_videos(parent_upload_id);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_profile_key_status ON clipped_videos(profile_key, status);
CREATE INDEX IF NOT EXISTS idx_clipped_videos_profile_key_created ON clipped_videos(profile_key, created_at DESC);