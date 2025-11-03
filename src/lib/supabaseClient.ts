import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getEnvironment } from './envValidation'

// Get environment variables (without validation for development flexibility)
const env = getEnvironment()

// Use dummy values if not configured (for development/testing)
const SUPABASE_URL = env.SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Warn if using invalid credentials
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
	console.warn('⚠️ Supabase credentials not configured. Using placeholder values. Some features may not work.')
	console.warn('Please add valid credentials to .env file:')
	console.warn('VITE_SUPABASE_URL=https://your-project.supabase.co')
	console.warn('VITE_SUPABASE_ANON_KEY=your-anon-key')
}

// Create a single supabase client for the whole app.
export const supabase: SupabaseClient = createClient(
	SUPABASE_URL,
	SUPABASE_ANON_KEY,
	{
		auth: {
			persistSession: !!env.SUPABASE_URL, // Only persist if valid config
			autoRefreshToken: !!env.SUPABASE_URL,
		}
	}
)

export default supabase
