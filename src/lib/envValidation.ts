/**
 * Environment configuration
 */
export interface EnvironmentConfig {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
}

/**
 * Get environment variables without validation
 */
export function getEnvironment(): EnvironmentConfig {
    return {
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
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