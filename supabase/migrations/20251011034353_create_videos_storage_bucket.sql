/*
  # Create Videos Storage Bucket

  1. New Storage Bucket
    - Creates `videos` bucket for storing user-uploaded videos
    - Public bucket with read access for anyone
    - Allows uploads up to 10GB (Vizard's limit)
  
  2. Security
    - Authenticated users can upload videos to their own folders
    - Anyone can read videos (required for Vizard to access them)
    - Users can delete their own videos
  
  3. Configuration
    - File size limit: 10GB (10737418240 bytes)
    - Allowed MIME types: video/mp4, video/quicktime, video/x-msvideo, video/3gpp
*/

-- Create the videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  10737418240,
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/3gpp', 'video/avi', 'video/mov']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Users can upload videos to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read videos (required for Vizard API access)
CREATE POLICY "Anyone can read videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
