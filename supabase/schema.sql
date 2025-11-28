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

-- ============================================================
-- ASSIGNMENTS TABLE (Job/Gig Postings)
-- ============================================================

create table if not exists public.assignments (
    id uuid primary key default gen_random_uuid (),
    client_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    description text not null,
    budget_min decimal(10, 2),
    budget_max decimal(10, 2),
    budget_type text check (
        budget_type in ('fixed', 'hourly', 'negotiable')
    ) default 'fixed',
    deadline timestamptz,
    status text check (
        status in ('draft', 'open', 'in_progress', 'completed', 'cancelled')
    ) not null default 'open',
    required_skills text[] not null default '{}',
    experience_level text check (
        experience_level in ('entry', 'intermediate', 'expert', 'any')
    ) default 'any',
    job_type text check (
        job_type in ('full_time', 'part_time', 'contract', 'freelance')
    ) default 'freelance',
    location text,
    remote_allowed boolean default true,
    category text,
    required_certification_level text check (
        required_certification_level in ('foundation', 'intermediate', 'advanced', 'expert')
    ),
    applications_count integer not null default 0,
    views_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Trigger for assignments updated_at
drop trigger if exists set_assignments_updated_at on public.assignments;

create trigger set_assignments_updated_at
before update on public.assignments
for each row execute function public.set_updated_at();

-- RLS policies for assignments
alter table public.assignments enable row level security;

-- Anyone can view open assignments
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'assignments' and policyname = 'Assignments select all open'
  ) then
    create policy "Assignments select all open" on public.assignments
      for select using (status = 'open' or auth.uid() = client_id);
  end if;
end $$;

-- Employers can create assignments
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'assignments' and policyname = 'Assignments insert by employers'
  ) then
    create policy "Assignments insert by employers" on public.assignments
      for insert with check (
        auth.uid() = client_id and 
        exists (
          select 1 from public.profiles 
          where id = auth.uid() and role = 'employer'
        )
      );
  end if;
end $$;

-- Employers can update their own assignments
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'assignments' and policyname = 'Assignments update own'
  ) then
    create policy "Assignments update own" on public.assignments
      for update using (auth.uid() = client_id) with check (auth.uid() = client_id);
  end if;
end $$;

-- Employers can delete their own assignments
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'assignments' and policyname = 'Assignments delete own'
  ) then
    create policy "Assignments delete own" on public.assignments
      for delete using (auth.uid() = client_id);
  end if;
end $$;

-- Indexes for efficient queries
create index if not exists assignments_client_id_idx on public.assignments (client_id);
create index if not exists assignments_status_idx on public.assignments (status);
create index if not exists assignments_created_at_idx on public.assignments (created_at desc);
create index if not exists assignments_category_idx on public.assignments (category);
create index if not exists assignments_required_skills_idx on public.assignments using gin (required_skills);

-- ============================================================
-- APPLICATIONS TABLE (Freelancer Applications to Jobs)
-- ============================================================

create table if not exists public.applications (
    id uuid primary key default gen_random_uuid (),
    assignment_id uuid not null references public.assignments (id) on delete cascade,
    freelancer_id uuid not null references auth.users (id) on delete cascade,
    proposal text not null,
    cover_letter text,
    bid_amount decimal(10, 2),
    estimated_duration text,
    estimated_start_date timestamptz,
    status text check (
        status in ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn')
    ) not null default 'pending',
    reviewed_at timestamptz,
    reviewed_by uuid references auth.users (id),
    rejection_reason text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Ensure one application per freelancer per assignment
    unique (assignment_id, freelancer_id)
);

-- Trigger for applications updated_at
drop trigger if exists set_applications_updated_at on public.applications;

create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

-- Function to increment applications_count on assignments
create or replace function public.increment_applications_count()
returns trigger as $$
begin
  update public.assignments
  set applications_count = applications_count + 1
  where id = new.assignment_id;
  return new;
end;
$$ language plpgsql;

-- Function to decrement applications_count on assignments
create or replace function public.decrement_applications_count()
returns trigger as $$
begin
  update public.assignments
  set applications_count = applications_count - 1
  where id = old.assignment_id;
  return old;
end;
$$ language plpgsql;

-- Triggers for applications count
drop trigger if exists increment_applications_count on public.applications;
drop trigger if exists decrement_applications_count on public.applications;

create trigger increment_applications_count
after insert on public.applications
for each row execute function public.increment_applications_count();

create trigger decrement_applications_count
after delete on public.applications
for each row execute function public.decrement_applications_count();

-- RLS policies for applications
alter table public.applications enable row level security;

-- Freelancers can view their own applications
-- Employers can view applications to their assignments
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'applications' and policyname = 'Applications select own or employer'
  ) then
    create policy "Applications select own or employer" on public.applications
      for select using (
        auth.uid() = freelancer_id or
        auth.uid() in (
          select client_id from public.assignments where id = assignment_id
        )
      );
  end if;
end $$;

-- Freelancers can submit applications
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'applications' and policyname = 'Applications insert by job seekers'
  ) then
    create policy "Applications insert by job seekers" on public.applications
      for insert with check (
        auth.uid() = freelancer_id and
        exists (
          select 1 from public.profiles 
          where id = auth.uid() and role = 'job_seeker'
        )
      );
  end if;
end $$;

-- Freelancers can update their own pending applications
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'applications' and policyname = 'Applications update own pending'
  ) then
    create policy "Applications update own pending" on public.applications
      for update using (
        auth.uid() = freelancer_id and status = 'pending'
      ) with check (
        auth.uid() = freelancer_id
      );
  end if;
end $$;

-- Employers can update applications to their assignments (for review)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'applications' and policyname = 'Applications update by employer'
  ) then
    create policy "Applications update by employer" on public.applications
      for update using (
        auth.uid() in (
          select client_id from public.assignments where id = assignment_id
        )
      );
  end if;
end $$;

-- Freelancers can delete their own pending applications
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'applications' and policyname = 'Applications delete own pending'
  ) then
    create policy "Applications delete own pending" on public.applications
      for delete using (
        auth.uid() = freelancer_id and status = 'pending'
      );
  end if;
end $$;

-- Indexes for efficient queries
create index if not exists applications_assignment_id_idx on public.applications (assignment_id);
create index if not exists applications_freelancer_id_idx on public.applications (freelancer_id);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- ============================================================
-- CONVERSATIONS TABLE (Messaging)
-- ============================================================

create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid (),
    participant_1_id uuid not null references auth.users (id) on delete cascade,
    participant_2_id uuid not null references auth.users (id) on delete cascade,
    assignment_id uuid references public.assignments (id) on delete set null,
    application_id uuid references public.applications (id) on delete set null,
    last_message_at timestamptz,
    last_message_preview text,
    participant_1_unread_count integer not null default 0,
    participant_2_unread_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Ensure conversation participants are ordered (smaller UUID first) and unique
    check (participant_1_id < participant_2_id),
    unique (participant_1_id, participant_2_id)
);

-- Trigger for conversations updated_at
drop trigger if exists set_conversations_updated_at on public.conversations;

create trigger set_conversations_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

-- RLS policies for conversations
alter table public.conversations enable row level security;

-- Users can view conversations they're part of
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'conversations' and policyname = 'Conversations select own'
  ) then
    create policy "Conversations select own" on public.conversations
      for select using (
        auth.uid() = participant_1_id or auth.uid() = participant_2_id
      );
  end if;
end $$;

-- Users can create conversations with others
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'conversations' and policyname = 'Conversations insert by participants'
  ) then
    create policy "Conversations insert by participants" on public.conversations
      for insert with check (
        auth.uid() = participant_1_id or auth.uid() = participant_2_id
      );
  end if;
end $$;

-- Users can update conversations they're part of
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'conversations' and policyname = 'Conversations update own'
  ) then
    create policy "Conversations update own" on public.conversations
      for update using (
        auth.uid() = participant_1_id or auth.uid() = participant_2_id
      ) with check (
        auth.uid() = participant_1_id or auth.uid() = participant_2_id
      );
  end if;
end $$;

-- Indexes for efficient queries
create index if not exists conversations_participant_1_id_idx on public.conversations (participant_1_id);
create index if not exists conversations_participant_2_id_idx on public.conversations (participant_2_id);
create index if not exists conversations_last_message_at_idx on public.conversations (last_message_at desc);
create index if not exists conversations_assignment_id_idx on public.conversations (assignment_id);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================

create table if not exists public.messages (
    id uuid primary key default gen_random_uuid (),
    conversation_id uuid not null references public.conversations (id) on delete cascade,
    sender_id uuid not null references auth.users (id) on delete cascade,
    content text not null,
    attachment_url text,
    attachment_name text,
    attachment_size integer,
    read boolean not null default false,
    read_at timestamptz,
    edited boolean not null default false,
    edited_at timestamptz,
    created_at timestamptz not null default now()
);

-- Function to update conversation metadata when message is sent
create or replace function public.update_conversation_on_message()
returns trigger as $$
declare
  other_participant_id uuid;
begin
  -- Update last_message_at and preview
  update public.conversations
  set 
    last_message_at = new.created_at,
    last_message_preview = left(new.content, 100)
  where id = new.conversation_id;
  
  -- Increment unread count for the other participant
  select case 
    when participant_1_id = new.sender_id then participant_2_id
    else participant_1_id
  end into other_participant_id
  from public.conversations
  where id = new.conversation_id;
  
  if other_participant_id is not null then
    update public.conversations
    set participant_1_unread_count = case 
        when participant_1_id = other_participant_id then participant_1_unread_count + 1
        else participant_1_unread_count
      end,
      participant_2_unread_count = case 
        when participant_2_id = other_participant_id then participant_2_unread_count + 1
        else participant_2_unread_count
      end
    where id = new.conversation_id;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Trigger for updating conversation on new message
drop trigger if exists update_conversation_on_message on public.messages;

create trigger update_conversation_on_message
after insert on public.messages
for each row execute function public.update_conversation_on_message();

-- RLS policies for messages
alter table public.messages enable row level security;

-- Users can view messages in their conversations
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'messages' and policyname = 'Messages select in own conversations'
  ) then
    create policy "Messages select in own conversations" on public.messages
      for select using (
        exists (
          select 1 from public.conversations
          where id = conversation_id and
          (auth.uid() = participant_1_id or auth.uid() = participant_2_id)
        )
      );
  end if;
end $$;

-- Users can send messages in their conversations
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'messages' and policyname = 'Messages insert in own conversations'
  ) then
    create policy "Messages insert in own conversations" on public.messages
      for insert with check (
        auth.uid() = sender_id and
        exists (
          select 1 from public.conversations
          where id = conversation_id and
          (auth.uid() = participant_1_id or auth.uid() = participant_2_id)
        )
      );
  end if;
end $$;

-- Users can update their own messages (for editing)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'messages' and policyname = 'Messages update own'
  ) then
    create policy "Messages update own" on public.messages
      for update using (auth.uid() = sender_id) with check (auth.uid() = sender_id);
  end if;
end $$;

-- Users can delete their own messages
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'messages' and policyname = 'Messages delete own'
  ) then
    create policy "Messages delete own" on public.messages
      for delete using (auth.uid() = sender_id);
  end if;
end $$;

-- Indexes for efficient queries
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at desc);

-- =============================================
-- Escrow Payments Table
-- =============================================

create table if not exists public.escrow_payments (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  payer_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10,2) not null check (amount > 0),
  platform_fee numeric(10,2) not null default 0 check (platform_fee >= 0),
  total_amount numeric(10,2) not null check (total_amount > 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'held', 'released', 'refunded', 'disputed')),
  payment_method text not null check (payment_method in ('stripe', 'paypal')),
  payment_intent_id text,
  paypal_order_id text,
  held_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Trigger for updating escrow_payments updated_at
drop trigger if exists set_escrow_payments_updated_at on public.escrow_payments;

create trigger set_escrow_payments_updated_at
before update on public.escrow_payments
for each row execute function public.set_updated_at();

-- RLS policies for escrow_payments
alter table public.escrow_payments enable row level security;

-- Users can view their own payments (as payer or recipient)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'escrow_payments' and policyname = 'Escrow payments select own'
  ) then
    create policy "Escrow payments select own" on public.escrow_payments
      for select using (auth.uid() = payer_id or auth.uid() = recipient_id);
  end if;
end $$;

-- Only payers can create payments
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'escrow_payments' and policyname = 'Escrow payments insert as payer'
  ) then
    create policy "Escrow payments insert as payer" on public.escrow_payments
      for insert with check (auth.uid() = payer_id);
  end if;
end $$;

-- Indexes for efficient queries
create index if not exists escrow_payments_assignment_id_idx on public.escrow_payments (assignment_id);
create index if not exists escrow_payments_payer_id_idx on public.escrow_payments (payer_id);
create index if not exists escrow_payments_recipient_id_idx on public.escrow_payments (recipient_id);
create index if not exists escrow_payments_status_idx on public.escrow_payments (status);
create index if not exists escrow_payments_created_at_idx on public.escrow_payments (created_at desc);

-- =============================================
-- Safety Reports Table
-- =============================================

create table if not exists public.safety_reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reported_assignment_id uuid references public.assignments(id) on delete cascade,
  report_type text not null check (report_type in ('scam', 'fraud', 'harassment', 'inappropriate_content', 'fake_profile', 'payment_issue', 'safety_concern', 'other')),
  category text not null check (category in ('user', 'assignment', 'message', 'payment', 'other')),
  title text not null,
  description text not null,
  evidence_urls text[] default array[]::text[],
  status text not null default 'pending' check (status in ('pending', 'investigating', 'resolved', 'dismissed', 'escalated')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution_notes text,
  resolved_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Trigger for updating safety_reports updated_at
drop trigger if exists set_safety_reports_updated_at on public.safety_reports;

create trigger set_safety_reports_updated_at
before update on public.safety_reports
for each row execute function public.set_updated_at();

-- RLS policies for safety_reports
alter table public.safety_reports enable row level security;

-- Users can view their own submitted reports
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'safety_reports' and policyname = 'Safety reports select own'
  ) then
    create policy "Safety reports select own" on public.safety_reports
      for select using (auth.uid() = reporter_id);
  end if;
end $$;

-- Users can create safety reports
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'safety_reports' and policyname = 'Safety reports insert'
  ) then
    create policy "Safety reports insert" on public.safety_reports
      for insert with check (auth.uid() = reporter_id);
  end if;
end $$;

-- Indexes for efficient queries
create index if not exists safety_reports_reporter_id_idx on public.safety_reports (reporter_id);
create index if not exists safety_reports_reported_user_id_idx on public.safety_reports (reported_user_id);
create index if not exists safety_reports_reported_assignment_id_idx on public.safety_reports (reported_assignment_id);
create index if not exists safety_reports_status_idx on public.safety_reports (status);
create index if not exists safety_reports_priority_idx on public.safety_reports (priority);
create index if not exists safety_reports_created_at_idx on public.safety_reports (created_at desc);
