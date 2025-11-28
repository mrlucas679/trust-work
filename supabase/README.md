# Supabase setup (TrustWork MVP)

Follow these steps to get the database and policies in place and the app connected.

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
- This creates all storage buckets (resumes, avatars, company-logos, attachments) and sets up RLS policies

### S3-Compatible Storage Access

Supabase Storage supports the S3 protocol for advanced use cases:

**Connection Details:**

- Endpoint: `https://sojjizqahgphybdijqaj.storage.supabase.co/storage/v1/s3`
- Region: `eu-north-1`
- Protocol: S3 (AWS S3 compatible)

**Environment Variables:**

```bash
VITE_SUPABASE_S3_ENDPOINT=https://sojjizqahgphybdijqaj.storage.supabase.co/storage/v1/s3
VITE_SUPABASE_S3_REGION=eu-north-1
VITE_SUPABASE_STORAGE_BUCKET=resumes
```

### Documentation

For comprehensive setup instructions and S3 usage:

- **`S3_STORAGE_GUIDE.md`** - Complete S3 storage guide with examples
- **`S3_QUICK_REFERENCE.md`** - Quick reference for common operations
- **`supabase/storage-setup.sql`** - SQL script to create all buckets

**Storage Buckets:**

| Bucket | Purpose | Size Limit |
|--------|---------|-----------|
| resumes | User CVs | 10MB |
| avatars | Profile pictures | 5MB |
| company-logos | Company branding | 3MB |
| attachments | Job attachments | 20MB |

Notes:

- Our app uploads files to `resumes/{userId}/cv.pdf` style paths.
- We store the public URL in `profiles.cv_url` and validate it client-side (http/https + Supabase public storage path) for safety.
- If you see "bucket not found" errors when uploading CVs, this bucket is missing.
- For S3 protocol access, use service_role key (backend only - never expose in client code)

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
