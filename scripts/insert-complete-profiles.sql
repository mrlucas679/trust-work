-- Insert Complete Profiles for Test Users
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/sojjizqahgphybdijqaj/sql

-- First, get the user IDs (replace these with actual IDs from auth.users table)
-- You can get them by running: SELECT id, email FROM auth.users WHERE email LIKE '%test.trustwork.co.za';

-- For now, we'll use a query to find and update

-- EMPLOYER PROFILE (employer@test.trustwork.co.za)
INSERT INTO public.profiles (
    id, 
    role, 
    display_name, 
    phone,
    business_name, 
    business_verified,
    onboarding_completed,
    created_at, 
    updated_at
)
SELECT 
    u.id,
    'employer',
    'TechCorp Solutions',
    '+27 21 555 0123',
    'TechCorp Solutions (Pty) Ltd',
    true,
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'employer@test.trustwork.co.za'
ON CONFLICT (id) 
DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    phone = EXCLUDED.phone,
    business_name = EXCLUDED.business_name,
    business_verified = EXCLUDED.business_verified,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- JOB SEEKER PROFILE (freelancer@test.trustwork.co.za)
INSERT INTO public.profiles (
    id, 
    role, 
    display_name, 
    phone,
    city, 
    province, 
    location,
    experience_level, 
    employment_status, 
    current_job_title,
    industry, 
    years_experience,
    highest_qualification, 
    institution, 
    field_of_study, 
    year_completed,
    skills, 
    languages,
    desired_role, 
    desired_industry, 
    desired_location,
    job_type_preference, 
    salary_expectation, 
    availability,
    onboarding_completed,
    created_at, 
    updated_at
)
SELECT 
    u.id,
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
FROM auth.users u
WHERE u.email = 'freelancer@test.trustwork.co.za'
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

-- JOB SEEKER PROFILE (sarah.johnson@test.trustwork.co.za)
INSERT INTO public.profiles (
    id, 
    role, 
    display_name, 
    phone,
    city, 
    province, 
    location,
    experience_level, 
    employment_status, 
    current_job_title,
    industry, 
    years_experience,
    highest_qualification, 
    institution, 
    field_of_study, 
    year_completed,
    skills, 
    languages,
    desired_role, 
    desired_industry, 
    desired_location,
    job_type_preference, 
    salary_expectation, 
    availability,
    onboarding_completed,
    created_at, 
    updated_at
)
SELECT 
    u.id,
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
FROM auth.users u
WHERE u.email = 'sarah.johnson@test.trustwork.co.za'
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

-- Verify the profiles were created
SELECT 
    p.id,
    p.display_name,
    p.role,
    p.onboarding_completed,
    u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email LIKE '%test.trustwork.co.za'
ORDER BY p.role, p.display_name;
