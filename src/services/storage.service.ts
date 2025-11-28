/**
 * @fileoverview Storage Service - File uploads with Supabase Storage
 */

import { supabase } from '@/lib/supabaseClient';

export type FileUploadOptions = {
  bucket: 'cvs' | 'portfolios' | 'attachments' | 'avatars';
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
};

const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: FileUploadOptions
): Promise<{ url: string; path: string }> {
  const { bucket, folder = '', maxSizeMB = DEFAULT_MAX_SIZE_MB, allowedTypes = DEFAULT_ALLOWED_TYPES } = options;

  // Validate file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = folder ? `${folder}/${user.id}/${fileName}` : `${user.id}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

/**
 * Get a signed URL for private file access
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * List files in a user's folder
 */
export async function listUserFiles(bucket: string, folder?: string): Promise<unknown[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const path = folder ? `${folder}/${user.id}` : user.id;

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) throw error;
  return data || [];
}

/**
 * Upload CV/Resume
 */
export async function uploadCV(file: File) {
  return uploadFile(file, {
    bucket: 'cvs',
    maxSizeMB: 5,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  });
}

/**
 * Upload portfolio item
 */
export async function uploadPortfolioItem(file: File) {
  return uploadFile(file, {
    bucket: 'portfolios',
    maxSizeMB: 15,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ],
  });
}

/**
 * Upload message attachment
 */
export async function uploadAttachment(file: File) {
  return uploadFile(file, {
    bucket: 'attachments',
    folder: 'messages',
    maxSizeMB: 10,
  });
}

/**
 * Upload profile avatar
 */
export async function uploadAvatar(file: File) {
  return uploadFile(file, {
    bucket: 'avatars',
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  });
}

/**
 * Create storage buckets if they don't exist
 */
export async function ensureStorageBuckets() {
  const buckets = ['cvs', 'portfolios', 'attachments', 'avatars'];

  for (const bucket of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucket);
    
    if (!existing) {
      await supabase.storage.createBucket(bucket, {
        public: bucket === 'avatars', // Avatars are public, rest are private
        fileSizeLimit: bucket === 'portfolios' ? 15728640 : 10485760, // 15MB for portfolios, 10MB for others
        allowedMimeTypes: 
          bucket === 'cvs' ? [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ] :
          bucket === 'avatars' ? [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
          ] : undefined,
      });
    }
  }
}
