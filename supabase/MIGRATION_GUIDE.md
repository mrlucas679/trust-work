# Applying the Search & Discovery Migration

## Quick Steps

1. **Open Supabase SQL Editor**
   - Go to: <https://supabase.com/dashboard/project/sojjizqahgphybdijqaj/sql>
   - Or navigate to: Your Project → SQL Editor

2. **Copy the Migration SQL**
   - Open: `supabase/migrations/001_search_and_discovery.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)

3. **Paste and Execute**
   - Paste into Supabase SQL Editor
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)

4. **Verify Success**
   - Check for green success message
   - Go to Table Editor to verify new `saved_searches` table exists
   - Check `assignments` table has new columns (location, province, budget_min, etc.)

## Alternative: Execute in Parts

If you encounter errors, run the migration in sections:

### Part 1: Create Tables

```sql
-- Just the CREATE TABLE statement for saved_searches
```

### Part 2: Alter Existing Tables

```sql
-- All ALTER TABLE statements
```

### Part 3: Create Indexes

```sql
-- All CREATE INDEX statements
```

### Part 4: RLS Policies

```sql
-- All policy statements
```

### Part 5: Functions

```sql
-- The search_assignments and search_freelancers functions
```

## What This Migration Does

✅ Creates `saved_searches` table for storing user search preferences
✅ Enhances `assignments` table with search fields
✅ Adds full-text search indexes for performance
✅ Creates RLS policies for secure data access
✅ Adds helper functions for advanced filtering

## Testing the Migration

After applying, you can test with:

```sql
-- Check if saved_searches table exists
SELECT * FROM public.saved_searches LIMIT 1;

-- Check assignments table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assignments';

-- Test the search function
SELECT * FROM search_assignments('developer', 'Gauteng', NULL, NULL, NULL, NULL, NULL, NULL);
```

## Troubleshooting

**Error: "relation already exists"**

- This is fine - it means the table/index already exists
- Migration uses `IF NOT EXISTS` to be idempotent

**Error: "function does not exist: set_updated_at"**

- The function should exist from your initial schema
- If not, check `supabase/schema.sql` for the function definition

**Error: "column already exists"**

- This is fine - migration uses `ADD COLUMN IF NOT EXISTS`
- Means the column was already present

## Need Help?

If you encounter any issues:

1. Copy the error message
2. Check which statement failed
3. You can execute that specific part manually with fixes

---

**Ready?** Go to the Supabase SQL Editor and paste the migration! 🚀
