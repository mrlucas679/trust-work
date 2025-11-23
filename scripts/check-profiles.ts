/**
 * Script to check profiles in Supabase database
 * Run with: npx tsx scripts/check-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

// Load from environment - require these to be set
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing required environment variables');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log('\n🔍 Checking Supabase Profiles...\n');
    console.log('URL:', supabaseUrl);
    console.log('-----------------------------------\n');

    try {
        // Get all profiles
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching profiles:', error.message);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('📭 No profiles found in database');
            return;
        }

        console.log(`✅ Found ${profiles.length} profile(s):\n`);

        profiles.forEach((profile, index) => {
            console.log(`Profile ${index + 1}:`);
            console.log(`  ID: ${profile.id}`);
            console.log(`  Role: ${profile.role}`);
            console.log(`  Display Name: ${profile.display_name || '(not set)'}`);
            console.log(`  Email: ${profile.email || '(not set)'}`);
            console.log(`  Onboarding Complete: ${profile.onboarding_completed}`);
            console.log(`  Created: ${profile.created_at}`);
            console.log('-----------------------------------\n');
        });

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

checkProfiles();
