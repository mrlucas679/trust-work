# Supabase setup (TrustWork MVP)

Follow these steps to get the database and policies in place and the app connected.

## 📋 Quick Links

- **🚀 Quick Deployment** (5 min): [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md)
- **📖 Comprehensive Guide**: [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)
- **✅ Deployment Checklist**: [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)
- **📦 Migration Summary**: [`../MIGRATION_DEPLOYMENT_SUMMARY.md`](../MIGRATION_DEPLOYMENT_SUMMARY.md)

## ⚠️ IMPORTANT: Migration 000 Required

**NEW**: We've added `migrations/000_base_assignments.sql` which creates the core `assignments` table. This MUST be run before any other migrations.

**Migration Order**:

1. Base `schema.sql` (profiles, notifications) ← You've already done this
2. **`000_base_assignments.sql`** ← 🔴 START HERE for migrations
3. `001_search_and_discovery.sql`
4. `002_messaging_and_communication.sql`
5. `003_notifications_system.sql`
6. `004_analytics_system.sql`
7. `005_search_system.sql`
8. `006_application_system.sql`
9. `007_assignment_workflow.sql` ← ⭐ NEW - Status tracking & reviews

---

## 1) Create a Supabase project

- Go to <https://supabase.com/> and create a new project.
- Copy your Project URL and anon public API key.

## 2) Apply schema and RLS policies

- In the Supabase dashboard, open SQL editor.
- Paste and run the contents of `supabase/schema.sql`.
- This creates:
  - `profiles` (1-1 with `auth.users`)
  - `notifications` (per-user notifications)
  - Row Level Security policies for both tables

## 2.5) Create Storage bucket for CVs

**Important**: This step is required for CV upload functionality to work.

### Option A: Using Supabase Dashboard (Recommended)

- In Supabase dashboard, go to Storage > Create bucket
- Name: `resumes` (must be exactly this)
- Public bucket: Enabled (OK for MVP; you can lock down and proxy later)
- File size limit: 10 MB
- Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- CORS: Add your local/dev origins (e.g., `http://localhost:8080` - see vite.config.ts) if needed

### Option B: Using SQL (Advanced)

- Run the script in `supabase/storage-setup.sql` in the SQL Editor
- This creates the bucket and sets up the necessary storage policies

### Detailed Instructions

For comprehensive setup instructions and troubleshooting, see:

- **`supabase/STORAGE_SETUP_GUIDE.md`** - Complete guide with screenshots and troubleshooting

Notes:

- Our app uploads files to `resumes/{userId}/cv.pdf` style paths.
- We store the public URL in `profiles.cv_url` and validate it client-side (http/https + Supabase public storage path) for safety.
- If you see "bucket not found" errors when uploading CVs, this bucket is missing.

## 3) Configure environment variables (Vite)

- Create a `.env` at the repo root (do not commit these values):

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

- Restart the dev server if it’s running.

## 4) Verify locally

- Start the dev server: `npm run dev`
- Visit `/auth`, create an account, then you should be redirected to `/setup`.
- After sign-in, a profile row will be inserted or updated for the user.
- Upload a CV in `/setup` or `/settings`. You should see a working “View CV” link on `/profile`.

## 5) Optional

- In Supabase Authentication settings, enable email confirmations as you prefer.
- Add OAuth providers (Google/GitHub) and add matching sign-in buttons in the UI.

---

If you need to reset, you can drop the tables and re-run the script. Policies are idempotent in this script.
