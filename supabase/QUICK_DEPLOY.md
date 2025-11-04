# Quick Start: Deploy Database Migrations

This is the **fastest way** to deploy all migrations to your Supabase project.

## 5-Minute Deployment

### Step 1: Open Supabase SQL Editor (30 seconds)

1. Go to: <https://supabase.com/dashboard/project/sojjizqahgphybdijqaj/sql>
2. Click "New Query"

### Step 2: Apply Each Migration (4 minutes total)

For **each file** below, do this:

1. Open file in VS Code
2. Copy ALL content (Ctrl+A → Ctrl+C)
3. Paste in SQL Editor
4. Click "Run" (or Ctrl+Enter)
5. Wait for ✅ green success message
6. Move to next file

**Files in order**:

```
✓ Base schema.sql (already applied)
→ supabase/migrations/000_base_assignments.sql (~5s) 🔴 CRITICAL - MUST RUN FIRST!
→ supabase/migrations/001_search_and_discovery.sql (~10s)
→ supabase/migrations/002_messaging_and_communication.sql (~10s)
→ supabase/migrations/003_notifications_system.sql (~5s)
→ supabase/migrations/004_analytics_system.sql (~15s)
→ supabase/migrations/005_search_system.sql (~10s)
→ supabase/migrations/006_application_system.sql (~15s)
→ supabase/migrations/007_assignment_workflow.sql (~10s) ⭐ NEW - Assignment Workflow
```

**⚠️ CRITICAL**: Migration `000_base_assignments.sql` creates the `assignments` table that all other migrations depend on. You MUST run this first!

### Step 3: Verify (30 seconds)

Paste this in SQL Editor and run:

```sql
-- Quick verification
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected**: You should see these tables:

- ✅ applications
- ✅ assignments
- ✅ assignment_status_history
- ✅ conversations
- ✅ messages
- ✅ notifications
- ✅ profile_views
- ✅ profiles
- ✅ reviews
- ✅ saved_searches
- ✅ user_actions

### Step 4: Test Application (1 minute)

```powershell
# Restart dev server
npm run dev

# Open browser: http://localhost:8080
# Sign up → Apply to a job → Success! ✅
```

---

## That's It! 🎉

Your database is now fully configured with:

- ✅ Search & Discovery
- ✅ Messaging System
- ✅ Notifications
- ✅ Analytics Tracking
- ✅ Advanced Search
- ✅ Job Application System with RLS Security
- ✅ Assignment Workflow with Reviews & Status Tracking

---

## If You See Errors

**"relation already exists"** → ✅ OK! Skip that migration.

**"column already exists"** → ✅ OK! Continue.

**"permission denied"** → ⚠️ Check you're logged in as admin.

**Timeout** → ⚠️ Run migration in smaller parts.

---

## Need More Details?

See comprehensive guide: `supabase/DEPLOYMENT_GUIDE.md`

---

## CLI Alternative (Advanced)

If you have Supabase CLI installed:

```powershell
supabase login
supabase link --project-ref sojjizqahgphybdijqaj
supabase db push
```

Done! All migrations applied automatically.
