/*
  # Create Video Clipping Jobs Table

  This migration creates a table to track video clipping jobs that are being processed by Vizard AI.

  1. New Tables
    - `video_clipping_jobs`
      - `id` (uuid, primary key)
      - `user_id` (text) - Clerk user ID
      - `profile_key` (text) - Ayrshare profile key
      - `vizard_project_id` (text) - Vizard project ID for tracking
      - `original_video_url` (text) - URL of the original video
      - `config` (jsonb) - Vizard configuration used
      - `status` (text) - processing, completed, failed
      - `progress_percent` (integer) - Processing progress 0-100
      - `error_message` (text, nullable) - Error message if failed
      - `clips_count` (integer, default 0) - Number of clips generated
      - `started_at` (timestamptz) - When processing started
      - `completed_at` (timestamptz, nullable) - When processing completed
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `video_clipping_jobs` table
    - Add policies for authenticated users to manage their own jobs
*/

CREATE TABLE IF NOT EXISTS video_clipping_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  vizard_project_id text NOT NULL,
  original_video_url text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'processing',
  progress_percent integer DEFAULT 0,
  error_message text,
  clips_count integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE video_clipping_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clipping jobs"
  ON video_clipping_jobs
  FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can insert own clipping jobs"
  ON video_clipping_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can update own clipping jobs"
  ON video_clipping_jobs
  FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text)
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can delete own clipping jobs"
  ON video_clipping_jobs
  FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE INDEX IF NOT EXISTS idx_video_clipping_jobs_user_id ON video_clipping_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_clipping_jobs_status ON video_clipping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_clipping_jobs_created_at ON video_clipping_jobs(created_at DESC);