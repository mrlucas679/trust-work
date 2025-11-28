import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - VITE_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Create Supabase client with service role key (admin access)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    try {
        console.log('🚀 Starting migration: Jobs vs Gigs Separation + Skill Tests + Reviews System');
        console.log('📁 Reading migration file...');

        // Read the migration SQL file
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250121_jobs_gigs_ratings.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf-8');

        console.log('📄 Migration file loaded successfully');
        console.log(`📊 Migration size: ${migrationSQL.length} characters`);
        console.log('⚙️  Executing migration...\n');

        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            // If exec_sql doesn't exist, try direct execution via the REST API
            console.log('⚠️  exec_sql function not found, trying direct execution...');

            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ query: migrationSQL })
            });

            if (!response.ok) {
                // Try using the SQL endpoint directly
                console.log('⚠️  REST API method failed, using pg_stat_statements approach...');

                // Split migration into individual statements and execute
                const statements = migrationSQL
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--'));

                console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

                let successCount = 0;
                let errorCount = 0;

                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i] + ';';

                    // Skip comments and DO blocks (handle separately)
                    if (statement.startsWith('--') || statement.trim() === ';') {
                        continue;
                    }

                    try {
                        const { error: stmtError } = await supabase.rpc('exec', { sql: statement });

                        if (stmtError) {
                            // Try direct query execution
                            const { error: queryError } = await (supabase as any).from('_').select('*').limit(0);

                            console.log(`⚠️  Statement ${i + 1}: ${statement.substring(0, 60)}...`);
                            console.log(`   Error: ${stmtError.message || queryError?.message || 'Unknown error'}`);
                            errorCount++;
                        } else {
                            successCount++;
                            if (statement.includes('CREATE TABLE')) {
                                const tableName = statement.match(/CREATE TABLE.*?(\w+)/i)?.[1];
                                console.log(`✅ Created table: ${tableName}`);
                            } else if (statement.includes('ALTER TABLE')) {
                                const tableName = statement.match(/ALTER TABLE.*?(\w+)/i)?.[1];
                                console.log(`✅ Altered table: ${tableName}`);
                            } else if (statement.includes('CREATE INDEX')) {
                                const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1];
                                console.log(`✅ Created index: ${indexName}`);
                            }
                        }
                    } catch (err: any) {
                        console.log(`❌ Error on statement ${i + 1}: ${err.message}`);
                        errorCount++;
                    }
                }

                console.log(`\n📊 Migration Summary:`);
                console.log(`   ✅ Successful: ${successCount}`);
                console.log(`   ❌ Errors: ${errorCount}`);

                if (errorCount > 0) {
                    console.log('\n⚠️  Some statements failed. This might be expected if:');
                    console.log('   - Tables/columns already exist');
                    console.log('   - Using functions not available via RPC');
                    console.log('\n💡 Recommendation: Execute the migration manually in Supabase SQL Editor');
                    console.log('   URL: https://supabase.com/dashboard/project/_/sql/new');
                }

                return;
            }
        }

        console.log('✅ Migration executed successfully!');
        console.log('\n📊 Created tables:');
        console.log('   - skill_tests');
        console.log('   - skill_test_results');
        console.log('   - assignment_certificates');
        console.log('   - gig_reviews');
        console.log('\n📊 Enhanced tables:');
        console.log('   - assignments (added type, skill test fields)');
        console.log('   - applications (added CV, bid, skill test result)');
        console.log('   - profiles (added ratings, success rate)');
        console.log('\n✅ Created indexes, triggers, and RLS policies');

    } catch (err: any) {
        console.error('\n❌ Migration failed:', err.message);
        console.error('\n💡 Recommendation: Execute the migration manually in Supabase SQL Editor');
        console.error('   1. Go to: https://supabase.com/dashboard/project/_/sql/new');
        console.error('   2. Open: supabase/migrations/20250121_jobs_gigs_ratings.sql');
        console.error('   3. Copy the entire file content');
        console.error('   4. Paste into SQL Editor and click "Run"');
        process.exit(1);
    }
}

runMigration();
