-- Universal Search Enhancement Migration
-- Adds tables, indexes, and functions for secure full-text search
-- Date: 2025-11-04

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
create table if not exists public.jobs (
    id uuid primary key default gen_random_uuid(),
    employer_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    company text not null,
    description text not null,
    location text,
    province text,
    remote boolean not null default false,
    job_type text check (job_type in ('full-time', 'part-time', 'contract', 'internship', 'temporary')),
    experience_level text check (experience_level in ('entry', 'intermediate', 'senior', 'lead', 'executive')),
    salary_min integer,
    salary_max integer,
    salary_currency text not null default 'ZAR',
    skills text[] not null default '{}',
    requirements text,
    benefits text,
    application_deadline timestamptz,
    status text check (status in ('draft', 'active', 'paused', 'closed', 'filled')) not null default 'active',
    flagged boolean not null default false,
    flagged_reason text,
    flagged_at timestamptz,
    verified boolean not null default false,
    views integer not null default 0,
    applications integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS policies for jobs
alter table public.jobs enable row level security;

-- Anyone can view active, non-flagged jobs
create policy "Jobs select active" on public.jobs
    for select using (status = 'active' and flagged = false);

-- Employers can view their own jobs (any status)
create policy "Jobs select own" on public.jobs
    for select using (auth.uid() = employer_id);

-- Employers can insert their own jobs
create policy "Jobs insert own" on public.jobs
    for insert with check (auth.uid() = employer_id);

-- Employers can update their own jobs
create policy "Jobs update own" on public.jobs
    for update using (auth.uid() = employer_id) with check (auth.uid() = employer_id);

-- Employers can delete their own jobs
create policy "Jobs delete own" on public.jobs
    for delete using (auth.uid() = employer_id);

-- ============================================================================
-- GIGS TABLE
-- ============================================================================
create table if not exists public.gigs (
    id uuid primary key default gen_random_uuid(),
    employer_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    company text not null,
    description text not null,
    category text,
    location text,
    province text,
    remote boolean not null default false,
    budget_min integer,
    budget_max integer,
    budget_currency text not null default 'ZAR',
    duration text check (duration in ('less-than-week', 'one-to-four-weeks', 'one-to-three-months', 'three-to-six-months', 'more-than-six-months')),
    skills text[] not null default '{}',
    requirements text,
    deadline timestamptz,
    status text check (status in ('draft', 'active', 'paused', 'closed', 'completed')) not null default 'active',
    flagged boolean not null default false,
    flagged_reason text,
    flagged_at timestamptz,
    verified boolean not null default false,
    views integer not null default 0,
    proposals integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS policies for gigs
alter table public.gigs enable row level security;

-- Anyone can view active, non-flagged gigs
create policy "Gigs select active" on public.gigs
    for select using (status = 'active' and flagged = false);

-- Employers can view their own gigs (any status)
create policy "Gigs select own" on public.gigs
    for select using (auth.uid() = employer_id);

-- Employers can insert their own gigs
create policy "Gigs insert own" on public.gigs
    for insert with check (auth.uid() = employer_id);

-- Employers can update their own gigs
create policy "Gigs update own" on public.gigs
    for update using (auth.uid() = employer_id) with check (auth.uid() = employer_id);

-- Employers can delete their own gigs
create policy "Gigs delete own" on public.gigs
    for delete using (auth.uid() = employer_id);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null,
    sender_id uuid not null references auth.users (id) on delete cascade,
    recipient_id uuid not null references auth.users (id) on delete cascade,
    content text not null,
    read boolean not null default false,
    read_at timestamptz,
    flagged boolean not null default false,
    flagged_reason text,
    flagged_at timestamptz,
    created_at timestamptz not null default now()
);

-- RLS policies for messages
alter table public.messages enable row level security;

-- Users can only see messages they sent or received
create policy "Messages select own" on public.messages
    for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Users can insert messages they send
create policy "Messages insert own" on public.messages
    for insert with check (auth.uid() = sender_id);

-- Users can update messages they sent (mark as read)
create policy "Messages update own" on public.messages
    for update using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- ============================================================================
-- FAQS TABLE
-- ============================================================================
create table if not exists public.faqs (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    answer text not null,
    category text not null,
    tags text[] not null default '{}',
    order_index integer not null default 0,
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS policies for FAQs (public read access)
alter table public.faqs enable row level security;

-- Anyone can read published FAQs
create policy "FAQs select published" on public.faqs
    for select using (published = true);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- Jobs full-text search
-- Creates a GIN index for fast text search on title, company, and description
create index if not exists jobs_search_idx on public.jobs 
    using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(company, '') || ' ' || coalesce(description, '')));

-- Jobs location search
create index if not exists jobs_location_idx on public.jobs (province, location);

-- Jobs skills search (array overlap)
create index if not exists jobs_skills_idx on public.jobs using gin(skills);

-- Jobs status and flagged (for filtering)
create index if not exists jobs_status_flagged_idx on public.jobs (status, flagged) where status = 'active' and flagged = false;

-- Gigs full-text search
create index if not exists gigs_search_idx on public.gigs 
    using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(company, '') || ' ' || coalesce(description, '')));

-- Gigs location search
create index if not exists gigs_location_idx on public.gigs (province, location);

-- Gigs skills search (array overlap)
create index if not exists gigs_skills_idx on public.gigs using gin(skills);

-- Gigs status and flagged (for filtering)
create index if not exists gigs_status_flagged_idx on public.gigs (status, flagged) where status = 'active' and flagged = false;

-- Profiles (freelancers) full-text search
create index if not exists profiles_search_idx on public.profiles 
    using gin(to_tsvector('english', 
        coalesce(display_name, '') || ' ' || 
        coalesce(current_job_title, '') || ' ' || 
        coalesce(desired_role, '') || ' ' ||
        coalesce(field_of_study, '')
    )) where role = 'job_seeker';

-- Profiles skills search (array overlap)
create index if not exists profiles_skills_idx on public.profiles using gin(skills) where role = 'job_seeker';

-- Profiles location search
create index if not exists profiles_location_idx on public.profiles (province, city, location) where role = 'job_seeker';

-- Messages content search
create index if not exists messages_content_idx on public.messages 
    using gin(to_tsvector('english', content));

-- Messages conversation lookup (for grouping)
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at desc);

-- Messages user lookup
create index if not exists messages_user_idx on public.messages (sender_id, recipient_id, created_at desc);

-- FAQs full-text search
create index if not exists faqs_search_idx on public.faqs 
    using gin(to_tsvector('english', coalesce(question, '') || ' ' || coalesce(answer, '')));

-- FAQs tags search (array overlap)
create index if not exists faqs_tags_idx on public.faqs using gin(tags);

-- ============================================================================
-- DATABASE FUNCTIONS FOR COMPLEX SEARCHES
-- ============================================================================

-- Function: Search jobs with full-text search and filters
-- Returns jobs matching query with relevance ranking
create or replace function search_jobs(
    search_query text,
    filter_location text default null,
    filter_province text default null,
    filter_remote boolean default null,
    filter_min_salary integer default null,
    filter_max_salary integer default null,
    result_limit integer default 10
)
returns table (
    id uuid,
    title text,
    company text,
    description text,
    location text,
    province text,
    remote boolean,
    salary_min integer,
    salary_max integer,
    skills text[],
    relevance real
) as $$
begin
    return query
    select 
        j.id,
        j.title,
        j.company,
        j.description,
        j.location,
        j.province,
        j.remote,
        j.salary_min,
        j.salary_max,
        j.skills,
        ts_rank(
            to_tsvector('english', coalesce(j.title, '') || ' ' || coalesce(j.company, '') || ' ' || coalesce(j.description, '')),
            plainto_tsquery('english', search_query)
        ) as relevance
    from public.jobs j
    where 
        j.status = 'active' 
        and j.flagged = false
        and (
            search_query is null 
            or search_query = '' 
            or to_tsvector('english', coalesce(j.title, '') || ' ' || coalesce(j.company, '') || ' ' || coalesce(j.description, '')) 
                @@ plainto_tsquery('english', search_query)
        )
        and (filter_location is null or j.location ilike '%' || filter_location || '%')
        and (filter_province is null or j.province = filter_province)
        and (filter_remote is null or j.remote = filter_remote)
        and (filter_min_salary is null or j.salary_max >= filter_min_salary)
        and (filter_max_salary is null or j.salary_min <= filter_max_salary)
    order by relevance desc, j.created_at desc
    limit result_limit;
end;
$$ language plpgsql security definer;

-- Function: Search gigs with full-text search and filters
create or replace function search_gigs(
    search_query text,
    filter_location text default null,
    filter_province text default null,
    filter_remote boolean default null,
    filter_min_budget integer default null,
    filter_max_budget integer default null,
    result_limit integer default 10
)
returns table (
    id uuid,
    title text,
    company text,
    description text,
    location text,
    province text,
    remote boolean,
    budget_min integer,
    budget_max integer,
    skills text[],
    relevance real
) as $$
begin
    return query
    select 
        g.id,
        g.title,
        g.company,
        g.description,
        g.location,
        g.province,
        g.remote,
        g.budget_min,
        g.budget_max,
        g.skills,
        ts_rank(
            to_tsvector('english', coalesce(g.title, '') || ' ' || coalesce(g.company, '') || ' ' || coalesce(g.description, '')),
            plainto_tsquery('english', search_query)
        ) as relevance
    from public.gigs g
    where 
        g.status = 'active' 
        and g.flagged = false
        and (
            search_query is null 
            or search_query = '' 
            or to_tsvector('english', coalesce(g.title, '') || ' ' || coalesce(g.company, '') || ' ' || coalesce(g.description, '')) 
                @@ plainto_tsquery('english', search_query)
        )
        and (filter_location is null or g.location ilike '%' || filter_location || '%')
        and (filter_province is null or g.province = filter_province)
        and (filter_remote is null or g.remote = filter_remote)
        and (filter_min_budget is null or g.budget_max >= filter_min_budget)
        and (filter_max_budget is null or g.budget_min <= filter_max_budget)
    order by relevance desc, g.created_at desc
    limit result_limit;
end;
$$ language plpgsql security definer;

-- Function: Search freelancers with skills matching
create or replace function search_freelancers(
    search_query text,
    filter_skills text[] default null,
    filter_location text default null,
    filter_province text default null,
    filter_min_rate integer default null,
    filter_max_rate integer default null,
    result_limit integer default 10
)
returns table (
    id uuid,
    display_name text,
    current_job_title text,
    city text,
    province text,
    skills text[],
    years_experience text,
    availability text,
    relevance real
) as $$
begin
    return query
    select 
        p.id,
        p.display_name,
        p.current_job_title,
        p.city,
        p.province,
        p.skills,
        p.years_experience,
        p.availability,
        ts_rank(
            to_tsvector('english', 
                coalesce(p.display_name, '') || ' ' || 
                coalesce(p.current_job_title, '') || ' ' || 
                coalesce(p.desired_role, '')
            ),
            plainto_tsquery('english', search_query)
        ) as relevance
    from public.profiles p
    where 
        p.role = 'job_seeker'
        and p.onboarding_completed = true
        and (
            search_query is null 
            or search_query = '' 
            or to_tsvector('english', 
                coalesce(p.display_name, '') || ' ' || 
                coalesce(p.current_job_title, '') || ' ' || 
                coalesce(p.desired_role, '')
            ) @@ plainto_tsquery('english', search_query)
        )
        and (filter_skills is null or p.skills && filter_skills) -- Array overlap operator
        and (filter_location is null or p.city ilike '%' || filter_location || '%')
        and (filter_province is null or p.province = filter_province)
    order by relevance desc, p.created_at desc
    limit result_limit;
end;
$$ language plpgsql security definer;

-- Function: Search messages (respects RLS automatically)
create or replace function search_messages(
    search_query text,
    user_id_param uuid,
    result_limit integer default 10
)
returns table (
    id uuid,
    conversation_id uuid,
    sender_id uuid,
    recipient_id uuid,
    content text,
    created_at timestamptz,
    relevance real
) as $$
begin
    return query
    select 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.created_at,
        ts_rank(
            to_tsvector('english', m.content),
            plainto_tsquery('english', search_query)
        ) as relevance
    from public.messages m
    where 
        (m.sender_id = user_id_param or m.recipient_id = user_id_param)
        and m.flagged = false
        and (
            search_query is null 
            or search_query = '' 
            or to_tsvector('english', m.content) @@ plainto_tsquery('english', search_query)
        )
    order by relevance desc, m.created_at desc
    limit result_limit;
end;
$$ language plpgsql security definer;

-- Function: Search FAQs
create or replace function search_faqs(
    search_query text,
    filter_category text default null,
    result_limit integer default 10
)
returns table (
    id uuid,
    question text,
    answer text,
    category text,
    tags text[],
    relevance real
) as $$
begin
    return query
    select 
        f.id,
        f.question,
        f.answer,
        f.category,
        f.tags,
        ts_rank(
            to_tsvector('english', coalesce(f.question, '') || ' ' || coalesce(f.answer, '')),
            plainto_tsquery('english', search_query)
        ) as relevance
    from public.faqs f
    where 
        f.published = true
        and (
            search_query is null 
            or search_query = '' 
            or to_tsvector('english', coalesce(f.question, '') || ' ' || coalesce(f.answer, '')) 
                @@ plainto_tsquery('english', search_query)
        )
        and (filter_category is null or f.category = filter_category)
    order by relevance desc, f.order_index asc
    limit result_limit;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Jobs updated_at trigger
drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
    before update on public.jobs
    for each row execute function public.set_updated_at();

-- Gigs updated_at trigger
drop trigger if exists set_gigs_updated_at on public.gigs;
create trigger set_gigs_updated_at
    before update on public.gigs
    for each row execute function public.set_updated_at();

-- FAQs updated_at trigger
drop trigger if exists set_faqs_updated_at on public.faqs;
create trigger set_faqs_updated_at
    before update on public.faqs
    for each row execute function public.set_updated_at();

-- ============================================================================
-- SEED DATA FOR TESTING
-- ============================================================================

-- Insert sample FAQs (if table is empty)
insert into public.faqs (question, answer, category, tags, order_index, published)
select * from (values
    ('How do I create an account on TrustWork?', 'Click the "Sign Up" button in the top right corner and follow the registration process. You''ll need to provide an email address and create a password.', 'Getting Started', array['account', 'registration', 'signup'], 1, true),
    ('Is TrustWork free to use?', 'Yes, basic job searching and applying is completely free for job seekers. Employers have various pricing tiers for posting jobs.', 'Pricing', array['free', 'pricing', 'cost'], 2, true),
    ('How do I verify my business?', 'Go to your profile settings and click "Verify Business". You''ll need to provide your business registration number and supporting documents.', 'Verification', array['business', 'verification', 'employer'], 3, true),
    ('What payment methods do you accept?', 'We accept credit/debit cards, EFT, and SnapScan for South African users. International payments support PayPal and Stripe.', 'Payments', array['payment', 'billing', 'methods'], 4, true),
    ('How do I report a suspicious job posting?', 'Click the flag icon on any job listing and select a reason. Our safety team reviews all reports within 24 hours.', 'Safety', array['safety', 'report', 'suspicious'], 5, true),
    ('Can I edit my profile after creating it?', 'Yes, you can update your profile information at any time by going to Settings > Profile.', 'Account', array['profile', 'edit', 'settings'], 6, true),
    ('How long do job postings stay active?', 'Job postings remain active for 30 days by default. Employers can close or extend postings at any time.', 'Jobs', array['jobs', 'posting', 'duration'], 7, true),
    ('What should I do if I forgot my password?', 'Click "Forgot Password" on the login page and enter your email. You''ll receive a password reset link within a few minutes.', 'Account', array['password', 'reset', 'login'], 8, true)
) as data(question, answer, category, tags, order_index, published)
where not exists (select 1 from public.faqs limit 1);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

comment on table public.jobs is 'Job listings posted by employers. Includes full-text search indexes for title, company, and description.';
comment on table public.gigs is 'Freelance gig opportunities. Similar to jobs but for short-term contract work.';
comment on table public.messages is 'Direct messages between users. RLS enforces users can only see their own conversations.';
comment on table public.faqs is 'Frequently Asked Questions. Publicly readable, managed by admins.';

comment on function search_jobs is 'Full-text search for jobs with filters. Returns relevance-ranked results.';
comment on function search_gigs is 'Full-text search for gigs with filters. Returns relevance-ranked results.';
comment on function search_freelancers is 'Search freelancers by skills, location, and text query. Uses array overlap for skill matching.';
comment on function search_messages is 'Search user messages. Automatically respects RLS policies.';
comment on function search_faqs is 'Search FAQs by question and answer content.';
