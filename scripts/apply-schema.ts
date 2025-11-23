import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
    console.log('🔧 Applying database schema...\n');
    console.log(`URL: ${supabaseUrl}`);
    console.log('-----------------------------------\n');

    try {
        // Read the schema file
        const schemaPath = join(process.cwd(), 'supabase', 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        // Execute the schema SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

        if (error) {
            // If exec_sql doesn't exist, we need to use the Supabase management API
            // or apply via the dashboard. Let's try direct execution instead.
            console.log('⚠️  Cannot execute via RPC. Please apply the schema manually:\n');
            console.log('1. Go to: https://sojjizqahgphybdijqaj.supabase.co/project/_/sql');
            console.log('2. Copy the contents of supabase/schema.sql');
            console.log('3. Paste and run in the SQL Editor\n');
            console.log('Or use the Supabase CLI: supabase db push\n');
            process.exit(1);
        }

        console.log('✅ Schema applied successfully!');
        console.log('\nYou can now run: npx tsx scripts/check-profiles.ts');
    } catch (error) {
        console.error('❌ Error applying schema:', error);
        process.exit(1);
    }
}

applySchema();
