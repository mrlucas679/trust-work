# Supabase Migration: Universal Search

This directory contains SQL migrations for TrustWork's database schema.

## Migration: `universal_search.sql`

**Date**: 2025-11-04  
**Purpose**: Add full-text search capabilities with security-first design

### What This Migration Does

1. **Creates Core Tables**:
   - `jobs` - Job listings with employer references
   - `gigs` - Freelance opportunities
   - `messages` - Direct messaging between users
   - `faqs` - Frequently Asked Questions

2. **Implements Row-Level Security (RLS)**:
   - Users can only see their own messages (sender/recipient check)
   - Only active, non-flagged jobs/gigs are publicly visible
   - Employers can manage their own postings
   - FAQ public read access

3. **Adds Full-Text Search Indexes (PostgreSQL GIN)**:
   - `jobs_search_idx` - Fast text search on title, company, description
   - `gigs_search_idx` - Fast text search on gig content
   - `profiles_search_idx` - Search freelancer profiles
   - `messages_content_idx` - Search message content
   - `faqs_search_idx` - Search FAQ questions and answers
   - Array indexes for skills matching

4. **Creates Database Functions**:
   - `search_jobs()` - Full-text job search with filters and relevance ranking
   - `search_gigs()` - Full-text gig search with budget filters
   - `search_freelancers()` - Search by skills, location, with array overlap
   - `search_messages()` - User message search (RLS-enforced)
   - `search_faqs()` - FAQ search by category

5. **Seeds Sample Data**:
   - 8 FAQs covering common topics (Getting Started, Pricing, Verification, etc.)

## How to Apply This Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: <https://app.supabase.com>
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `universal_search.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. Verify success - you should see "Success. No rows returned"

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push

# Or run the migration file directly
psql $DATABASE_URL -f supabase/migrations/universal_search.sql
```

### Option 3: PowerShell Script

```powershell
# Set your Supabase connection string
$env:DATABASE_URL = "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run the migration
Get-Content .\supabase\migrations\universal_search.sql | psql $env:DATABASE_URL
```

## Verification Steps

After applying the migration, verify everything works:

### 1. Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('jobs', 'gigs', 'messages', 'faqs');
```

Expected: 4 rows (jobs, gigs, messages, faqs)

### 2. Check Indexes Exist

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('jobs', 'gigs', 'profiles', 'messages', 'faqs')
  AND indexname LIKE '%_search_idx';
```

Expected: 5 search indexes

### 3. Test Database Functions

```sql
-- Test job search function
SELECT * FROM search_jobs('developer', null, null, null, null, null, 5);

-- Test gig search function
SELECT * FROM search_gigs('design', null, null, null, null, null, 5);

-- Test FAQ search function
SELECT * FROM search_faqs('account', null, 5);
```

Expected: Functions execute without errors (may return 0 rows if no data)

### 4. Check RLS Policies

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('jobs', 'gigs', 'messages', 'faqs')
ORDER BY tablename, policyname;
```

Expected: Multiple policies for each table (select, insert, update, delete)

### 5. Verify FAQ Seed Data

```sql
SELECT COUNT(*) as faq_count FROM public.faqs;
```

Expected: 8 FAQs

## Security Features

### 1. Row-Level Security (RLS)

- **Jobs/Gigs**: Public can only see active, non-flagged items
- **Messages**: Users can ONLY see messages they sent or received
- **Profiles**: Users can only read/update their own profile
- **FAQs**: Public read access only

### 2. Full-Text Search Indexes

- Uses PostgreSQL's `to_tsvector` for intelligent text search
- Supports stemming (e.g., "develop" matches "developer", "developing")
- GIN indexes provide fast lookups even with millions of records

### 3. Database Functions (Security Definer)

- Functions run with elevated privileges but enforce RLS
- Parameterized queries prevent SQL injection
- Rate limiting enforced at application layer

### 4. Array Operators for Skills

- Skills stored as `text[]` arrays
- Uses `&&` operator for fast overlap checks
- GIN indexes make array searches efficient

## Table Relationships

```text
auth.users (Supabase Auth)
    ↓ (1:1)
profiles (user profiles)
    ↓ (1:N)
jobs (employer posts jobs)
gigs (employer posts gigs)
messages (users send/receive)

faqs (standalone, no FK)
```

## Performance Considerations

### Expected Query Performance

- **Jobs/Gigs Search**: < 50ms for 10k records, < 500ms for 1M records
- **Freelancer Search**: < 100ms (depends on array overlap complexity)
- **Message Search**: < 30ms (limited to user's own messages)
- **FAQ Search**: < 10ms (small dataset)

### When to Add More Indexes

If queries become slow (> 1 second), consider:

- Composite indexes on frequently filtered columns
- Partial indexes for common WHERE clauses
- BRIN indexes for time-series data (created_at)

## Troubleshooting

### Error: "relation already exists"

The migration uses `create table if not exists`, so you can safely re-run it. If you see errors about existing tables, it means the migration was already partially applied.

### Error: "function search_jobs does not exist"

This happens if the migration failed partway through. Run the entire migration again - the `create or replace function` syntax makes functions idempotent.

### Error: "permission denied for table"

RLS policies may be blocking your query. Use the Supabase service role key (not anon key) for admin operations, or ensure your JWT token has the correct user ID.

### Error: "could not create unique index"

This means duplicate data exists. Check for duplicate FAQs or other constraint violations. You can drop and recreate the table if needed:

```sql
DROP TABLE IF EXISTS public.faqs CASCADE;
-- Then re-run the migration
```

## Rollback

If you need to undo this migration:

```sql
-- Drop tables (cascades to indexes and policies)
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.gigs CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS search_jobs;
DROP FUNCTION IF EXISTS search_gigs;
DROP FUNCTION IF EXISTS search_freelancers;
DROP FUNCTION IF EXISTS search_messages;
DROP FUNCTION IF EXISTS search_faqs;
```

**Warning**: This will permanently delete all data in these tables. Use with caution!

## Next Steps

After applying this migration:

1. ✅ Update `.env` with Supabase credentials (if not already set)
2. ✅ Run `npm run type-check` to ensure TypeScript types align
3. ✅ Test universal search in development: `npm run dev`
4. ✅ Add sample data to jobs/gigs tables for testing
5. ✅ Run security tests (Task 6 in todo list)
6. ✅ Monitor query performance with Supabase dashboard

## Related Files

- **Application Code**: `src/lib/universalSearch.ts` (API layer)
- **Type Definitions**: `src/types/universal-search.ts` (TypeScript types)
- **UI Component**: `src/components/search/InlineSearch.tsx` (search input)
- **Main Schema**: `supabase/schema.sql` (profiles, notifications)

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Review RLS policies: Dashboard → Authentication → Policies
3. Test queries in SQL Editor with `EXPLAIN ANALYZE`
4. Consult Supabase docs: <https://supabase.com/docs/guides/database>
