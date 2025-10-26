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
    -- Public URL to the user's uploaded CV/resume in Supabase Storage
    cv_url text,
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