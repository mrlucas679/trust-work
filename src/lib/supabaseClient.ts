import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getEnvironment } from './envValidation'

// Get environment variables (without validation for development flexibility)
const env = getEnvironment()

const SUPABASE_URL = env.SUPABASE_URL
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY

// Check if credentials are properly configured
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.error('❌ Supabase credentials not found in environment variables!')
	console.error('Expected:')
	console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co')
	console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key')
	console.error('\nCurrent values:')
	console.error('  VITE_SUPABASE_URL:', SUPABASE_URL || '(empty)')
	console.error('  VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '(set but empty)' : '(empty)')
	console.error('\n⚠️ Using placeholder values - features requiring Supabase will not work!')
}

// Use placeholder values if credentials are missing (for development without backend)
const url = SUPABASE_URL || 'https://placeholder.supabase.co'
const key = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Create a single supabase client for the whole app.
export const supabase: SupabaseClient = createClient(
	url,
	key,
	{
		auth: {
			// Only persist if valid config is provided
			persistSession: !!SUPABASE_URL && !!SUPABASE_ANON_KEY,
			autoRefreshToken: !!SUPABASE_URL && !!SUPABASE_ANON_KEY,
		}
	}
)

export default supabase
