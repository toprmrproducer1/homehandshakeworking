-- Create Image Generation Jobs Table
--
-- 1. New Tables
--    - image_generation_jobs
--      - id (uuid, primary key)
--      - user_id (text, references user)
--      - profile_key (text, references profile)
--      - inspiration_image_url (text, temporary URL of inspiration image)
--      - prompt (text, generation prompt)
--      - status (text, job status: pending/processing/completed/failed)
--      - generated_images (jsonb, array of generated image URLs)
--      - error_message (text, error details if failed)
--      - created_at (timestamptz, job creation time)
--      - updated_at (timestamptz, last update time)
--      - completed_at (timestamptz, completion time)
--
-- 2. Security
--    - Enable RLS on image_generation_jobs table
--    - Add policy for users to read their own jobs
--    - Add policy for users to create their own jobs
--    - Add policy for users to update their own jobs (for polling)
--
-- 3. Indexes
--    - Add index on user_id for fast lookups
--    - Add index on profile_key for filtering
--    - Add index on status for job queue queries
--    - Add composite index on user_id and status for efficient querying

-- Create the table
CREATE TABLE IF NOT EXISTS image_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  inspiration_image_url text,
  prompt text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  generated_images jsonb DEFAULT '[]'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Enable RLS
ALTER TABLE image_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_generation_jobs_user_id ON image_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_image_generation_jobs_profile_key ON image_generation_jobs(profile_key);
CREATE INDEX IF NOT EXISTS idx_image_generation_jobs_status ON image_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_image_generation_jobs_user_status ON image_generation_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_image_generation_jobs_created_at ON image_generation_jobs(created_at DESC);

-- RLS Policies

-- Users can read their own jobs
CREATE POLICY "Users can read own image generation jobs"
  ON image_generation_jobs
  FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can create their own jobs
CREATE POLICY "Users can create own image generation jobs"
  ON image_generation_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own jobs (needed for status polling updates from external services)
CREATE POLICY "Users can update own image generation jobs"
  ON image_generation_jobs
  FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own jobs
CREATE POLICY "Users can delete own image generation jobs"
  ON image_generation_jobs
  FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_image_generation_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status IN ('completed', 'failed') AND OLD.status NOT IN ('completed', 'failed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_image_generation_jobs_updated_at
  BEFORE UPDATE ON image_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_image_generation_jobs_updated_at();