/**
 * Debug script to check database connection and RLS policies
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
    console.log('🔍 Debugging Supabase Connection...\n');

    // 1. Check authentication
    console.log('1️⃣ Checking authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
        console.log('❌ Auth error:', authError.message);
    } else if (!session) {
        console.log('⚠️  No active session (user not logged in)');
        console.log('   This is expected - the browser handles authentication');
    } else {
        console.log('✅ Logged in as:', session.user.email);
    }

    // 2. Test assignments table (without auth)
    console.log('\n2️⃣ Testing assignments table (public access)...');
    const { data: assignments, error: assignmentsError, count } = await supabase
        .from('assignments')
        .select('*', { count: 'exact' })
        .eq('status', 'open')
        .limit(5);

    if (assignmentsError) {
        console.log('❌ Assignments error:', assignmentsError.message);
        console.log('   Code:', assignmentsError.code);
        console.log('   Details:', assignmentsError.details);
        console.log('   Hint:', assignmentsError.hint);
    } else {
        console.log(`✅ Found ${count} open assignment(s)`);
        if (assignments && assignments.length > 0) {
            console.log('   Sample:', assignments[0].title);
        } else {
            console.log('   (No assignments posted yet - this is OK)');
        }
    }

    // 3. Test profiles table
    console.log('\n3️⃣ Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role, display_name')
        .limit(5);

    if (profilesError) {
        console.log('❌ Profiles error:', profilesError.message);
        console.log('   This might be due to RLS - users can only see their own profile');
    } else {
        console.log(`✅ Profiles table accessible (found ${profiles?.length || 0} profiles)`);
    }

    // 4. Test applications table
    console.log('\n4️⃣ Testing applications table...');
    const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('id')
        .limit(1);

    if (appsError) {
        console.log('❌ Applications error:', appsError.message);
    } else {
        console.log(`✅ Applications table accessible (${applications?.length || 0} applications)`);
    }

    // 5. Test messages table
    console.log('\n5️⃣ Testing messages table...');
    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

    if (messagesError) {
        console.log('❌ Messages error:', messagesError.message);
    } else {
        console.log(`✅ Messages table accessible (${messages?.length || 0} messages)`);
    }

    // 6. Test conversations table
    console.log('\n6️⃣ Testing conversations table...');
    const { data: conversations, error: convsError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1);

    if (convsError) {
        console.log('❌ Conversations error:', convsError.message);
    } else {
        console.log(`✅ Conversations table accessible (${conversations?.length || 0} conversations)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 Summary:');
    console.log('- If you see 400 errors in browser: Check if user is logged in');
    console.log('- If RLS errors: User might not have correct role in profile');
    console.log('- Empty results are OK for fresh database');
    console.log('='.repeat(60));
}

debugDatabase().catch(console.error);
