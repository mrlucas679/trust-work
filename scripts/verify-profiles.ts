/**
 * Quick Profile Verification Script
 * Checks if profiles exist with onboarding_completed = true
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyProfiles() {
    console.log('\n🔍 Checking profiles...\n');

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, display_name, role, onboarding_completed, phone')
        .order('role', { ascending: true });

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('❌ No profiles found. You need to run the SQL script in Supabase Dashboard.');
        console.log('\n📋 Instructions:');
        console.log('1. Open: https://app.supabase.com/project/sojjizqahgphybdijqaj/sql');
        console.log('2. Copy all contents from: scripts/complete-setup.sql');
        console.log('3. Paste and click RUN\n');
        return;
    }

    console.log(`✅ Found ${profiles.length} profile(s):\n`);

    profiles.forEach((p, i) => {
        const status = p.onboarding_completed ? '✅ COMPLETE' : '⚠️  INCOMPLETE';
        console.log(`${i + 1}. ${p.display_name} (${p.role})`);
        console.log(`   Status: ${status}`);
        console.log(`   Phone: ${p.phone || 'N/A'}`);
        console.log('');
    });

    const allComplete = profiles.every(p => p.onboarding_completed);

    if (allComplete) {
        console.log('='.repeat(70));
        console.log('🎉 ALL PROFILES READY FOR TESTING!');
        console.log('='.repeat(70));
        console.log('\n📝 Test Credentials:\n');
        console.log('   Employer: employer@test.trustwork.co.za / TrustWork2025!');
        console.log('   → Should go to /dashboard/employer\n');
        console.log('   Job Seeker 1: freelancer@test.trustwork.co.za / TrustWork2025!');
        console.log('   → Should go to /dashboard/job-seeker\n');
        console.log('   Job Seeker 2: sarah.johnson@test.trustwork.co.za / TrustWork2025!');
        console.log('   → Should go to /dashboard/job-seeker\n');
        console.log('🚀 Open http://localhost:5173 and start testing!\n');
    } else {
        console.log('⚠️  Some profiles are incomplete. Run the SQL script first.\n');
    }
}

verifyProfiles()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
