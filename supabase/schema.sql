-- Supabase schema for TrustWork MVP
-- Run this in Supabase SQL editor

-- Enable UUID extension if needed
-- create extension if not exists "uuid-ossp";

-- profiles table: one-to-one with auth.users
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text,
    role text check (
        role in ('job_seeker', 'employer')
    ) not null default 'job_seeker',
    phone text,
    -- Public URL to the user's uploaded CV/resume in Supabase Storage
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
    skills text[], -- Array of skills
    languages text[], -- Array of languages
    
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

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- notifications table
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    type text check (
        type in (
            'job_match',
            'application',
            'message',
            'payment',
            'safety',
            'system'
        )
    ) not null,
    title text not null,
    message text not null,
    priority text check (
        priority in ('low', 'medium', 'high')
    ) not null default 'low',
    read boolean not null default false,
    action_url text,
    action_label text,
    created_at timestamptz not null default now()
);

-- RLS policies
alter table public.profiles enable row level security;

alter table public.notifications enable row level security;

-- Profiles policies: users can read/update their own profile; insert own row
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'Profiles select own'
  ) then
    create policy "Profiles select own" on public.profiles
      for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'Profiles insert self'
  ) then
    create policy "Profiles insert self" on public.profiles
      for insert with check (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'Profiles update own'
  ) then
    create policy "Profiles update own" on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- Notifications policies: users can read and modify their own notifications
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'notifications' and policyname = 'Notifications select own'
  ) then
    create policy "Notifications select own" on public.notifications
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'notifications' and policyname = 'Notifications insert own'
  ) then
    create policy "Notifications insert own" on public.notifications
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'notifications' and policyname = 'Notifications update own'
  ) then
    create policy "Notifications update own" on public.notifications
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'notifications' and policyname = 'Notifications delete own'
  ) then
    create policy "Notifications delete own" on public.notifications
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Helpful index
create index if not exists notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);

-- Ensure cv_url column exists on profiles for environments where the table was created before this field was added
alter table public.profiles add column if not exists cv_url text;

-- Add business verification columns if they don't exist
alter table public.profiles add column if not exists business_name text;
alter table public.profiles add column if not exists business_verified boolean not null default false;
alter table public.profiles add column if not exists business_verification_status text check (
    business_verification_status in ('not_started', 'pending', 'verified', 'rejected')
) not null default 'not_started';
alter table public.profiles add column if not exists business_verification_submitted_at timestamptz;
alter table public.profiles add column if not exists business_verification_completed_at timestamptz;
alter table public.profiles add column if not exists verification_badge_level text check (
    verification_badge_level in ('none', 'basic', 'premium', 'enterprise')
) not null default 'none';

-- Business verification details table (stores full verification data)
create table if not exists public.business_verifications (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    business_name text not null,
    ein text,
    business_number text,
    address_street text not null,
    address_city text not null,
    address_state text not null,
    address_zip text not null,
    address_country text not null default 'US',
    website text,
    email text,
    phone text,
    verification_result jsonb,
    status text check (
        status in ('pending', 'approved', 'rejected')
    ) not null default 'pending',
    reviewed_by uuid references auth.users (id),
    reviewed_at timestamptz,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS policies for business_verifications
alter table public.business_verifications enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'business_verifications' and policyname = 'Business verifications select own'
  ) then
    create policy "Business verifications select own" on public.business_verifications
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'business_verifications' and policyname = 'Business verifications insert own'
  ) then
    create policy "Business verifications insert own" on public.business_verifications
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- Index for efficient queries
create index if not exists business_verifications_user_id_idx on public.business_verifications (user_id);
create index if not exists business_verifications_status_idx on public.business_verifications (status);
