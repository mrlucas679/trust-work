/**
 * Verify Supabase Database Setup
 * Run this to check if all tables exist and are accessible
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sojjizqahgphybdijqaj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvamppenFhaGdwaHliZGlqcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjMyOTksImV4cCI6MjA3Njk5OTI5OX0.WAcN8WVvs1_hTb6zW7IDS95GeBI-U6LbfL1ErQb74ng';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyTables() {
    console.log('🔍 Verifying Supabase Database Setup...\n');

    const tables = [
        'profiles',
        'assignments',
        'applications',
        'conversations',
        'messages',
        'notifications',
        'business_verifications',
        'jobs'
    ];

    const results = {
        success: [],
        failed: []
    };

    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('id')
                .limit(1);

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
                results.failed.push({ table, error: error.message });
            } else {
                console.log(`✅ ${table}: Accessible`);
                results.success.push(table);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            results.failed.push({ table, error: err instanceof Error ? err.message : 'Unknown error' });
        }
    }

    console.log('\n📊 Summary:');
    console.log(`  ✅ Working: ${results.success.length}/${tables.length}`);
    console.log(`  ❌ Failed: ${results.failed.length}/${tables.length}`);

    if (results.failed.length > 0) {
        console.log('\n⚠️  Failed Tables:');
        results.failed.forEach(({ table, error }) => {
            console.log(`  - ${table}: ${error}`);
        });
        console.log('\n💡 Fix: Run the SQL schema in Supabase Dashboard');
        console.log('   1. Go to: https://app.supabase.com/project/sojjizqahgphybdijqaj/editor');
        console.log('   2. Click "SQL Editor"');
        console.log('   3. Copy contents of supabase/schema.sql');
        console.log('   4. Paste and click "Run"');
        process.exit(1);
    } else {
        console.log('\n✅ All tables are accessible!');
        process.exit(0);
    }
}

verifyTables().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
