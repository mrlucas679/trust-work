# TrustWork Database Migration Deployment Guide

## Overview

This guide helps you deploy all 6 database migrations to your Supabase project. These migrations enable critical features like search, messaging, analytics, and job applications with comprehensive security (RLS policies).

**Total Time Required**: ~15-20 minutes  
**Prerequisites**: Supabase project with base schema.sql applied

## Quick Navigation

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Methods](#deployment-methods)
  - [Method 1: Web Dashboard (Recommended)](#method-1-web-dashboard-recommended)
  - [Method 2: Supabase CLI](#method-2-supabase-cli-alternative)
- [Migration Order](#migration-order)
- [Verification Steps](#verification-steps)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying migrations, ensure:

- [ ] ✅ Base `schema.sql` has been applied
- [ ] ✅ Supabase project is accessible
- [ ] ✅ You have project credentials (URL and anon key)
- [ ] ✅ `.env` file is configured locally
- [ ] ✅ No active transactions in production (if applicable)

### Verify Base Schema Exists

Run this query in Supabase SQL Editor:

```sql
-- Check if base tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'notifications');
```

**Expected Result**: Both `profiles` and `notifications` should be listed.

---

## Deployment Methods

### Method 1: Web Dashboard (Recommended)

**Pros**: Simple, visual feedback, no CLI setup  
**Cons**: Manual copy-paste for each migration

#### Step-by-Step Instructions

1. **Open Supabase SQL Editor**
   - Navigate to: <https://supabase.com/dashboard/project/sojjizqahgphybdijqaj/sql>
   - Or: Your Project → SQL Editor → New Query

2. **Apply Migrations in Order** (CRITICAL: Follow this order)

   For each migration file:

   a. Open the migration file from `supabase/migrations/`
   b. Copy **ALL** contents (Ctrl+A → Ctrl+C)
   c. Paste into SQL Editor
   d. Click **"Run"** (or press Ctrl+Enter)
   e. Wait for green success message
   f. Proceed to next migration

   **Migration Order**:

   ```
   ✓ Base schema (already applied)
   → 001_search_and_discovery.sql
   → 002_messaging_and_communication.sql
   → 003_notifications_system.sql
   → 004_analytics_system.sql
   → 005_search_system.sql
   → 006_application_system.sql
   ```

3. **Track Applied Migrations**

   After each migration, verify it applied:

   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

---

### Method 2: Supabase CLI (Alternative)

**Pros**: Automated, repeatable, tracks migrations  
**Cons**: Requires CLI installation

#### Setup Supabase CLI

```powershell
# Install Supabase CLI (if not installed)
scoop install supabase  # or use npm: npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref sojjizqahgphybdijqaj
```

#### Deploy Migrations

```powershell
# Navigate to project root
cd "c:\Users\Tekashi\Documents\my interview\trust-work"

# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/001_search_and_discovery.sql
```

---

## Migration Order

**CRITICAL**: Apply migrations in this exact order to avoid dependency errors.

### 001: Search and Discovery (Estimated: 5-10 seconds)

**Creates**:

- `saved_searches` table
- Enhanced `assignments` table with search fields
- Full-text search indexes
- RLS policies for secure access
- `search_assignments()` and `search_freelancers()` functions

**Verification**:

```sql
-- Check tables exist
SELECT * FROM public.saved_searches LIMIT 1;

-- Check assignments has new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'assignments' 
  AND column_name IN ('location', 'province', 'budget_min', 'budget_max');
```

---

### 002: Messaging and Communication (Estimated: 5-10 seconds)

**Creates**:

- `conversations` table
- `messages` table
- RLS policies for privacy
- Indexes for performance
- Triggers for unread counts

**Verification**:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('conversations', 'messages');

-- Check RLS policies
SELECT policyname 
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages');
```

---

### 003: Notifications System (Estimated: 3-5 seconds)

**Creates**:

- Enhanced notification types
- Notification templates
- Trigger functions for auto-notifications
- Priority system

**Verification**:

```sql
-- Check notification types
SELECT DISTINCT type FROM public.notifications;

-- Verify triggers exist
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'notifications';
```

---

### 004: Analytics System (Estimated: 10-15 seconds)

**Creates**:

- `profile_views` table
- `assignment_views` table
- `user_actions` table
- Analytics RPC functions
- Aggregation views
- Performance indexes

**Verification**:

```sql
-- Check analytics tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%_views' OR table_name = 'user_actions';

-- Check analytics functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%analytics%';
```

---

### 005: Advanced Search System (Estimated: 5-10 seconds)

**Creates**:

- Full-text search vectors
- GIN indexes for fast search
- Search ranking functions
- Advanced filter functions

**Verification**:

```sql
-- Check search indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'assignments' 
  AND indexname LIKE '%search%';

-- Test search function
SELECT * FROM search_assignments('developer', NULL, NULL, NULL, NULL, NULL, NULL, NULL) LIMIT 5;
```

---

### 006: Application System (Estimated: 10-15 seconds)

**Creates**:

- `applications` table with 14 columns
- 6 RLS policies for security
- 5 database triggers (timestamps, status tracking, acceptance)
- 4 new columns on `assignments` table
- `get_assignment_application_stats()` RPC
- `can_apply_to_assignment()` validation RPC
- 2 database views

**Security Features**:

- ✅ Row-Level Security prevents unauthorized access
- ✅ Automatic audit trail via triggers
- ✅ Business logic enforcement (auto-reject competing apps)
- ✅ Input validation at database level

**Verification**:

```sql
-- Check applications table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;

-- Check RLS policies (should have 6)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'applications';

-- Check triggers (should have 5)
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'applications';

-- Test RPC functions
SELECT * FROM get_assignment_application_stats('00000000-0000-0000-0000-000000000000');
```

---

## Verification Steps

After deploying all migrations, run this comprehensive verification:

```sql
-- ============================================================================
-- Complete Verification Script
-- ============================================================================

-- 1. Check all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'profiles' THEN 'Base Schema'
        WHEN table_name = 'notifications' THEN 'Base Schema'
        WHEN table_name IN ('saved_searches', 'assignments') THEN 'Migration 001'
        WHEN table_name IN ('conversations', 'messages') THEN 'Migration 002'
        WHEN table_name LIKE '%_views' OR table_name = 'user_actions' THEN 'Migration 004'
        WHEN table_name = 'applications' THEN 'Migration 006'
        ELSE 'Other'
    END as source
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY source, table_name;

-- 2. Check RLS is enabled on all tables
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. Check database functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- 4. Check indexes for performance
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('assignments', 'applications', 'messages', 'profile_views')
ORDER BY tablename, indexname;

-- 5. Check triggers
SELECT 
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Expected Results

- **Tables**: 12-15 public tables (profiles, notifications, assignments, saved_searches, conversations, messages, applications, analytics tables)
- **RLS Policies**: 25-30 policies total
  - applications: 6 policies
  - conversations: 3-4 policies
  - messages: 3-4 policies
  - profiles: 3 policies
- **Functions**: 8-12 RPC functions (search, analytics, application validation)
- **Triggers**: 8-12 triggers (updated_at, status tracking, notifications)
- **Indexes**: 15-25 indexes (primary keys, foreign keys, search indexes)

---

## Post-Deployment Testing

### 1. Test Authentication Flow

```typescript
// In your app, verify user can sign up and profile is created
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123456'
});
```

### 2. Test RLS Policies

```sql
-- Switch to a test user context
SET request.jwt.claim.sub = 'your-test-user-uuid';

-- Try to access another user's data (should fail)
SELECT * FROM public.applications WHERE freelancer_id != 'your-test-user-uuid';
```

### 3. Test Search Function

```sql
-- Search for assignments
SELECT * FROM search_assignments(
  'web developer',  -- query
  'Gauteng',        -- province
  NULL,             -- location
  NULL,             -- budget_min
  NULL,             -- budget_max
  NULL,             -- skills
  NULL,             -- job_type
  NULL              -- flagged
) LIMIT 10;
```

### 4. Test Application System

```sql
-- Create test application
INSERT INTO public.applications (
  assignment_id,
  freelancer_id,
  cover_letter,
  proposed_rate,
  estimated_completion_days
) VALUES (
  'assignment-uuid',
  'freelancer-uuid',
  'Test cover letter',
  5000,
  7
);

-- Check status tracking
SELECT * FROM public.applications WHERE freelancer_id = 'freelancer-uuid';
```

---

## Troubleshooting

### Common Issues

#### 1. "relation already exists"

**Cause**: Table/index already created  
**Solution**: This is OK! Migration uses `IF NOT EXISTS` to be idempotent.

```sql
-- Continue with migration, it will skip existing objects
```

#### 2. "column already exists"

**Cause**: Column was added in previous run  
**Solution**: Safe to ignore, migration uses `ADD COLUMN IF NOT EXISTS`.

#### 3. "function does not exist: set_updated_at"

**Cause**: Base schema not fully applied  
**Solution**: Apply base schema.sql first:

```sql
-- Re-run the set_updated_at function from schema.sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 4. "permission denied for table"

**Cause**: RLS policy blocking action  
**Solution**: Check you're authenticated or disable RLS temporarily:

```sql
-- Temporarily disable RLS for setup (re-enable after!)
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- Re-enable after setup
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
```

#### 5. Migration hangs or times out

**Cause**: Large dataset or complex indexes  
**Solution**: Run migration in parts:

```sql
-- Part 1: Create tables
-- Part 2: Add indexes
-- Part 3: Create policies
-- Part 4: Create functions
```

#### 6. "foreign key constraint violation"

**Cause**: Dependencies not met  
**Solution**: Ensure migrations applied in correct order:

1. Base schema
2. 001 (assignments table must exist first)
3. 002-005 (can run in parallel)
4. 006 (depends on assignments)

---

## Rollback Procedures

If you need to rollback a migration:

### Rollback 006: Application System

```sql
-- Drop application system objects
DROP TABLE IF EXISTS public.applications CASCADE;
DROP FUNCTION IF EXISTS get_assignment_application_stats(UUID);
DROP FUNCTION IF EXISTS can_apply_to_assignment(UUID, UUID);

-- Remove columns from assignments
ALTER TABLE public.assignments 
  DROP COLUMN IF EXISTS application_count,
  DROP COLUMN IF EXISTS accepted_application_id,
  DROP COLUMN IF EXISTS assigned_freelancer_id,
  DROP COLUMN IF EXISTS assignment_status;
```

### Rollback 005: Search System

```sql
-- Drop search indexes
DROP INDEX IF EXISTS assignments_search_idx;
DROP INDEX IF EXISTS assignments_location_idx;
```

### Complete Reset (DANGER: Deletes all data)

```sql
-- This will delete ALL migration data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Re-apply base schema.sql
```

---

## Security Best Practices

After deployment:

1. **Verify RLS is enabled on all tables**:

   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. **Test RLS policies work**:
   - Try accessing data as different users
   - Verify unauthorized access is blocked

3. **Review database permissions**:

   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_schema = 'public';
   ```

4. **Enable audit logging** (optional):
   - Supabase Dashboard → Settings → Database → Enable query logging

5. **Monitor slow queries**:
   - Dashboard → Database → Query Performance

---

## Next Steps

After successful deployment:

1. ✅ **Update application**:
   - Restart dev server: `npm run dev`
   - Verify no console errors

2. ✅ **Test features**:
   - Create test user account
   - Post a test job
   - Apply to a job
   - Check notifications work
   - Test messaging (if implemented)

3. ✅ **Run test suite**:

   ```powershell
   npm test
   npm run test:coverage  # Ensure 80%+ coverage
   ```

4. ✅ **Security scan**:

   ```powershell
   # Run SAST with Snyk (if available)
   snyk test
   ```

5. ✅ **Document deployment**:
   - Update CHANGELOG.md
   - Note migration version in Git commit
   - Tag release if deploying to production

---

## Support

If you encounter issues not covered here:

1. Check Supabase logs: Dashboard → Logs
2. Review error messages in SQL Editor
3. Test with simplified queries
4. Check Supabase status: <https://status.supabase.com>
5. Refer to docs: <https://supabase.com/docs>

---

## Migration History

Track applied migrations:

| Version | Description | Date Applied | Status |
|---------|-------------|--------------|--------|
| base | Profiles, Notifications | YYYY-MM-DD | ✅ Applied |
| 001 | Search & Discovery | YYYY-MM-DD | ⏳ Pending |
| 002 | Messaging & Communication | YYYY-MM-DD | ⏳ Pending |
| 003 | Notifications System | YYYY-MM-DD | ⏳ Pending |
| 004 | Analytics System | YYYY-MM-DD | ⏳ Pending |
| 005 | Advanced Search | YYYY-MM-DD | ⏳ Pending |
| 006 | Application System | YYYY-MM-DD | ⏳ Pending |

---

**Ready to deploy?** Start with Migration 001 and work through each in order. Good luck! 🚀
