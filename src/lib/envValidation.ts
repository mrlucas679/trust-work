/**
 * Environment configuration
 */
export interface EnvironmentConfig {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
}

/**
 * S3 Storage configuration (optional)
 */
export interface S3StorageConfig {
    S3_ENDPOINT?: string
    S3_REGION?: string
    STORAGE_BUCKET?: string
}

/**
 * Full environment configuration including optional S3
 */
export interface FullEnvironmentConfig extends EnvironmentConfig, S3StorageConfig { }

/**
 * Get environment variables without validation
 * Works in both Vite (import.meta.env) and Jest (globalThis['import.meta'].env) environments
 */
export function getEnvironment(): FullEnvironmentConfig {
    // In Jest, import.meta is polyfilled on globalThis
    // In Vite/browser, it's available directly
    const env = (globalThis as any)['import.meta']?.env || import.meta?.env || {};
    
    return {
        SUPABASE_URL: env.VITE_SUPABASE_URL || '',
        SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || '',
        S3_ENDPOINT: env.VITE_SUPABASE_S3_ENDPOINT,
        S3_REGION: env.VITE_SUPABASE_S3_REGION,
        STORAGE_BUCKET: env.VITE_SUPABASE_STORAGE_BUCKET,
    }
}

/**
 * Check if S3 storage is configured (optional feature)
 */
export function isS3Configured(): boolean {
    const endpoint = import.meta.env.VITE_SUPABASE_S3_ENDPOINT
    const region = import.meta.env.VITE_SUPABASE_S3_REGION
    return !!(endpoint && region)
}

/**
 * Get S3 configuration if available
 */
export function getS3Config(): S3StorageConfig | null {
    if (!isS3Configured()) return null
    return {
        S3_ENDPOINT: import.meta.env.VITE_SUPABASE_S3_ENDPOINT,
        S3_REGION: import.meta.env.VITE_SUPABASE_S3_REGION,
        STORAGE_BUCKET: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'resumes',
    }
}

/**
 * Validate environment variables and return config
 * @throws {Error} If environment variables are missing or invalid
 */
export function validateEnvironment(): EnvironmentConfig {
    const errors: string[] = []
    const env = getEnvironment()

    // Check for missing values
    if (!env.SUPABASE_URL) {
        errors.push('- VITE_SUPABASE_URL is not defined')
    }
    if (!env.SUPABASE_ANON_KEY) {
        errors.push('- VITE_SUPABASE_ANON_KEY is not defined')
    }

    // Validate URL format
    if (env.SUPABASE_URL) {
        try {
            new URL(env.SUPABASE_URL)
        } catch {
            errors.push('- VITE_SUPABASE_URL is not a valid URL')
        }
    }

    // Validate anon key format (should be a JWT-like string)
    if (env.SUPABASE_ANON_KEY && env.SUPABASE_ANON_KEY.length < 20) {
        errors.push('- VITE_SUPABASE_ANON_KEY appears to be invalid (too short)')
    }

    // If there are errors, throw with helpful message
    if (errors.length > 0) {
        const errorMessage = `
Environment Configuration Error:
${errors.join('\n')}

To fix this:
1. Create a .env file in the project root
2. Add the following variables:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
3. Restart the development server

Get your Supabase credentials from:
https://app.supabase.com/project/_/settings/api
    `.trim()

        throw new Error(errorMessage)
    }

    return env
}

/**
 * Check if environment is properly configured
 */
export function isEnvironmentConfigured(): boolean {
    try {
        validateEnvironment()
        return true
    } catch {
        return false
    }
}