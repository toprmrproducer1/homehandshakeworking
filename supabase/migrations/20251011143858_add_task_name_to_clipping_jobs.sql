/*
  # Add Task Name and Enhance Video Clipping Jobs Table

  1. Schema Changes
    - Add `task_name` column to store user-friendly task names
    - Add `vizard_share_link` column if not exists (for Vizard dashboard access)
    - Create index on `vizard_project_id` for faster task ID lookups
    - Create index on `task_name` for searching tasks by name

  2. Notes
    - task_name defaults to 'Clip - [timestamp]' format
    - vizard_share_link allows users to access their project in Vizard dashboard
    - Indexes improve performance when querying tasks by ID or name
*/

-- Add task_name column for user-friendly identification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_clipping_jobs' AND column_name = 'task_name'
  ) THEN
    ALTER TABLE video_clipping_jobs ADD COLUMN task_name text;
  END IF;
END $$;

-- Add vizard_share_link column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_clipping_jobs' AND column_name = 'vizard_share_link'
  ) THEN
    ALTER TABLE video_clipping_jobs ADD COLUMN vizard_share_link text;
  END IF;
END $$;

-- Create index on vizard_project_id for fast task ID lookups
CREATE INDEX IF NOT EXISTS idx_video_clipping_jobs_vizard_project_id 
  ON video_clipping_jobs(vizard_project_id);

-- Create index on task_name for searching
CREATE INDEX IF NOT EXISTS idx_video_clipping_jobs_task_name 
  ON video_clipping_jobs(task_name);

-- Update existing records to have task names if they don't have one
UPDATE video_clipping_jobs 
SET task_name = 'Clip - ' || to_char(created_at, 'MM/DD/YYYY, HH:MI:SS AM')
WHERE task_name IS NULL OR task_name = '';