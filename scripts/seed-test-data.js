/**
 * Seed test data for TrustWork E2E testing
 * This script creates test accounts, profiles, and sample jobs/applications
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
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test account credentials
const TEST_ACCOUNTS = {
    employer: {
        email: 'employer@test.trustwork.co.za',
        password: 'TrustWork2025!',
        profile: {
            display_name: 'TechCorp Solutions',
            role: 'employer',
            business_name: 'TechCorp Solutions',
            city: 'Cape Town',
            province: 'Western Cape',
            onboarding_completed: true
        }
    },
    freelancer: {
        email: 'freelancer@test.trustwork.co.za',
        password: 'TrustWork2025!',
        profile: {
            display_name: 'Sarah Developer',
            role: 'job_seeker',
            city: 'Johannesburg',
            province: 'Gauteng',
            current_job_title: 'Senior React Developer',
            years_experience: '5-7 years',
            skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
            availability: 'available',
            desired_role: 'Full Stack Developer',
            experience_level: 'senior',
            onboarding_completed: true,
            overall_rating: 4.75,
            total_reviews: 12,
            total_gigs_completed: 8,
            success_rate: 95.00
        }
    }
};

// Sample job postings (long-term positions)
const SAMPLE_JOBS = [
    {
        type: 'job',
        title: 'Senior React Developer Needed',
        description: 'We are looking for an experienced React developer to join our team and work on an exciting e-commerce platform. You will be responsible for building responsive user interfaces, integrating with REST APIs, and ensuring code quality through testing.',
        budget_min: 15000,
        budget_max: 25000,
        budget_type: 'fixed',
        required_skills: ['React', 'TypeScript', 'Tailwind CSS'],
        experience_level: 'intermediate',
        job_type: 'contract',
        location: 'Cape Town',
        remote_allowed: true,
        category: 'Web Development',
        status: 'open',
        requires_skill_test: true
    },
    {
        type: 'job',
        title: 'Full Stack Developer - Node.js & React',
        description: 'Join our startup as a full stack developer. Build scalable backend services with Node.js and beautiful frontends with React. Experience with PostgreSQL and real-time features is a plus.',
        budget_min: 20000,
        budget_max: 35000,
        budget_type: 'fixed',
        required_skills: ['Node.js', 'React', 'PostgreSQL', 'TypeScript'],
        experience_level: 'expert',
        job_type: 'freelance',
        location: 'Remote',
        remote_allowed: true,
        category: 'Full Stack',
        status: 'open',
        requires_skill_test: false
    }
];

// Sample gigs (short-term tasks - can be posted by anyone)
const SAMPLE_GIGS = [
    {
        type: 'gig',
        title: 'Logo Design for Tech Startup',
        description: 'Need a modern, minimalist logo for a new SaaS platform. Should include color variations and formats suitable for web and print. Deliverables: AI/SVG files, PNG exports, and brand guidelines.',
        budget_min: 2000,
        budget_max: 5000,
        budget_type: 'fixed',
        required_skills: ['Graphic Design', 'Adobe Illustrator', 'Branding'],
        experience_level: 'intermediate',
        job_type: 'freelance',
        location: 'Remote',
        remote_allowed: true,
        category: 'Design',
        status: 'open',
        requires_skill_test: false
    },
    {
        type: 'gig',
        title: 'Fix CSS Layout Issues on Responsive Website',
        description: 'Existing website has layout bugs on mobile devices. Need someone to debug and fix CSS issues. Should take 2-3 hours max. Must start today.',
        budget_min: 500,
        budget_max: 1000,
        budget_type: 'hourly',
        required_skills: ['CSS', 'HTML', 'Responsive Design'],
        experience_level: 'entry',
        job_type: 'freelance',
        location: 'Remote',
        remote_allowed: true,
        category: 'Web Development',
        status: 'open',
        requires_skill_test: false
    },
    {
        type: 'gig',
        title: 'Write Technical Blog Post about React Hooks',
        description: 'Need a 1500-word technical article explaining React Hooks with code examples. Target audience: intermediate developers. Include useState, useEffect, and custom hooks.',
        budget_min: 1500,
        budget_max: 2500,
        budget_type: 'fixed',
        required_skills: ['Technical Writing', 'React', 'JavaScript'],
        experience_level: 'intermediate',
        job_type: 'freelance',
        location: 'Remote',
        remote_allowed: true,
        category: 'Content Writing',
        status: 'open',
        requires_skill_test: false
    }
];

// Sample skill tests
const SAMPLE_SKILL_TESTS = [
    {
        title: 'React Fundamentals Assessment',
        description: 'Test your knowledge of React basics including components, props, state, and hooks.',
        type: 'technical',
        duration_minutes: 30,
        passing_score: 70,
        difficulty: 'intermediate',
        category: 'Web Development',
        questions: [
            {
                id: 1,
                question: 'What is the correct way to update state in a functional component?',
                type: 'multiple_choice',
                options: ['this.setState()', 'useState hook', 'state.update()', 'setState()'],
                correct_answer: 'useState hook',
                points: 10
            },
            {
                id: 2,
                question: 'Which hook is used for side effects in React?',
                type: 'multiple_choice',
                options: ['useState', 'useEffect', 'useContext', 'useMemo'],
                correct_answer: 'useEffect',
                points: 10
            },
            {
                id: 3,
                question: 'What does the dependency array in useEffect control?',
                type: 'multiple_choice',
                options: ['Component rendering', 'When the effect runs', 'State updates', 'Props validation'],
                correct_answer: 'When the effect runs',
                points: 10
            }
        ]
    },
    {
        title: 'TypeScript Basics',
        description: 'Assess your understanding of TypeScript fundamentals and type system.',
        type: 'technical',
        duration_minutes: 25,
        passing_score: 70,
        difficulty: 'beginner',
        category: 'Programming',
        questions: [
            {
                id: 1,
                question: 'What is the purpose of TypeScript?',
                type: 'multiple_choice',
                options: ['Add types to JavaScript', 'Replace JavaScript', 'Improve runtime performance', 'Create mobile apps'],
                correct_answer: 'Add types to JavaScript',
                points: 10
            },
            {
                id: 2,
                question: 'Which keyword is used to define a custom type?',
                type: 'multiple_choice',
                options: ['class', 'interface', 'type', 'Both interface and type'],
                correct_answer: 'Both interface and type',
                points: 10
            }
        ]
    }
];

async function seedData() {
    console.log('🌱 Starting TrustWork Database Seeding...\n');
    console.log('='.repeat(60));

    try {
        // Step 1: Check existing profiles
        console.log('\n1️⃣ Checking existing test profiles...');

        const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('id, role, display_name, email:id');

        console.log(`   Found ${existingProfiles?.length || 0} existing profiles`);

        // Step 2: Create/verify auth accounts
        console.log('\n2️⃣ Setting up test auth accounts...');

        const accounts = {};

        for (const [key, account] of Object.entries(TEST_ACCOUNTS)) {
            console.log(`\n   Processing ${key} account (${account.email})...`);

            // Check if user exists in auth
            const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
            const existingUser = authUsers?.users?.find(u => u.email === account.email);

            if (existingUser) {
                console.log(`   ✅ Auth user exists: ${existingUser.id}`);
                accounts[key] = existingUser.id;
            } else {
                // Create auth user
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email: account.email,
                    password: account.password,
                    email_confirm: true
                });

                if (createError) {
                    console.error(`   ❌ Error creating auth user:`, createError.message);
                    continue;
                }

                console.log(`   ✅ Created auth user: ${newUser.user.id}`);
                accounts[key] = newUser.user.id;
            }

            // Check/create profile
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', accounts[key])
                .single();

            if (!existingProfile) {
                console.log(`   Creating profile...`);
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        ...account.profile,
                        id: accounts[key]
                    });

                if (profileError) {
                    console.error(`   ❌ Error creating profile:`, profileError.message);
                } else {
                    console.log(`   ✅ Profile created: ${account.profile.display_name} (${account.profile.role})`);
                }
            } else {
                console.log(`   ✅ Profile exists: ${existingProfile.display_name} (${existingProfile.role})`);
            }
        }

        // Step 3: Create sample jobs
        console.log('\n3️⃣ Creating skill tests...');

        // Check if skill tests already exist
        const { data: existingTests } = await supabase
            .from('skill_tests')
            .select('id, title');

        let skillTestIds = {};

        if (existingTests && existingTests.length > 0) {
            console.log(`   ⚠️  ${existingTests.length} skill test(s) already exist`);
            existingTests.forEach((test, i) => {
                console.log(`   ${i + 1}. ${test.title}`);
                skillTestIds[test.title] = test.id;
            });
        } else {
            for (const [index, test] of SAMPLE_SKILL_TESTS.entries()) {
                const { data, error } = await supabase
                    .from('skill_tests')
                    .insert(test)
                    .select()
                    .single();

                if (error) {
                    console.error(`   ❌ Error creating skill test ${index + 1}:`, error.message);
                } else {
                    console.log(`   ✅ Created: "${data.title}" (ID: ${data.id})`);
                    skillTestIds[data.title] = data.id;
                }
            }
        }

        // Step 4: Create sample jobs (with skill tests linked)
        console.log('\n4️⃣ Creating sample job postings...');

        if (!accounts.employer) {
            console.log('   ⚠️  Employer account not available, skipping jobs');
        } else {
            // Check if jobs already exist
            const { data: existingJobs } = await supabase
                .from('assignments')
                .select('id, title, type')
                .eq('client_id', accounts.employer)
                .eq('type', 'job');

            if (existingJobs && existingJobs.length > 0) {
                console.log(`   ⚠️  ${existingJobs.length} job(s) already exist`);
                existingJobs.forEach((job, i) => {
                    console.log(`   ${i + 1}. ${job.title}`);
                });
            } else {
                for (const [index, job] of SAMPLE_JOBS.entries()) {
                    // Link skill test if required
                    const jobData = {
                        ...job,
                        client_id: accounts.employer
                    };

                    if (job.requires_skill_test) {
                        // Link to React test for first job, TypeScript test for second
                        const testTitle = index === 0 ? 'React Fundamentals Assessment' : 'TypeScript Basics';
                        jobData.skill_test_id = skillTestIds[testTitle];
                    }

                    const { data, error } = await supabase
                        .from('assignments')
                        .insert(jobData)
                        .select()
                        .single();

                    if (error) {
                        console.error(`   ❌ Error creating job ${index + 1}:`, error.message);
                    } else {
                        const testInfo = data.skill_test_id ? ` (linked to skill test)` : '';
                        console.log(`   ✅ Created: "${data.title}"${testInfo} (ID: ${data.id})`);
                    }
                }
            }
        }

        // Step 5: Create sample gigs
        console.log('\n5️⃣ Creating sample gig postings...');

        if (!accounts.freelancer) {
            console.log('   ⚠️  Freelancer account not available, skipping gigs');
        } else {
            // Check if gigs already exist
            const { data: existingGigs } = await supabase
                .from('assignments')
                .select('id, title, type')
                .eq('client_id', accounts.freelancer)
                .eq('type', 'gig');

            if (existingGigs && existingGigs.length > 0) {
                console.log(`   ⚠️  ${existingGigs.length} gig(s) already exist`);
                existingGigs.forEach((gig, i) => {
                    console.log(`   ${i + 1}. ${gig.title}`);
                });
            } else {
                for (const [index, gig] of SAMPLE_GIGS.entries()) {
                    const { data, error } = await supabase
                        .from('assignments')
                        .insert({
                            ...gig,
                            client_id: accounts.freelancer
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error(`   ❌ Error creating gig ${index + 1}:`, error.message);
                    } else {
                        console.log(`   ✅ Created: "${data.title}" (ID: ${data.id})`);
                    }
                }
            }
        }

        // Step 6: Summary
        console.log('\n' + '='.repeat(60));
        console.log('✨ Seeding Complete!\n');
        console.log('📝 Test Accounts Created:');
        console.log('');
        console.log('🏢 Employer Account:');
        console.log(`   Email: ${TEST_ACCOUNTS.employer.email}`);
        console.log(`   Password: ${TEST_ACCOUNTS.employer.password}`);
        console.log(`   ID: ${accounts.employer || 'N/A'}`);
        console.log('');
        console.log('👨‍💻 Freelancer Account:');
        console.log(`   Email: ${TEST_ACCOUNTS.freelancer.email}`);
        console.log(`   Password: ${TEST_ACCOUNTS.freelancer.password}`);
        console.log(`   ID: ${accounts.freelancer || 'N/A'}`);
        console.log('');
        console.log('� Database Content:');
        const { data: jobsData } = await supabase
            .from('assignments')
            .select('id', { count: 'exact' })
            .eq('type', 'job');
        const { data: gigsData } = await supabase
            .from('assignments')
            .select('id', { count: 'exact' })
            .eq('type', 'gig');
        const { data: testsData } = await supabase
            .from('skill_tests')
            .select('id', { count: 'exact' });
        console.log(`   ${jobsData?.length || 0} Jobs (posted by employers)`);
        console.log(`   ${gigsData?.length || 0} Gigs (short-term tasks)`);
        console.log(`   ${testsData?.length || 0} Skill Tests`);
        console.log('');
        console.log('�📝 Next Steps:');
        console.log('1. Log in as employer@test.trustwork.co.za');
        console.log('   - Navigate to /jobs to see job postings');
        console.log('   - Navigate to /gigs to see gig listings');
        console.log('   - View job details and check applications');
        console.log('');
        console.log('2. Log out and log in as freelancer@test.trustwork.co.za');
        console.log('   - Browse jobs at /jobs (must submit CV)');
        console.log('   - Browse gigs at /gigs (quick proposals)');
        console.log('   - Complete skill tests for jobs requiring them');
        console.log('   - Check applications at /applications');
        console.log('');
        console.log('3. Switch back to employer to:');
        console.log('   - Review applications and skill test results');
        console.log('   - Accept/reject applications');
        console.log('   - Award gigs to freelancers');
        console.log('');
        console.log('4. Test the full workflow:');
        console.log('   - Employer posts job with skill test requirement');
        console.log('   - Job seeker takes skill test and applies');
        console.log('   - Employer reviews test results and CV');
        console.log('   - Complete gig and leave review (updates ratings)');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        throw error;
    }
}

// Run the seeding
seedData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
