import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { validateEnvironment } from './envValidation'

// Validate environment variables on module load
let SUPABASE_URL = ''
let SUPABASE_ANON_KEY = ''

try {
	const env = validateEnvironment()
	SUPABASE_URL = env.SUPABASE_URL
	SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY
} catch (error) {
	// Log detailed error for development
	if (import.meta.env.DEV) {
		console.error(error instanceof Error ? error.message : 'Environment validation failed')
	} else {
		console.error('❌ Configuration Error: Missing Supabase credentials. Please check your environment variables.')
	}
}

// Create a single supabase client for the whole app.
export const supabase: SupabaseClient = createClient(
	SUPABASE_URL,
	SUPABASE_ANON_KEY
)

export default supabase
