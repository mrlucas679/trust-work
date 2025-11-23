/**
 * Quick script to verify database tables exist
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('🔍 Checking database tables...\n');

    const tables = [
        'profiles',
        'assignments',
        'applications',
        'conversations',
        'messages',
        'notifications'
    ];

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: exists (${count || 0} rows)`);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
        }
    }

    console.log('\n✨ Check complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)');
    console.log('2. Clear browser cache if needed');
    console.log('3. Try loading the pages again');
}

checkTables().catch(console.error);
