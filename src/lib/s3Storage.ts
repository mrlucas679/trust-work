/**
 * S3-Compatible Storage Configuration for Supabase Storage
 * 
 * This module provides S3 protocol configuration for connecting to Supabase Storage.
 * Use this when you need S3-compatible client libraries or tools.
 * 
 * For standard file uploads in the app, use storage.ts (uploadCv function).
 */

import supabase from './supabaseClient'

/**
 * S3 Configuration for Supabase Storage
 * 
 * Use these settings with any S3-compatible client:
 * - AWS SDK for JavaScript
 * - MinIO Client
 * - s3cmd
 * - Cyberduck
 * - Other S3-compatible tools
 */
export const s3Config = {
    endpoint: import.meta.env.VITE_SUPABASE_S3_ENDPOINT ||
        'https://sojjizqahgphybdijqaj.storage.supabase.co/storage/v1/s3',
    region: import.meta.env.VITE_SUPABASE_S3_REGION || 'eu-north-1',
    bucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'resumes',
    // Note: For S3 protocol access, you'll need to use service_role key
    // Client-side S3 access should go through your backend for security
} as const

/**
 * Storage bucket configuration
 */
export const STORAGE_BUCKETS = {
    RESUMES: 'resumes',
    AVATARS: 'avatars',
    COMPANY_LOGOS: 'company-logos',
    ATTACHMENTS: 'attachments',
} as const

/**
 * Get the public URL for a file in storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL for the file
 */
export function getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

/**
 * Get a signed URL for private files (valid for specified duration)
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - Time in seconds until URL expires (default: 3600 = 1 hour)
 * @returns The signed URL
 */
export async function getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

    if (error) throw error
    return data.signedUrl
}

/**
 * Upload a file to storage
 * @param bucket - The storage bucket name
 * @param path - The destination path in the bucket
 * @param file - The file to upload
 * @param options - Upload options
 * @returns The path and public URL of the uploaded file
 */
export async function uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: {
        cacheControl?: string
        contentType?: string
        upsert?: boolean
    }
): Promise<{ path: string; url: string }> {
    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: options?.cacheControl || '3600',
            contentType: options?.contentType || file.type,
            upsert: options?.upsert ?? true,
        })

    if (error) {
        // Provide helpful error for missing bucket
        if (error.message?.toLowerCase().includes('bucket')) {
            throw new Error(
                `Storage bucket '${bucket}' not found. ` +
                'Create it in Supabase Dashboard: Storage > Create bucket'
            )
        }
        throw error
    }

    const url = getPublicUrl(bucket, path)
    return { path, url }
}

/**
 * Delete a file from storage
 * @param bucket - The storage bucket name
 * @param paths - File path(s) to delete
 */
export async function deleteFile(bucket: string, paths: string | string[]): Promise<void> {
    const pathArray = Array.isArray(paths) ? paths : [paths]
    const { error } = await supabase.storage.from(bucket).remove(pathArray)
    if (error) throw error
}

/**
 * List files in a storage bucket folder
 * @param bucket - The storage bucket name
 * @param path - The folder path (empty string for root)
 * @param options - List options
 * @returns Array of file objects
 */
export async function listFiles(
    bucket: string,
    path: string = '',
    options?: {
        limit?: number
        offset?: number
        sortBy?: { column: string; order: 'asc' | 'desc' }
    }
) {
    const { data, error } = await supabase.storage.from(bucket).list(path, options)
    if (error) throw error
    return data
}

/**
 * Move/rename a file within a bucket
 * @param bucket - The storage bucket name
 * @param fromPath - Current file path
 * @param toPath - New file path
 */
export async function moveFile(
    bucket: string,
    fromPath: string,
    toPath: string
): Promise<void> {
    const { error } = await supabase.storage.from(bucket).move(fromPath, toPath)
    if (error) throw error
}

/**
 * Copy a file within a bucket
 * @param bucket - The storage bucket name
 * @param fromPath - Source file path
 * @param toPath - Destination file path
 */
export async function copyFile(
    bucket: string,
    fromPath: string,
    toPath: string
): Promise<void> {
    const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath)
    if (error) throw error
}

/**
 * Download a file as a blob
 * @param bucket - The storage bucket name
 * @param path - The file path
 * @returns The file as a Blob
 */
export async function downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await supabase.storage.from(bucket).download(path)
    if (error) throw error
    return data
}

export default {
    s3Config,
    STORAGE_BUCKETS,
    getPublicUrl,
    getSignedUrl,
    uploadFile,
    deleteFile,
    listFiles,
    moveFile,
    copyFile,
    downloadFile,
}
