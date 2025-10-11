/*
  # Add Vizard Share Links to Tables

  This migration adds the Vizard share link fields to allow users to view their projects in the Vizard dashboard.

  1. Changes to Tables
    - `video_clipping_jobs`
      - Add `vizard_share_link` (text, nullable) - URL to view the project in Vizard dashboard

    - `clipped_videos`
      - Add `vizard_share_link` (text, nullable) - URL to view the project in Vizard dashboard

  2. Indexes
    - Add indexes on the new columns for efficient filtering and querying

  3. Notes
    - These fields store the share link returned by Vizard API
    - The share link allows users to view and edit their projects in Vizard's web interface
    - Existing records will have NULL values, which is acceptable
*/

-- Add vizard_share_link to video_clipping_jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_clipping_jobs' AND column_name = 'vizard_share_link'
  ) THEN
    ALTER TABLE video_clipping_jobs ADD COLUMN vizard_share_link text;
  END IF;
END $$;

-- Add vizard_share_link to clipped_videos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clipped_videos' AND column_name = 'vizard_share_link'
  ) THEN
    ALTER TABLE clipped_videos ADD COLUMN vizard_share_link text;
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_video_clipping_jobs_share_link
  ON video_clipping_jobs(vizard_share_link)
  WHERE vizard_share_link IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clipped_videos_share_link
  ON clipped_videos(vizard_share_link)
  WHERE vizard_share_link IS NOT NULL;
