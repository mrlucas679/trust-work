-- COMPLETE SETUP: Create Tables + Insert Profiles
-- Run this ENTIRE script in Supabase SQL Editor
-- https://app.supabase.com/project/sojjizqahgphybdijqaj/sql

-- ============================================================
-- STEP 1: CREATE TABLES
-- ============================================================

-- profiles table: one-to-one with auth.users
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text,
    role text check (
        role in ('job_seeker', 'employer')
    ) not null default 'job_seeker',
    phone text,
    cv_url text,
    
    -- Job Seeker: Personal Information
    city text,
    province text,
    location text,
    
    -- Job Seeker: Professional Profile
    experience_level text,
    employment_status text,
    current_job_title text,
    industry text,
    years_experience text,
    
    -- Job Seeker: Education
    highest_qualification text,
    institution text,
    field_of_study text,
    year_completed text,
    
    -- Job Seeker: Skills & Languages
    skills text[],
    languages text[],
    
    -- Job Seeker: Job Preferences
    desired_role text,
    desired_industry text,
    desired_location text,
    job_type_preference text,
    salary_expectation text,
    availability text,
    
    -- Onboarding status
    onboarding_completed boolean not null default false,
    
    -- Business verification fields (for employers)
    business_name text,
    business_verified boolean not null default false,
    business_verification_status text check (
        business_verification_status in ('not_started', 'pending', 'verified', 'rejected')
    ) not null default 'not_started',
    business_verification_submitted_at timestamptz,
    business_verification_completed_at timestamptz,
    verification_badge_level text check (
        verification_badge_level in ('none', 'basic', 'premium', 'enterprise')
    ) not null default 'none',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Updated_at trigger
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- notifications table
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    type text check (
        type in ('job_match', 'application', 'message', 'payment', 'safety', 'system')
    ) not null,
    title text not null,
    message text not null,
    priority text check (priority in ('low', 'medium', 'high')) not null default 'low',
    read boolean not null default false,
    action_url text,
    action_label text,
    created_at timestamptz not null default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles insert self" on public.profiles;
create policy "Profiles insert self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Notifications policies
drop policy if exists "Notifications select own" on public.notifications;
create policy "Notifications select own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Notifications insert own" on public.notifications;
create policy "Notifications insert own" on public.notifications
  for insert with check (auth.uid() = user_id);

drop policy if exists "Notifications update own" on public.notifications;
create policy "Notifications update own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Notifications delete own" on public.notifications;
create policy "Notifications delete own" on public.notifications
  for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);

-- ============================================================
-- STEP 2: INSERT COMPLETE PROFILES
-- ============================================================

-- EMPLOYER PROFILE (employer@test.trustwork.co.za)
INSERT INTO public.profiles (
    id, role, display_name, phone, business_name, business_verified,
    onboarding_completed, created_at, updated_at
)
SELECT 
    u.id, 'employer', 'TechCorp Solutions', '+27 21 555 0123',
    'TechCorp Solutions (Pty) Ltd', true, true, NOW(), NOW()
FROM auth.users u
WHERE u.email = 'employer@test.trustwork.co.za'
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    phone = EXCLUDED.phone,
    business_name = EXCLUDED.business_name,
    business_verified = EXCLUDED.business_verified,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- JOB SEEKER PROFILE (John Smith - freelancer@test.trustwork.co.za)
INSERT INTO public.profiles (
    id, role, display_name, phone, city, province, location,
    experience_level, employment_status, current_job_title, industry,
    years_experience, highest_qualification, institution, field_of_study,
    year_completed, skills, languages, desired_role, desired_industry,
    desired_location, job_type_preference, salary_expectation, availability,
    onboarding_completed, created_at, updated_at
)
SELECT 
    u.id, 'job_seeker', 'John Smith', '+27 11 555 0456',
    'Johannesburg', 'Gauteng', 'Sandton, Johannesburg', 'Senior',
    'Available', 'Senior Full Stack Developer', 'Information Technology',
    '5-10 years', 'Bachelor''s Degree', 'University of Witwatersrand',
    'Computer Science', '2018',
    ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker']::text[],
    ARRAY['English', 'Afrikaans']::text[], 'Lead Developer', 'Technology',
    'Johannesburg or Remote', 'Full-time', 'R600,000 - R800,000 per annum',
    'Immediately', true, NOW(), NOW()
FROM auth.users u
WHERE u.email = 'freelancer@test.trustwork.co.za'
ON CONFLICT (id) DO UPDATE SET
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

-- JOB SEEKER PROFILE (Sarah Johnson - sarah.johnson@test.trustwork.co.za)
INSERT INTO public.profiles (
    id, role, display_name, phone, city, province, location,
    experience_level, employment_status, current_job_title, industry,
    years_experience, highest_qualification, institution, field_of_study,
    year_completed, skills, languages, desired_role, desired_industry,
    desired_location, job_type_preference, salary_expectation, availability,
    onboarding_completed, created_at, updated_at
)
SELECT 
    u.id, 'job_seeker', 'Sarah Johnson', '+27 21 555 0789',
    'Cape Town', 'Western Cape', 'Cape Town CBD', 'Intermediate',
    'Available', 'Digital Marketing Specialist', 'Marketing & Communications',
    '3-5 years', 'Bachelor''s Degree', 'University of Cape Town',
    'Marketing & Business Management', '2020',
    ARRAY['Digital Marketing', 'SEO', 'Content Writing', 'Social Media', 'Graphic Design']::text[],
    ARRAY['English', 'Afrikaans']::text[], 'Senior Marketing Manager',
    'Marketing', 'Cape Town or Remote', 'Full-time or Contract',
    'R400,000 - R550,000 per annum', 'Immediately', true, NOW(), NOW()
FROM auth.users u
WHERE u.email = 'sarah.johnson@test.trustwork.co.za'
ON CONFLICT (id) DO UPDATE SET
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

-- ============================================================
-- STEP 3: VERIFY PROFILES CREATED
-- ============================================================

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
