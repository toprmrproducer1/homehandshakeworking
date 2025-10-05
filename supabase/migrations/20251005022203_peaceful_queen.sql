/*
  # Fix RLS policies for generated_images table

  1. Security Updates
    - Drop existing policies that may be using incorrect JWT functions
    - Create new policies using proper auth.uid() function
    - Ensure all CRUD operations work correctly for authenticated users

  2. Policy Changes
    - Users can insert their own generated images
    - Users can read their own generated images  
    - Users can update their own generated images
    - Users can delete their own generated images
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can read their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can update their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete their own generated images" ON generated_images;

-- Create new policies with correct auth.uid() function
CREATE POLICY "Users can insert their own generated images"
  ON generated_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can read their own generated images"
  ON generated_images
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own generated images"
  ON generated_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own generated images"
  ON generated_images
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);