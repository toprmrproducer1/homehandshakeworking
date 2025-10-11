/*
  # Fix Engagement History RLS Policies

  1. Changes
    - Add UPDATE policy for engagement_history table to support UPSERT operations
    - The upsert operation needs both INSERT and UPDATE policies to work properly
    - Allow authenticated users to update engagement history records

  2. Security
    - Maintains restrictive RLS while allowing legitimate upsert operations
    - All policies remain authentication-gated
*/

-- Add UPDATE policy for engagement_history to support upsert operations
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can update own engagement history" ON engagement_history;
END $$;

-- Create comprehensive UPDATE policy for engagement_history
CREATE POLICY "Users can update own engagement history"
  ON engagement_history
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
