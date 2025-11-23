# Fix Supabase Schema Cache Issue

## Problem

Error: "Could not find the table 'public.conversations' in the schema cache"

This means the database tables haven't been created yet, or Supabase's schema cache needs to be refreshed.

## Solution

### Step 1: Run Schema SQL in Supabase Dashboard

1. **Open Supabase SQL Editor**:
   - Go to: <https://app.supabase.com/project/sojjizqahgphybdijqaj>
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Copy the Schema**:
   - Open `supabase/schema.sql` in your project
   - Copy ALL the contents (entire file)

3. **Execute the Schema**:
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for success message

4. **Refresh Your App**:
   - Go back to <http://localhost:5173/>
   - Hard refresh (Ctrl+Shift+R)
   - Try loading messages again

### Step 2: Verify Tables Created

In Supabase Dashboard:

1. Click "Table Editor" in left sidebar
2. You should see these tables:
   - ✅ profiles
   - ✅ assignments
   - ✅ applications
   - ✅ conversations
   - ✅ messages
   - ✅ notifications
   - ✅ business_verifications
   - ✅ jobs (gigs)

### Step 3: Check RLS Policies

1. Click on "conversations" table
2. Click "RLS" tab
3. Verify these policies exist:
   - ✅ "Conversations select own" (SELECT)
   - ✅ "Conversations insert own" (INSERT)
   - ✅ "Conversations update own" (UPDATE)

### Alternative: Run via Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref sojjizqahgphybdijqaj

# Push schema
npx supabase db push
```

## Common Issues

### Issue: "relation already exists"

**Solution**: This is fine - it means some tables are already created. The script uses `create table if not exists` so it won't overwrite existing data.

### Issue: RLS policies error

**Solution**: The script checks if policies exist before creating them. If you get errors, you can manually drop and recreate policies in the SQL editor.

### Issue: Still getting schema cache error after running SQL

**Solution**:

1. Wait 30 seconds for Supabase to refresh its cache
2. Hard refresh your browser (Ctrl+Shift+R)
3. Clear browser cache and reload
4. Restart your development server: `npm run dev`

## Verification

After running the schema, test these endpoints:

1. **Messages Page**: <http://localhost:5173/messages>
   - Should load without "schema cache" error
   - May show "No Messages Yet" (empty state)

2. **Jobs Page**: <http://localhost:5173/jobs>
   - Should load job listings
   - Or show empty state if no jobs posted

3. **Applications**: <http://localhost:5173/applications>
   - Should load without errors

## Need Help?

If you still see errors:

1. Check browser console (F12) for detailed error messages
2. Check Supabase logs in dashboard
3. Verify your `.env` file has correct credentials:
   - VITE_SUPABASE_URL=<https://sojjizqahgphybdijqaj.supabase.co>
   - VITE_SUPABASE_ANON_KEY=[your key]
