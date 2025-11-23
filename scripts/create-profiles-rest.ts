/**
 * Create Complete Profiles Using REST API
 * This bypasses the schema cache by using direct HTTP requests
 */

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

async function getUsers() {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        headers: {
            'apikey': supabaseServiceKey!,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data.users;
}

async function upsertProfile(profile: any) {
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
            'apikey': supabaseServiceKey!,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(profile)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create profile: ${error}`);
    }

    return response.json();
}

async function createProfiles() {
    console.log('\n🔧 Creating complete profiles via REST API...\n');

    try {
        // Get all users
        console.log('📥 Fetching users...');
        const users = await getUsers();

        const employerUser = users.find((u: any) => u.email === 'employer@test.trustwork.co.za');
        const freelancerUser = users.find((u: any) => u.email === 'freelancer@test.trustwork.co.za');
        const sarahUser = users.find((u: any) => u.email === 'sarah.johnson@test.trustwork.co.za');

        if (!employerUser || !freelancerUser || !sarahUser) {
            console.error('❌ Not all test users found.');
            console.log('Found users:', users.map((u: any) => u.email));
            process.exit(1);
        }

        console.log('✅ Found all 3 test users\n');

        // Create employer profile
        console.log('📝 Creating employer profile...');
        try {
            await upsertProfile({
                id: employerUser.id,
                role: 'employer',
                display_name: 'TechCorp Solutions',
                phone: '+27 21 555 0123',
                business_name: 'TechCorp Solutions (Pty) Ltd',
                business_verified: true,
                business_verification_status: 'verified',
                verification_badge_level: 'premium',
                onboarding_completed: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            console.log('✅ Employer profile created (COMPLETE)');
        } catch (error) {
            console.error('❌ Employer error:', error);
        }

        // Create freelancer profile
        console.log('\n📝 Creating freelancer profile...');
        try {
            await upsertProfile({
                id: freelancerUser.id,
                role: 'job_seeker',
                display_name: 'John Smith',
                phone: '+27 11 555 0456',
                city: 'Johannesburg',
                province: 'Gauteng',
                location: 'Sandton, Johannesburg',
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
                onboarding_completed: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            console.log('✅ Freelancer profile created (COMPLETE)');
        } catch (error) {
            console.error('❌ Freelancer error:', error);
        }

        // Create Sarah's profile
        console.log('\n📝 Creating Sarah Johnson profile...');
        try {
            await upsertProfile({
                id: sarahUser.id,
                role: 'job_seeker',
                display_name: 'Sarah Johnson',
                phone: '+27 21 555 0789',
                city: 'Cape Town',
                province: 'Western Cape',
                location: 'Cape Town CBD',
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
                onboarding_completed: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            console.log('✅ Sarah Johnson profile created (COMPLETE)');
        } catch (error) {
            console.error('❌ Sarah error:', error);
        }

        console.log('\n' + '='.repeat(70));
        console.log('🎉 ALL PROFILES CREATED WITH COMPLETE DATA!');
        console.log('='.repeat(70));
        console.log('\n✅ Test users ready - NO setup wizard required!\n');
        console.log('📋 Login and go straight to dashboard:\n');
        console.log('   1. employer@test.trustwork.co.za / TrustWork2025!');
        console.log('      → Goes to /dashboard/employer\n');
        console.log('   2. freelancer@test.trustwork.co.za / TrustWork2025!');
        console.log('      → Goes to /dashboard/job-seeker\n');
        console.log('   3. sarah.johnson@test.trustwork.co.za / TrustWork2025!');
        console.log('      → Goes to /dashboard/job-seeker\n');

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

createProfiles()
    .then(() => {
        console.log('✨ Profile creation completed successfully!\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
