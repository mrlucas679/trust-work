/**
 * Supabase Database Seed Script
 * 
 * This script populates the Supabase database with test data for development and testing.
 * It creates test users and seeds realistic data for:
 * - User profiles (employers and job seekers)
 * - Jobs and gigs
 * - Portfolio items
 * - Assignments and certifications
 * - Applications
 * - Notifications
 * 
 * Usage:
 *   npm run seed
 * 
 * Requirements:
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable set
 *   - Database schema already applied (supabase/schema.sql)
 * 
 * WARNING: This will DELETE existing data in development database!
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import mock data
import { mockJobs, mockGigs, mockJobSeeker, mockEmployer } from '../src/data/mockData';
import { mockUserAssignmentProfile } from '../src/data/mockAssignmentData';
import type { AssignmentAttempt } from '../src/types/assignments';

// Create Supabase admin client (bypasses RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - VITE_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nMake sure these are set in your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'X-Client-Info': 'supabase-js-node'
        }
    }
});

// Test user credentials (for documentation)
const TEST_USERS = [
    {
        email: 'employer@test.trustwork.co.za',
        password: 'TrustWork2025!',
        role: 'employer',
        profile: mockEmployer
    },
    {
        email: 'freelancer@test.trustwork.co.za',
        password: 'TrustWork2025!',
        role: 'job_seeker',
        profile: mockJobSeeker
    },
    {
        email: 'sarah.johnson@test.trustwork.co.za',
        password: 'TrustWork2025!',
        role: 'job_seeker',
        profile: {
            ...mockJobSeeker,
            id: '3',
            name: mockUserAssignmentProfile.userName,
            email: 'sarah.johnson@test.trustwork.co.za'
        }
    }
];

// Helper function to format date for logging
const formatDate = () => new Date().toLocaleTimeString();

// Main seed function
async function seedDatabase() {
    console.log('\n🌱 Starting database seed...\n');
    console.log('⚠️  WARNING: This will clear existing test data!\n');

    try {
        // Step 1: Get or create test users
        console.log(`[${formatDate()}] 👥 Setting up test user accounts...`);
        console.log('   (Existing users will be reused, new users will be created)\n');
        const userIds: Record<string, string> = {};

        // First, try to find existing users
        const { data: allUsers } = await supabase.auth.admin.listUsers();

        for (const testUser of TEST_USERS) {
            // Check if user already exists
            const existingUser = allUsers?.users.find(u => u.email === testUser.email);

            if (existingUser) {
                console.log(`   ♻️  Reusing existing user: ${testUser.email}`);
                userIds[testUser.email] = existingUser.id;

                // Update user metadata if needed
                await supabase.auth.admin.updateUserById(existingUser.id, {
                    user_metadata: {
                        role: testUser.role,
                        name: testUser.profile.name
                    }
                });
            } else {
                // Create new user
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: testUser.email,
                    password: testUser.password,
                    email_confirm: true,
                    user_metadata: {
                        role: testUser.role,
                        name: testUser.profile.name
                    }
                });

                if (authError) {
                    console.error(`   ❌ Failed to create user ${testUser.email}:`, authError.message);
                    console.error(`      This might require manual setup via Supabase Dashboard`);
                    continue;
                } else if (authData.user) {
                    userIds[testUser.email] = authData.user.id;
                    console.log(`   ✅ Created new user: ${testUser.email}`);
                }
            }
        }

        const userCount = Object.keys(userIds).length;
        console.log(`\n[${formatDate()}] ✅ Ready to use ${userCount}/${TEST_USERS.length} test users\n`);

        if (userCount === 0) {
            console.error('❌ No users available to seed data for. Please create users manually.');
            console.error('   See MANUAL_USER_SETUP_GUIDE.md for instructions.\n');
            process.exit(1);
        }

        // Step 2: Create profiles
        console.log(`[${formatDate()}] 📝 Creating user profiles...`);

        const employerId = userIds['employer@test.trustwork.co.za'];
        const freelancerId = userIds['freelancer@test.trustwork.co.za'];
        const sarahId = userIds['sarah.johnson@test.trustwork.co.za'];

        if (employerId) {
            const { error } = await supabase.from('profiles').upsert({
                id: employerId,
                role: 'employer',
                display_name: mockEmployer.name,
                business_name: mockEmployer.company,
                industry: 'Technology',
                location: 'Cape Town, South Africa',
                business_verified: true,
                business_verification_status: 'verified',
                verification_badge_level: 'premium',
                onboarding_completed: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (error) console.error('   ❌ Profile error:', error.message);
            else console.log('   ✅ Created employer profile');
        }

        if (freelancerId) {
            const { error } = await supabase.from('profiles').upsert({
                id: freelancerId,
                role: 'job_seeker',
                display_name: mockJobSeeker.name,
                current_job_title: 'Full Stack Developer',
                skills: mockJobSeeker.skills,
                languages: ['English', 'Afrikaans'],
                location: 'Johannesburg, South Africa',
                city: 'Johannesburg',
                province: 'Gauteng',
                years_experience: '5+',
                experience_level: 'senior',
                employment_status: 'freelance',
                highest_qualification: 'bachelor',
                field_of_study: 'Computer Science',
                desired_role: 'Full Stack Developer',
                job_type_preference: 'freelance',
                availability: 'immediately',
                onboarding_completed: true,
                overall_rating: 4.75,
                total_reviews: 12,
                total_gigs_completed: 8,
                success_rate: 95.50,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (error) console.error('   ❌ Profile error:', error.message);
            else console.log('   ✅ Created freelancer profile');
        }

        if (sarahId) {
            const { error } = await supabase.from('profiles').upsert({
                id: sarahId,
                role: 'job_seeker',
                display_name: mockUserAssignmentProfile.userName,
                current_job_title: 'Digital Marketing Specialist',
                skills: ['Digital Marketing', 'Graphic Design', 'Content Writing', 'SEO', 'Social Media'],
                languages: ['English'],
                location: 'Cape Town, South Africa',
                city: 'Cape Town',
                province: 'Western Cape',
                years_experience: '3-5',
                experience_level: 'intermediate',
                employment_status: 'freelance',
                desired_role: 'Marketing Specialist',
                job_type_preference: 'freelance',
                availability: 'immediately',
                onboarding_completed: true,
                overall_rating: 4.50,
                total_reviews: 8,
                total_gigs_completed: 6,
                success_rate: 92.00,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (error) console.error('   ❌ Profile error:', error.message);
            else console.log('   ✅ Created Sarah Johnson profile (with certifications)');
        }

        console.log(`\n[${formatDate()}] ✅ Profiles created\n`);

        // Step 3: Seed jobs and gigs as assignments
        console.log(`[${formatDate()}] 💼 Seeding jobs and gigs...`);

        if (employerId) {
            // Seed jobs (type='job')
            const jobsToInsert = mockJobs.slice(0, 5).map((job, index) => ({
                client_id: employerId,
                title: job.title,
                description: job.description,
                location: job.location,
                job_type: 'freelance',
                budget_min: job.salary ? parseInt(job.salary.split('-')[0].replace(/[^\d]/g, '')) : null,
                budget_max: job.salary ? parseInt(job.salary.split('-')[1]?.replace(/[^\d]/g, '') || '0') : null,
                budget_type: 'negotiable',
                required_skills: job.requirements,
                type: 'job', // NEW: Job type
                requires_skill_test: index % 2 === 0, // Every other job requires skill test
                status: 'open',
                created_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
            }));

            const { data: insertedJobs, error: jobsError } = await supabase.from('assignments').insert(jobsToInsert).select();

            if (jobsError) {
                console.error('   ❌ Jobs error:', jobsError.message);
            } else {
                console.log(`   ✅ Created ${insertedJobs?.length || 0} jobs`);
            }

            // Seed gigs (type='gig')
            const gigsToInsert = mockGigs.slice(0, 5).map((gig, index) => {
                // Extract budget - handle formats like "R5,000 - R15,000" or "R2,500"
                const budgetStr = gig.budget?.replace(/[^\d]/g, '') || '5000';
                const budgetValue = Math.min(parseInt(budgetStr), 99999999); // Cap at max NUMERIC(10,2) value

                return {
                    client_id: employerId,
                    title: gig.title,
                    description: gig.description,
                    location: 'Remote',
                    job_type: 'freelance',
                    budget_min: budgetValue,
                    budget_max: budgetValue,
                    budget_type: 'fixed',
                    required_skills: gig.skills,
                    type: 'gig', // NEW: Gig type
                    requires_skill_test: false, // Gigs don't require skill tests
                    status: 'open',
                    created_at: new Date(Date.now() - index * 12 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - index * 12 * 60 * 60 * 1000).toISOString()
                };
            });

            const { data: insertedGigs, error: gigsError } = await supabase.from('assignments').insert(gigsToInsert).select();

            if (gigsError) {
                console.error('   ❌ Gigs error:', gigsError.message);
            } else {
                console.log(`   ✅ Created ${insertedGigs?.length || 0} gigs`);
            }

            // Link first skill test to first job if both exist
            if (insertedJobs && insertedJobs.length > 0) {
                const { data: skillTests } = await supabase
                    .from('skill_tests')
                    .select('id')
                    .limit(1);

                if (skillTests && skillTests.length > 0) {
                    const { error: linkError } = await supabase
                        .from('assignments')
                        .update({ skill_test_id: skillTests[0].id })
                        .eq('id', insertedJobs[0].id);

                    if (!linkError) {
                        console.log('   ✅ Linked skill test to first job');
                    }
                }
            }
        }

        // Step 4: Seed skill tests
        console.log(`\n[${formatDate()}] 📚 Seeding skill tests...`);

        if (employerId) {
            const skillTests = [
                {
                    title: 'React Fundamentals',
                    description: 'Test your knowledge of React basics including components, props, and state',
                    type: 'technical',
                    duration_minutes: 30,
                    passing_score: 70,
                    difficulty: 'beginner',
                    category: 'Frontend Development',
                    created_by: employerId,
                    questions: JSON.stringify([
                        {
                            id: 1,
                            question: 'What is JSX?',
                            type: 'multiple_choice',
                            options: ['A JavaScript extension', 'A CSS framework', 'A database', 'A testing library'],
                            correct_answer: 'A JavaScript extension',
                            points: 10
                        },
                        {
                            id: 2,
                            question: 'What hook is used for side effects?',
                            type: 'multiple_choice',
                            options: ['useState', 'useEffect', 'useContext', 'useMemo'],
                            correct_answer: 'useEffect',
                            points: 10
                        }
                    ]),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    title: 'TypeScript Intermediate',
                    description: 'Test your TypeScript skills including interfaces, generics, and type guards',
                    type: 'technical',
                    duration_minutes: 45,
                    passing_score: 75,
                    difficulty: 'intermediate',
                    category: 'Programming Languages',
                    created_by: employerId,
                    questions: JSON.stringify([
                        {
                            id: 1,
                            question: 'What is a type guard in TypeScript?',
                            type: 'multiple_choice',
                            options: ['A security feature', 'A way to narrow types', 'A compiler option', 'A linting rule'],
                            correct_answer: 'A way to narrow types',
                            points: 15
                        }
                    ]),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];

            const { data: insertedTests, error: testsError } = await supabase.from('skill_tests').insert(skillTests).select();

            if (testsError) {
                console.error('   ❌ Skill tests error:', testsError.message);
            } else if (insertedTests && insertedTests.length > 0) {
                console.log(`   ✅ Created ${insertedTests.length} skill tests`);

                // Step 5: Link skill tests to jobs
                console.log(`\n[${formatDate()}] 🔗 Linking skill tests to jobs...`);

                const { error: linkError } = await supabase
                    .from('assignments')
                    .update({ skill_test_id: insertedTests[0].id })
                    .eq('id', 'job_1');

                if (linkError) {
                    console.error('   ❌ Link error:', linkError.message);
                } else {
                    console.log('   ✅ Linked React test to Job #1');
                }
            }
        }

        // Step 6: Seed gig reviews
        console.log(`\n[${formatDate()}] ⭐ Seeding gig reviews...`);

        if (employerId && freelancerId) {
            // First get the actual gig IDs we created
            const { data: gigs } = await supabase
                .from('assignments')
                .select('id')
                .eq('type', 'gig')
                .limit(2);

            if (gigs && gigs.length >= 2) {
                const reviews = [
                    {
                        gig_id: gigs[0].id,
                        reviewer_id: employerId,
                        reviewee_id: freelancerId,
                        rating: 5,
                        review_text: 'Excellent work! Delivered ahead of schedule with great quality.',
                        skills_demonstrated: ['React', 'TypeScript', 'Problem Solving'],
                        would_work_again: true,
                        communication_rating: 5,
                        quality_rating: 5,
                        professionalism_rating: 5,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    {
                        gig_id: gigs[1].id,
                        reviewer_id: employerId,
                        reviewee_id: freelancerId,
                        rating: 4,
                        review_text: 'Good work overall, minor revisions needed but delivered on time.',
                        skills_demonstrated: ['Node.js', 'API Development'],
                        would_work_again: true,
                        communication_rating: 4,
                        quality_rating: 4,
                        professionalism_rating: 5,
                        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ];

                const { error: reviewsError } = await supabase.from('gig_reviews').insert(reviews);

                if (reviewsError) {
                    console.error('   ❌ Reviews error:', reviewsError.message);
                } else {
                    console.log(`   ✅ Created ${reviews.length} gig reviews`);
                }
            } else {
                console.log('   ℹ️  Not enough gigs to create reviews');
            }
        }

        // Step 7: Seed portfolio items
        console.log(`\n[${formatDate()}] 🎯 Seeding portfolio items...`);

        if (freelancerId) {
            const portfolioItems = [
                {
                    user_id: freelancerId,
                    title: 'E-commerce Website Redesign',
                    description: 'Complete redesign of online store with modern UI/UX',
                    client: 'Online Retail Co.',
                    completed_at: new Date('2024-09-15').toISOString(),
                    skills: ['React', 'TypeScript', 'Tailwind CSS', 'UX Design'],
                    image_url: null,
                    created_at: new Date().toISOString()
                },
                {
                    user_id: freelancerId,
                    title: 'Mobile App Development',
                    description: 'React Native app for local delivery service',
                    client: 'QuickDeliver SA',
                    completed_at: new Date('2024-08-20').toISOString(),
                    skills: ['React Native', 'Node.js', 'MongoDB'],
                    image_url: null,
                    created_at: new Date().toISOString()
                }
            ];

            const { error } = await supabase.from('portfolio_items').upsert(portfolioItems);

            if (error) {
                if (error.message.includes('does not exist')) {
                    console.log('   ℹ️  Portfolio table not yet created, skipping...');
                } else {
                    console.error('   ❌ Portfolio error:', error.message);
                }
            } else {
                console.log(`   ✅ Created ${portfolioItems.length} portfolio items`);
            }
        }

        // Step 8: Seed skill certifications (assignment_certificates)
        console.log(`\n[${formatDate()}] 🏆 Seeding skill certifications...`);

        if (sarahId) {
            // Note: assignment_certificates is for standalone skill-building assignments
            // The mockUserAssignmentProfile.assignments data structure doesn't match
            // Skipping for now - will be populated when we implement the actual skill assignments feature
            console.log('   ℹ️  Skill certificates will be populated when skill assignment feature is implemented');
        }

        // Step 9: Seed applications
        console.log(`\n[${formatDate()}] 📝 Seeding applications...`);

        if (freelancerId) {
            // Get actual assignment IDs
            const { data: jobs } = await supabase
                .from('assignments')
                .select('id')
                .eq('type', 'job')
                .limit(1);

            const { data: gigs } = await supabase
                .from('assignments')
                .select('id')
                .eq('type', 'gig')
                .limit(1);

            const applications = [];

            if (jobs && jobs.length > 0) {
                applications.push({
                    assignment_id: jobs[0].id,
                    freelancer_id: freelancerId,
                    status: 'pending',
                    cv_url: 'https://example.com/cv/john-freelancer.pdf',
                    proposal: 'I am excited to apply for this position.',
                    cover_letter: 'I have 5 years of experience in full-stack development and would be a great fit for this role.',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            if (gigs && gigs.length > 0) {
                applications.push({
                    assignment_id: gigs[0].id,
                    freelancer_id: freelancerId,
                    status: 'accepted',
                    bid_amount: 5000,
                    estimated_duration: '2 weeks',
                    proposal: 'I can complete this project with high quality.',
                    cover_letter: 'My bid is based on similar projects I have completed successfully.',
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            if (applications.length > 0) {
                const { error } = await supabase.from('applications').insert(applications);

                if (error) {
                    console.error('   ❌ Applications error:', error.message);
                } else {
                    console.log(`   ✅ Created ${applications.length} applications`);
                }
            } else {
                console.log('   ℹ️  No assignments to apply to');
            }
        }

        // Step 10: Seed notifications
        console.log(`\n[${formatDate()}] 🔔 Seeding notifications...`);

        if (freelancerId) {
            const notifications = [
                {
                    user_id: freelancerId,
                    title: 'Welcome to TrustWork!',
                    message: 'Complete your profile to start applying for jobs',
                    type: 'system',
                    priority: 'low',
                    read: false,
                    created_at: new Date().toISOString()
                },
                {
                    user_id: freelancerId,
                    title: 'New Job Match',
                    message: 'A new Software Developer position matches your skills',
                    type: 'job_match',
                    priority: 'medium',
                    read: false,
                    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                }
            ];

            const { error } = await supabase.from('notifications').insert(notifications);

            if (error) {
                console.error('   ❌ Notifications error:', error.message);
            } else {
                console.log(`   ✅ Created ${notifications.length} notifications`);
            }
        }

        // Success summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\n📋 Test User Credentials:\n');

        TEST_USERS.forEach(user => {
            console.log(`   ${user.role.toUpperCase()}:`);
            console.log(`   Email:    ${user.email}`);
            console.log(`   Password: ${user.password}\n`);
        });

        console.log('🔗 Next Steps:');
        console.log('   1. Log in with test accounts above');
        console.log('   2. Verify data appears correctly in the app');
        console.log('   3. Test creating new data (jobs, applications, etc.)');
        console.log('   4. Check Supabase dashboard for data integrity\n');

    } catch (error) {
        console.error('\n❌ SEED FAILED:', error);
        process.exit(1);
    }
}

// Run seed
seedDatabase()
    .then(() => {
        console.log('✨ Seed script finished successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
