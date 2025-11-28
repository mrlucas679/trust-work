import 'dotenv/config';
import { supabase } from '../src/lib/supabaseClient';

async function verify() {
    console.log('Verifying messaging tables...\n');

    const tables = ['conversations', 'messages'];

    for (const t of tables) {
        const { error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
        console.log(error ? `❌ ${t}: ${error.message}` : `✅ ${t}: ${count || 0} rows`);
    }
}

verify();