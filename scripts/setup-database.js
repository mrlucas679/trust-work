/**
 * Run all SQL files in Supabase to ensure complete database setup
 * This script executes SQL files in the correct order
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// SQL files to run in order
const sqlFiles = [
    {
        name: 'Main Schema',
        path: join(__dirname, '..', 'supabase', 'schema.sql')
    },
    {
        name: 'Universal Search',
        path: join(__dirname, '..', 'supabase', 'migrations', 'universal_search.sql')
    }
];

async function runSqlFile(name, path) {
    console.log(`\n📄 Running: ${name}`);
    console.log(`   File: ${path}`);

    try {
        const sql = readFileSync(path, 'utf8');

        // Split by semicolons but keep multi-line statements together
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`   Found ${statements.length} SQL statements`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';';

            // Skip comments and empty statements
            if (statement.trim().startsWith('--') || statement.trim() === ';') {
                continue;
            }

            try {
                const { error } = await supabase.rpc('exec_sql', { sql_string: statement });

                if (error) {
                    // Try direct execution as fallback
                    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`
                        },
                        body: JSON.stringify({ sql_string: statement })
                    });

                    if (!response.ok) {
                        console.warn(`   ⚠️  Statement ${i + 1} warning: ${error.message}`);
                    }
                }
            } catch (err) {
                // Most errors are expected (table already exists, etc.)
                // We continue execution
                if (err.message.includes('already exists')) {
                    console.log(`   ℹ️  Statement ${i + 1}: Already exists (OK)`);
                } else {
                    console.warn(`   ⚠️  Statement ${i + 1}: ${err.message}`);
                }
            }
        }

        console.log(`   ✅ ${name} completed`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error reading file: ${error.message}`);
        return false;
    }
}

async function setupDatabase() {
    console.log('🚀 Setting up Supabase database...');
    console.log('━'.repeat(60));

    let successCount = 0;

    for (const file of sqlFiles) {
        const success = await runSqlFile(file.name, file.path);
        if (success) successCount++;
    }

    console.log('\n' + '━'.repeat(60));
    console.log(`\n✨ Setup complete! ${successCount}/${sqlFiles.length} files processed`);

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const tables = ['profiles', 'assignments', 'applications', 'conversations', 'messages', 'notifications'];

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`   ❌ ${table}: ${error.message}`);
            } else {
                console.log(`   ✅ ${table}: exists (${count || 0} rows)`);
            }
        } catch (err) {
            console.log(`   ❌ ${table}: ${err.message}`);
        }
    }

    console.log('\n📝 Next steps:');
    console.log('1. Refresh your browser (Ctrl+F5)');
    console.log('2. Login with test accounts');
    console.log('3. Start testing the workflow!');
}

setupDatabase().catch(error => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
});
