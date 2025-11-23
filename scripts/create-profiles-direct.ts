/**
 * Direct Profile Creation Script
 * Bypasses schema cache by using direct SQL INSERT statements
 * Creates complete profiles for test users with all fields filled
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function createProfiles() {
    console.log('\n🔧 Creating complete profiles directly...\n');

    try {
        // Get all test users
        const { data: users } = await supabase.auth.admin.listUsers();

        const employerUser = users?.users.find(u => u.email === 'employer@test.trustwork.co.za');
        const freelancerUser = users?.users.find(u => u.email === 'freelancer@test.trustwork.co.za');
        const sarahUser = users?.users.find(u => u.email === 'sarah.johnson@test.trustwork.co.za');

        if (!employerUser || !freelancerUser || !sarahUser) {
            console.error('❌ Not all test users found. Run seed script first.');
            process.exit(1);
        }

        console.log('✅ Found all test users');

        // Create employer profile with ALL fields
        console.log('\n📝 Creating employer profile...');
        const { error: empError } = await supabase.rpc('exec_sql', {
            sql: `
                INSERT INTO public.profiles (
                    id, role, display_name, phone, 
                    business_name, business_verified, 
                    onboarding_completed, created_at, updated_at
                ) VALUES (
                    '${employerUser.id}',
                    'employer',
                    'TechCorp Solutions',
                    '+27 21 555 0123',
                    'TechCorp Solutions (Pty) Ltd',
                    true,
                    true,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (id) 
                DO UPDATE SET
                    role = EXCLUDED.role,
                    display_name = EXCLUDED.display_name,
                    phone = EXCLUDED.phone,
                    business_name = EXCLUDED.business_name,
                    business_verified = EXCLUDED.business_verified,
                    onboarding_completed = EXCLUDED.onboarding_completed,
                    updated_at = NOW();
            `
        });

        if (empError) {
            console.error('❌ Employer profile error:', empError);
        } else {
            console.log('✅ Employer profile created (COMPLETE - no setup needed)');
        }

        // Create freelancer profile with ALL fields
        console.log('\n📝 Creating freelancer profile...');
        const { error: freError } = await supabase.rpc('exec_sql', {
            sql: `
                INSERT INTO public.profiles (
                    id, role, display_name, phone,
                    city, province, location,
                    experience_level, employment_status, current_job_title,
                    industry, years_experience,
                    highest_qualification, institution, field_of_study, year_completed,
                    skills, languages,
                    desired_role, desired_industry, desired_location,
                    job_type_preference, salary_expectation, availability,
                    onboarding_completed, created_at, updated_at
                ) VALUES (
                    '${freelancerUser.id}',
                    'job_seeker',
                    'John Smith',
                    '+27 11 555 0456',
                    'Johannesburg',
                    'Gauteng',
                    'Sandton, Johannesburg',
                    'Senior',
                    'Available',
                    'Senior Full Stack Developer',
                    'Information Technology',
                    '5-10 years',
                    'Bachelor''s Degree',
                    'University of Witwatersrand',
                    'Computer Science',
                    '2018',
                    ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker']::text[],
                    ARRAY['English', 'Afrikaans']::text[],
                    'Lead Developer',
                    'Technology',
                    'Johannesburg or Remote',
                    'Full-time',
                    'R600,000 - R800,000 per annum',
                    'Immediately',
                    true,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (id) 
                DO UPDATE SET
                    role = EXCLUDED.role,
                    display_name = EXCLUDED.display_name,
                    phone = EXCLUDED.phone,
                    city = EXCLUDED.city,
                    province = EXCLUDED.province,
                    location = EXCLUDED.location,
                    experience_level = EXCLUDED.experience_level,
                    employment_status = EXCLUDED.employment_status,
                    current_job_title = EXCLUDED.current_job_title,
                    industry = EXCLUDED.industry,
                    years_experience = EXCLUDED.years_experience,
                    highest_qualification = EXCLUDED.highest_qualification,
                    institution = EXCLUDED.institution,
                    field_of_study = EXCLUDED.field_of_study,
                    year_completed = EXCLUDED.year_completed,
                    skills = EXCLUDED.skills,
                    languages = EXCLUDED.languages,
                    desired_role = EXCLUDED.desired_role,
                    desired_industry = EXCLUDED.desired_industry,
                    desired_location = EXCLUDED.desired_location,
                    job_type_preference = EXCLUDED.job_type_preference,
                    salary_expectation = EXCLUDED.salary_expectation,
                    availability = EXCLUDED.availability,
                    onboarding_completed = EXCLUDED.onboarding_completed,
                    updated_at = NOW();
            `
        });

        if (freError) {
            console.error('❌ Freelancer profile error:', freError);
        } else {
            console.log('✅ Freelancer profile created (COMPLETE - no setup needed)');
        }

        // Create Sarah's profile with ALL fields
        console.log('\n📝 Creating Sarah Johnson profile...');
        const { error: sarError } = await supabase.rpc('exec_sql', {
            sql: `
                INSERT INTO public.profiles (
                    id, role, display_name, phone,
                    city, province, location,
                    experience_level, employment_status, current_job_title,
                    industry, years_experience,
                    highest_qualification, institution, field_of_study, year_completed,
                    skills, languages,
                    desired_role, desired_industry, desired_location,
                    job_type_preference, salary_expectation, availability,
                    onboarding_completed, created_at, updated_at
                ) VALUES (
                    '${sarahUser.id}',
                    'job_seeker',
                    'Sarah Johnson',
                    '+27 21 555 0789',
                    'Cape Town',
                    'Western Cape',
                    'Cape Town CBD',
                    'Intermediate',
                    'Available',
                    'Digital Marketing Specialist',
                    'Marketing & Communications',
                    '3-5 years',
                    'Bachelor''s Degree',
                    'University of Cape Town',
                    'Marketing & Business Management',
                    '2020',
                    ARRAY['Digital Marketing', 'SEO', 'Content Writing', 'Social Media', 'Graphic Design']::text[],
                    ARRAY['English', 'Afrikaans']::text[],
                    'Senior Marketing Manager',
                    'Marketing',
                    'Cape Town or Remote',
                    'Full-time or Contract',
                    'R400,000 - R550,000 per annum',
                    'Immediately',
                    true,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (id) 
                DO UPDATE SET
                    role = EXCLUDED.role,
                    display_name = EXCLUDED.display_name,
                    phone = EXCLUDED.phone,
                    city = EXCLUDED.city,
                    province = EXCLUDED.province,
                    location = EXCLUDED.location,
                    experience_level = EXCLUDED.experience_level,
                    employment_status = EXCLUDED.employment_status,
                    current_job_title = EXCLUDED.current_job_title,
                    industry = EXCLUDED.industry,
                    years_experience = EXCLUDED.years_experience,
                    highest_qualification = EXCLUDED.highest_qualification,
                    institution = EXCLUDED.institution,
                    field_of_study = EXCLUDED.field_of_study,
                    year_completed = EXCLUDED.year_completed,
                    skills = EXCLUDED.skills,
                    languages = EXCLUDED.languages,
                    desired_role = EXCLUDED.desired_role,
                    desired_industry = EXCLUDED.desired_industry,
                    desired_location = EXCLUDED.desired_location,
                    job_type_preference = EXCLUDED.job_type_preference,
                    salary_expectation = EXCLUDED.salary_expectation,
                    availability = EXCLUDED.availability,
                    onboarding_completed = EXCLUDED.onboarding_completed,
                    updated_at = NOW();
            `
        });

        if (sarError) {
            console.error('❌ Sarah profile error:', sarError);
        } else {
            console.log('✅ Sarah Johnson profile created (COMPLETE - no setup needed)');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL PROFILES CREATED WITH COMPLETE DATA!');
        console.log('='.repeat(60));
        console.log('\n📋 Test Users (Ready to Login - NO Setup Required):\n');
        console.log('   EMPLOYER (Complete Profile):');
        console.log('   Email:    employer@test.trustwork.co.za');
        console.log('   Password: TrustWork2025!');
        console.log('   → Will go directly to /dashboard/employer\n');

        console.log('   JOB SEEKER (Complete Profile):');
        console.log('   Email:    freelancer@test.trustwork.co.za');
        console.log('   Password: TrustWork2025!');
        console.log('   → Will go directly to /dashboard/job-seeker\n');

        console.log('   JOB SEEKER (Complete Profile):');
        console.log('   Email:    sarah.johnson@test.trustwork.co.za');
        console.log('   Password: TrustWork2025!');
        console.log('   → Will go directly to /dashboard/job-seeker\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

createProfiles()
    .then(() => {
        console.log('✨ Profile creation completed!\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
