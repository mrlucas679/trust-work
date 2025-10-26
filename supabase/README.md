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

- In Supabase dashboard, go to Storage > Create bucket
- Name: `resumes`
- Public bucket: Enabled (OK for MVP; you can lock down and proxy later)
- CORS: Add your local/dev origins (e.g., `http://localhost:5173`) if needed

Notes:

- Our app uploads files to `resumes/{userId}/cv.pdf` style paths.
- We store the public URL in `profiles.cv_url` and validate it client-side (http/https + Supabase public storage path) for safety.

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
