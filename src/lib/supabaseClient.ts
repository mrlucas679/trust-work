import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getEnvironment } from './envValidation'

// Get environment variables (without validation for development flexibility)
const env = getEnvironment()

const SUPABASE_URL = env.SUPABASE_URL
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY

// Warn if using missing credentials
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.warn('⚠️ Supabase credentials not configured. Some features may not work until you set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Create a single supabase client for the whole app.
export const supabase: SupabaseClient = createClient(
	SUPABASE_URL || '',
	SUPABASE_ANON_KEY || '',
	{
		auth: {
			// Only persist if valid config is provided
			persistSession: !!SUPABASE_URL && !!SUPABASE_ANON_KEY,
			autoRefreshToken: !!SUPABASE_URL && !!SUPABASE_ANON_KEY,
		}
	}
)

export default supabase
