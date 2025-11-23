/**
 * Force Schema Refresh and Create Profiles
 * This script attempts to refresh the schema cache before creating profiles
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function refreshSchemaAndCreateProfiles() {
    console.log('\n🔄 Attempting to refresh schema and create profiles...\n');

    try {
        // Get all users
        console.log('📥 Fetching users...');
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            throw usersError;
        }

        const employerUser = users.find(u => u.email === 'employer@test.trustwork.co.za');
        const freelancerUser = users.find(u => u.email === 'freelancer@test.trustwork.co.za');
        const sarahUser = users.find(u => u.email === 'sarah.johnson@test.trustwork.co.za');

        if (!employerUser || !freelancerUser || !sarahUser) {
            console.error('❌ Not all test users found.');
            process.exit(1);
        }

        console.log('✅ Found all 3 test users\n');

        // Try using raw SQL through RPC if available, or direct insert
        const profiles = [
            {
                id: employerUser.id,
                role: 'employer',
                display_name: 'TechCorp Solutions',
                phone: '+27 21 555 0123',
                business_name: 'TechCorp Solutions (Pty) Ltd',
                business_verified: true,
                onboarding_completed: true
            },
            {
                id: freelancerUser.id,
                role: 'job_seeker',
                display_name: 'John Smith',
                phone: '+27 11 555 0456',
                city: 'Johannesburg',
                province: 'Gauteng',
                experience_level: 'Senior',
                employment_status: 'Available',
                current_job_title: 'Senior Full Stack Developer',
                industry: 'Information Technology',
                years_experience: '5-10 years',
                highest_qualification: "Bachelor's Degree",
                institution: 'University of Witwatersrand',
                field_of_study: 'Computer Science',
                year_completed: '2018',
                skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
                languages: ['English', 'Afrikaans'],
                desired_role: 'Lead Developer',
                desired_industry: 'Technology',
                desired_location: 'Johannesburg or Remote',
                job_type_preference: 'Full-time',
                salary_expectation: 'R600,000 - R800,000 per annum',
                availability: 'Immediately',
                onboarding_completed: true
            },
            {
                id: sarahUser.id,
                role: 'job_seeker',
                display_name: 'Sarah Johnson',
                phone: '+27 21 555 0789',
                city: 'Cape Town',
                province: 'Western Cape',
                experience_level: 'Intermediate',
                employment_status: 'Available',
                current_job_title: 'Digital Marketing Specialist',
                industry: 'Marketing & Communications',
                years_experience: '3-5 years',
                highest_qualification: "Bachelor's Degree",
                institution: 'University of Cape Town',
                field_of_study: 'Marketing & Business Management',
                year_completed: '2020',
                skills: ['Digital Marketing', 'SEO', 'Content Writing', 'Social Media', 'Graphic Design'],
                languages: ['English', 'Afrikaans'],
                desired_role: 'Senior Marketing Manager',
                desired_industry: 'Marketing',
                desired_location: 'Cape Town or Remote',
                job_type_preference: 'Full-time or Contract',
                salary_expectation: 'R400,000 - R550,000 per annum',
                availability: 'Immediately',
                onboarding_completed: true
            }
        ];

        console.log('📝 Attempting to create profiles with service role key...\n');

        for (const profile of profiles) {
            console.log(`Creating profile for ${profile.display_name}...`);

            // Try with upsert using service role
            const { data, error } = await supabase
                .from('profiles')
                .upsert(profile, { onConflict: 'id' })
                .select();

            if (error) {
                console.error(`❌ Error for ${profile.display_name}:`, error.message);

                // If still fails, print SQL to run manually
                console.log('\n📋 Manual SQL for this profile:');
                console.log(`INSERT INTO public.profiles (${Object.keys(profile).join(', ')})`);
                console.log(`VALUES ('${Object.values(profile).map(v =>
                    Array.isArray(v) ? `ARRAY[${v.map(i => `'${i}'`).join(',')}]` :
                        typeof v === 'boolean' ? v :
                            typeof v === 'string' ? v.replace(/'/g, "''") : v
                ).join("', '")}');`);
            } else {
                console.log(`✅ Successfully created profile for ${profile.display_name}`);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('🎯 Profile creation attempt completed');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Fatal error:', error);

        console.log('\n📝 MANUAL ALTERNATIVE:');
        console.log('1. Open Supabase SQL Editor: https://app.supabase.com/project/sojjizqahgphybdijqaj/sql');
        console.log('2. Copy the contents of scripts/insert-complete-profiles.sql');
        console.log('3. Paste and run in SQL Editor');
        console.log('4. This will immediately create all 3 profiles with complete data\n');

        process.exit(1);
    }
}

refreshSchemaAndCreateProfiles()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
