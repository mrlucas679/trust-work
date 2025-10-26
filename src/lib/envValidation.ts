/**
 * Environment variable validation and configuration
 * Validates required environment variables on app startup
 */

interface EnvConfig {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
}

class EnvironmentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentError';
    }
}

/**
 * Get environment variables with fallback for testing
 */
function getEnvVars(): Record<string, unknown> {
    // Check if we're in a test environment
    if (typeof globalThis !== 'undefined') {
        const globalWithImport = globalThis as typeof globalThis & {
            import?: { meta?: { env?: Record<string, unknown> } }
        };
        if (globalWithImport.import?.meta?.env) {
            return globalWithImport.import.meta.env;
        }
    }

    // Try to access import.meta safely
    try {
        return import.meta.env;
    } catch {
        // Fallback for testing environment
        return {};
    }
}/**
 * Validates and returns environment configuration
 * @throws {EnvironmentError} If required environment variables are missing
 */
export function validateEnvironment(): EnvConfig {
    const errors: string[] = [];
    const env = getEnvVars();

    const SUPABASE_URL = typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL : '';
    const SUPABASE_ANON_KEY = typeof env.VITE_SUPABASE_ANON_KEY === 'string' ? env.VITE_SUPABASE_ANON_KEY : '';

    if (!SUPABASE_URL) {
        errors.push('VITE_SUPABASE_URL is not defined');
    } else if (!isValidUrl(SUPABASE_URL)) {
        errors.push('VITE_SUPABASE_URL is not a valid URL');
    }

    if (!SUPABASE_ANON_KEY) {
        errors.push('VITE_SUPABASE_ANON_KEY is not defined');
    } else if (SUPABASE_ANON_KEY.length < 20) {
        errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
    }

    if (errors.length > 0) {
        const errorMessage = [
            '❌ Environment Configuration Error',
            '',
            'Missing or invalid environment variables:',
            ...errors.map(err => `  • ${err}`),
            '',
            '📝 To fix this:',
            '  1. Create a .env file in the project root',
            '  2. Add the following variables:',
            '     VITE_SUPABASE_URL=your_supabase_project_url',
            '     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key',
            '  3. Restart the development server',
            '',
            '💡 Get your Supabase credentials from:',
            '   https://app.supabase.com/project/_/settings/api',
        ].join('\n');

        throw new EnvironmentError(errorMessage);
    }

    return {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
    };
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Gets environment config with safe fallbacks (for testing)
 */
export function getEnvironment(): EnvConfig {
    const env = getEnvVars();
    return {
        SUPABASE_URL: typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL : '',
        SUPABASE_ANON_KEY: typeof env.VITE_SUPABASE_ANON_KEY === 'string' ? env.VITE_SUPABASE_ANON_KEY : '',
    };
}

/**
 * Checks if environment is properly configured
 */
export function isEnvironmentConfigured(): boolean {
    try {
        validateEnvironment();
        return true;
    } catch {
        return false;
    }
}
