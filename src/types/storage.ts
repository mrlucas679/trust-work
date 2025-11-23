/**
 * Storage type definitions for TrustWork
 */

/**
 * S3 configuration for Supabase Storage
 */
export interface S3Config {
    endpoint: string
    region: string
    bucket: string
}

/**
 * Storage bucket names
 */
export type StorageBucket = 'resumes' | 'avatars' | 'company-logos' | 'attachments'

/**
 * Upload result from storage operations
 */
export interface UploadResult {
    path: string
    url: string
}

/**
 * File upload options
 */
export interface UploadOptions {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
}

/**
 * File metadata from storage
 */
export interface StorageFileMetadata {
    id: string
    name: string
    bucket_id: string
    owner?: string
    created_at: string
    updated_at: string
    last_accessed_at: string
    metadata?: Record<string, unknown>
}

/**
 * List files options
 */
export interface ListFilesOptions {
    limit?: number
    offset?: number
    sortBy?: {
        column: string
        order: 'asc' | 'desc'
    }
    search?: string
}

/**
 * Storage error types
 */
export type StorageError =
    | 'BUCKET_NOT_FOUND'
    | 'FILE_NOT_FOUND'
    | 'UPLOAD_FAILED'
    | 'DELETE_FAILED'
    | 'PERMISSION_DENIED'
    | 'FILE_SIZE_EXCEEDED'
    | 'INVALID_MIME_TYPE'
    | 'UNAUTHORIZED'

/**
 * Storage operation result
 */
export interface StorageResult<T = unknown> {
    data?: T
    error?: {
        type: StorageError
        message: string
    }
}

/**
 * File validation rules
 */
export interface FileValidationRules {
    maxSize: number // in bytes
    allowedMimeTypes: string[]
    allowedExtensions?: string[]
}

/**
 * Bucket configuration
 */
export interface BucketConfig {
    name: StorageBucket
    public: boolean
    fileSizeLimit: number
    allowedMimeTypes: string[]
    allowedExtensions?: string[]
}

/**
 * Pre-defined bucket configurations
 */
export const BUCKET_CONFIGS: Record<StorageBucket, BucketConfig> = {
    resumes: {
        name: 'resumes',
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        allowedExtensions: ['.pdf', '.doc', '.docx'],
    },
    avatars: {
        name: 'avatars',
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    },
    'company-logos': {
        name: 'company-logos',
        public: true,
        fileSizeLimit: 3 * 1024 * 1024, // 3MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    },
    attachments: {
        name: 'attachments',
        public: true,
        fileSizeLimit: 20 * 1024 * 1024, // 20MB
        allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'],
    },
}

/**
 * Validate file against bucket rules
 */
export function validateFile(file: File, bucket: StorageBucket): { valid: boolean; error?: string } {
    const config = BUCKET_CONFIGS[bucket]

    // Check file size
    if (file.size > config.fileSizeLimit) {
        const maxSizeMB = (config.fileSizeLimit / (1024 * 1024)).toFixed(0)
        return {
            valid: false,
            error: `File size exceeds limit of ${maxSizeMB}MB`,
        }
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedExtensions?.join(', ') || 'See bucket config'}`,
        }
    }

    // Check extension if defined
    if (config.allowedExtensions) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!config.allowedExtensions.includes(ext)) {
            return {
                valid: false,
                error: `File extension ${ext} is not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`,
            }
        }
    }

    return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9_.-]/g, '_')
}
