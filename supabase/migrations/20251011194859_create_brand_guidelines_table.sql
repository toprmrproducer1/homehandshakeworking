/*
  # Create Brand Guidelines Table

  This migration creates a table to store brand guidelines that can be used to enhance AI prompts
  for image and video generation, ensuring consistent brand alignment.

  1. New Tables
    - `brand_guidelines`
      - `id` (uuid, primary key)
      - `user_id` (text) - Clerk user ID
      - `profile_key` (text) - Ayrshare profile key
      - `guideline_name` (text) - Name of the brand guideline template
      - `brand_colors` (jsonb) - Array of brand colors (hex codes)
      - `brand_tone` (text) - Brand voice/tone (formal, casual, playful, professional, etc.)
      - `target_audience` (text) - Description of target audience
      - `brand_values` (text) - Key brand values or messaging
      - `style_preferences` (text) - Style preferences (modern, vintage, minimalist, bold, etc.)
      - `is_default` (boolean) - Whether this is the default guideline for the user
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `brand_guidelines` table
    - Add policies for authenticated users to manage their own guidelines

  3. Indexes
    - Add index on user_id for fast lookups
    - Add index on profile_key for filtering
    - Add index on is_default for quick default guideline retrieval
*/

CREATE TABLE IF NOT EXISTS brand_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  guideline_name text NOT NULL,
  brand_colors jsonb DEFAULT '[]'::jsonb,
  brand_tone text,
  target_audience text,
  brand_values text,
  style_preferences text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_brand_guidelines_user_id ON brand_guidelines(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_profile_key ON brand_guidelines(profile_key);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_is_default ON brand_guidelines(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_created_at ON brand_guidelines(created_at DESC);

-- RLS Policies
CREATE POLICY "Users can view own brand guidelines"
  ON brand_guidelines
  FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can insert own brand guidelines"
  ON brand_guidelines
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can update own brand guidelines"
  ON brand_guidelines
  FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text)
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can delete own brand guidelines"
  ON brand_guidelines
  FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brand_guidelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brand_guidelines_updated_at
  BEFORE UPDATE ON brand_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_guidelines_updated_at();

-- Create function to ensure only one default guideline per user
CREATE OR REPLACE FUNCTION ensure_single_default_guideline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE brand_guidelines
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_guideline
  BEFORE INSERT OR UPDATE ON brand_guidelines
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_guideline();
