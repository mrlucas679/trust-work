-- Supabase Storage Setup for TrustWork
-- This script creates the necessary storage bucket for CV uploads
-- Run this in the Supabase SQL editor AFTER running schema.sql

-- Note: Storage buckets can also be created via the Supabase Dashboard UI:
-- 1. Go to Storage in your Supabase project
-- 2. Click "Create bucket"
-- 3. Name: "resumes"
-- 4. Set as Public bucket (for MVP - can be locked down later)
-- 5. Configure CORS if needed

-- Create the resumes bucket (if it doesn't exist)
-- This uses the storage API which requires admin privileges
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,  -- Public bucket for MVP (can be changed to false for private access)
  10485760,  -- 10MB file size limit (10 * 1024 * 1024 bytes)
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the resumes bucket
-- Policy 1: Allow authenticated users to upload their own CVs
CREATE POLICY IF NOT EXISTS "Users can upload their own CVs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to update their own CVs
CREATE POLICY IF NOT EXISTS "Users can update their own CVs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow authenticated users to delete their own CVs
CREATE POLICY IF NOT EXISTS "Users can delete their own CVs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow public read access to CVs (for MVP)
-- Change this if you want to use signed URLs instead
CREATE POLICY IF NOT EXISTS "Public can read CVs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Note: For production, consider making the bucket private and using signed URLs
-- To do this:
-- 1. Set public = false in the bucket configuration
-- 2. Remove the "Public can read CVs" policy
-- 3. Update storage.ts to use getSignedUrl() instead of getPublicUrl()
