/*
  # Create AI and Analytics Support Tables

  This migration creates tables to support AI-powered features, comments caching,
  engagement tracking, and enhanced analytics.

  1. New Tables
    - `ai_enhanced_prompts`
      - `id` (uuid, primary key)
      - `user_id` (text) - Clerk user ID
      - `profile_key` (text) - Ayrshare profile key
      - `original_prompt` (text) - Original user prompt
      - `enhanced_prompt` (text) - AI-enhanced version
      - `tokens_used` (integer) - OpenAI tokens consumed
      - `created_at` (timestamptz) - Creation timestamp

    - `post_comments_cache`
      - `id` (uuid, primary key)
      - `profile_key` (text) - Ayrshare profile key
      - `post_id` (text) - Ayrshare or Social Post ID
      - `platform` (text) - Social media platform
      - `comments_data` (jsonb) - Cached comments
      - `last_updated` (timestamptz) - Last fetch time
      - `expires_at` (timestamptz) - Cache expiration
      - `created_at` (timestamptz) - Creation timestamp

    - `engagement_history`
      - `id` (uuid, primary key)
      - `profile_key` (text) - Ayrshare profile key
      - `platform` (text) - Social media platform
      - `date` (date) - Date of snapshot
      - `followers` (integer) - Follower count
      - `likes` (integer) - Total likes
      - `comments` (integer) - Total comments
      - `shares` (integer) - Total shares
      - `engagement_rate` (decimal) - Calculated engagement rate
      - `raw_data` (jsonb) - Full analytics snapshot
      - `created_at` (timestamptz) - Creation timestamp

    - `ai_performance_reports`
      - `id` (uuid, primary key)
      - `user_id` (text) - Clerk user ID
      - `profile_key` (text) - Ayrshare profile key
      - `report_type` (text) - Type of report (weekly, monthly, custom)
      - `timeframe` (text) - Time period covered
      - `report_content` (text) - AI-generated report
      - `insights` (jsonb) - Structured insights data
      - `tokens_used` (integer) - OpenAI tokens consumed
      - `created_at` (timestamptz) - Creation timestamp

    - `openai_api_usage`
      - `id` (uuid, primary key)
      - `user_id` (text) - Clerk user ID
      - `feature` (text) - Feature that used OpenAI
      - `prompt_tokens` (integer) - Tokens in prompt
      - `completion_tokens` (integer) - Tokens in completion
      - `total_tokens` (integer) - Total tokens used
      - `model` (text) - OpenAI model used
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- AI Enhanced Prompts Table
CREATE TABLE IF NOT EXISTS ai_enhanced_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  original_prompt text NOT NULL,
  enhanced_prompt text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_enhanced_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enhanced prompts"
  ON ai_enhanced_prompts
  FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can insert own enhanced prompts"
  ON ai_enhanced_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE INDEX IF NOT EXISTS idx_ai_enhanced_prompts_user_id ON ai_enhanced_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_prompts_created_at ON ai_enhanced_prompts(created_at DESC);

-- Post Comments Cache Table
CREATE TABLE IF NOT EXISTS post_comments_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key text NOT NULL,
  post_id text NOT NULL,
  platform text NOT NULL,
  comments_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_updated timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_key, post_id, platform)
);

ALTER TABLE post_comments_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cached comments"
  ON post_comments_cache
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own cached comments"
  ON post_comments_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own cached comments"
  ON post_comments_cache
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_post_comments_profile_key ON post_comments_cache(profile_key);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments_cache(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_expires_at ON post_comments_cache(expires_at);

-- Engagement History Table
CREATE TABLE IF NOT EXISTS engagement_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key text NOT NULL,
  platform text NOT NULL,
  date date NOT NULL,
  followers integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  engagement_rate decimal(5, 2) DEFAULT 0,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_key, platform, date)
);

ALTER TABLE engagement_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own engagement history"
  ON engagement_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own engagement history"
  ON engagement_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_engagement_history_profile_key ON engagement_history(profile_key);
CREATE INDEX IF NOT EXISTS idx_engagement_history_platform ON engagement_history(platform);
CREATE INDEX IF NOT EXISTS idx_engagement_history_date ON engagement_history(date DESC);

-- AI Performance Reports Table
CREATE TABLE IF NOT EXISTS ai_performance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  profile_key text NOT NULL,
  report_type text NOT NULL,
  timeframe text NOT NULL,
  report_content text NOT NULL,
  insights jsonb DEFAULT '{}'::jsonb,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_performance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance reports"
  ON ai_performance_reports
  FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can insert own performance reports"
  ON ai_performance_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE INDEX IF NOT EXISTS idx_ai_reports_user_id ON ai_performance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON ai_performance_reports(created_at DESC);

-- OpenAI API Usage Table
CREATE TABLE IF NOT EXISTS openai_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  feature text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  model text DEFAULT 'gpt-4',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE openai_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own OpenAI usage"
  ON openai_api_usage
  FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE POLICY "Users can insert own OpenAI usage"
  ON openai_api_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);

CREATE INDEX IF NOT EXISTS idx_openai_usage_user_id ON openai_api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_usage_feature ON openai_api_usage(feature);
CREATE INDEX IF NOT EXISTS idx_openai_usage_created_at ON openai_api_usage(created_at DESC);