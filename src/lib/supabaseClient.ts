import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getEnvironment } from './envValidation'

// Get environment variables (without validation for development flexibility)
const env = getEnvironment()

const SUPABASE_URL = env.SUPABASE_URL
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY

// Always log in test environment to debug initialization issues
console.log('🔍 [supabaseClient] Module loading (NODE_ENV:', process?.env?.NODE_ENV || 'unknown', ')');
console.log('  env.SUPABASE_URL:', env.SUPABASE_URL ? env.SUPABASE_URL.substring(0, 40) + '...' : '(empty)');
console.log('  env.SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? 'SET (' + env.SUPABASE_ANON_KEY.length + ' chars)' : '(empty)');

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

// Always log initialization to debug issues
console.log('🔍 [supabaseClient] Creating client');
console.log('  Using URL:', url.substring(0, 40) + '...');
console.log('  Using KEY:', key.substring(0, 20) + '... (' + key.length + ' chars)');

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

// Debug the created client
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
	console.log('🔍 [supabaseClient] Client created');
	console.log('  Client type:', typeof supabase);
	console.log('  Client.from type:', typeof supabase?.from);
	const testQuery = (supabase as any).from?.('test');
	console.log('  Test query type:', typeof testQuery);
	const testSelect = testQuery?.select?.('*');
	console.log('  Test select type:', typeof testSelect);
	console.log('  Test select.limit type:', typeof testSelect?.limit);
}

export default supabase
