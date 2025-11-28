# Seed Data Guide

This guide explains how to populate your Supabase database with test data for development and testing.

## Overview

The seed script (`scripts/seed-supabase.ts`) populates your Supabase database with:

- **3 test user accounts** (with authentication)
- **5 job postings** (assigned to employer)
- **5 gig postings** (various categories)
- **2 portfolio items** (for freelancer)
- **Multiple assignment attempts & certifications** (for Sarah, the certified freelancer)
- **2 welcome notifications**

## Prerequisites

1. **Supabase Project**: You must have a Supabase project set up
2. **Environment Variables**: Required in your `.env` file:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your public anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (admin access)

### Getting Your Service Role Key

⚠️ **CRITICAL**: The service role key bypasses all RLS policies. Never expose it in client-side code or commit it to version control.

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to: **Settings → API**
4. Find **service_role** key in the "Project API keys" section
5. Copy and add to your `.env` file:

   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Test User Accounts

After running the seed script, you can log in with these credentials:

### 1. Employer Account

- **Email**: `employer@test.trustwork.co.za`
- **Password**: `TrustWork2025!`
- **Role**: Employer
- **Profile**: TechCorp Solutions employer
- **Has**: 5 job postings

### 2. Freelancer Account

- **Email**: `freelancer@test.trustwork.co.za`
- **Password**: `TrustWork2025!`
- **Role**: Job Seeker (Freelancer)
- **Profile**: Basic freelancer profile
- **Has**: 2 portfolio items

### 3. Certified Freelancer Account (Sarah Johnson)

- **Email**: `sarah.johnson@test.trustwork.co.za`
- **Password**: `TrustWork2025!`
- **Role**: Job Seeker (Freelancer)
- **Profile**: Certified professional with expert-level achievements
- **Has**: Multiple certifications across all 3 skills
  - Digital Marketing: Expert level (certified)
  - Graphic Design: Expert level (certified)
  - Content Writing: Expert level (certified)

## Running the Seed Script

### Step 1: Ensure Dependencies

```powershell
npm install
```

### Step 2: Verify Environment

Check that `.env` contains all required keys:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Run Seed Script

```powershell
npm run seed
```

### Expected Output

```
🌱 Starting database seed...
✓ Created test user: employer@test.trustwork.co.za
✓ Created test user: freelancer@test.trustwork.co.za
✓ Created test user: sarah.johnson@test.trustwork.co.za
✓ Created 3 user profiles
✓ Created 5 job postings
✓ Created 5 gig postings
✓ Created 2 portfolio items
✓ Created 12 assignment attempts with certifications
✓ Created 2 notifications

🎉 Seed completed successfully!

📋 Test Credentials:
Employer: employer@test.trustwork.co.za / TrustWork2025!
Freelancer: freelancer@test.trustwork.co.za / TrustWork2025!
Certified: sarah.johnson@test.trustwork.co.za / TrustWork2025!
```

## What Gets Seeded

### User Profiles

- **Employer**: TechCorp Solutions (verified business)
- **Freelancer**: Basic profile with skills
- **Sarah**: Fully certified profile with expert-level badges

### Jobs (Assigned to Employer)

1. Senior Frontend Developer (Remote, R45k-R65k)
2. Digital Marketing Specialist (Hybrid, R35k-R50k)
3. Graphic Designer (Remote, R30k-R45k)
4. Content Writer (Remote, R25k-R40k)
5. Full Stack Developer (On-site, R50k-R75k)

### Gigs

1. Website Design & Development
2. Social Media Marketing Campaign
3. Content Writing Package
4. Brand Identity Design
5. Email Marketing Campaign

### Portfolio Items (For Freelancer)

1. E-commerce Website Design
2. Social Media Campaign

### Certifications (For Sarah)

- **Digital Marketing**: Foundation, Developer, Advanced, Expert (all passed)
- **Graphic Design**: Foundation, Developer, Advanced, Expert (all passed)
- **Content Writing**: Foundation, Developer, Advanced, Expert (all passed)

**Total**: 12 assignment attempts with 3 expert-level certificates

### Notifications

- Welcome messages for all users

## Error Handling

The seed script handles errors gracefully:

1. **User Already Exists**: Logs info and continues (idempotent)
2. **Table Doesn't Exist**: Logs warning and skips that table
3. **Missing Environment Variable**: Exits with error message
4. **Database Connection Issues**: Exits with error details

## Verifying Seed Data

### 1. Check Supabase Dashboard

1. Go to **Table Editor** in your Supabase project
2. Verify data in tables:
   - `profiles` - Should have 3 profiles
   - `jobs` - Should have 5 jobs
   - `gigs` - Should have 5 gigs
   - `portfolio_items` - Should have 2 items
   - `user_assignment_certifications` - Should have 12 attempts
   - `notifications` - Should have 2 notifications

### 2. Test Login

```
1. Navigate to http://localhost:8080/auth
2. Log in with: sarah.johnson@test.trustwork.co.za / TrustWork2025!
3. Navigate to /assignments
4. Verify 3 expert-level certificates are visible
5. Click "View Certificate" on any expert badge
6. Verify certificate displays correctly
```

## Re-running the Seed Script

The script is **safe to re-run** because:

- User creation is idempotent (skips existing users)
- Other data will be duplicated if tables aren't cleared first

To reset and re-seed:

```powershell
# Option 1: Delete data manually in Supabase Dashboard
# Go to Table Editor → Select table → Delete all rows

# Option 2: Drop and recreate tables (use with caution)
# Run your schema script to recreate tables
npm run seed
```

## Security Notes

⚠️ **Important Security Considerations**:

1. **Service Role Key**:
   - NEVER commit to version control
   - NEVER expose in client-side code
   - NEVER deploy with frontend bundle
   - Only use in secure server-side scripts

2. **Test Passwords**:
   - Current: `TrustWork2025!`
   - Change in production environments
   - Use strong, unique passwords for real users

3. **RLS Policies**:
   - Seed script bypasses RLS with service role key
   - Ensure RLS policies are properly configured for production
   - Test that regular users can't access unauthorized data

## Troubleshooting

### Issue: "Missing environment variable"

**Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` file

### Issue: "Table not found" warnings

**Solution**: Run your database schema script first:

```powershell
npm run apply-schema
```

### Issue: "User already exists"

**Solution**: This is normal if re-running. Script will skip and continue.

### Issue: Seed completes but no data visible

**Solution**:

1. Check Supabase Dashboard → Table Editor
2. Verify tables exist
3. Check RLS policies aren't blocking view
4. Verify correct project URL in `.env`

## Next Steps

After seeding:

1. ✅ Test login with all 3 accounts
2. ✅ Verify certificate viewer works (Sarah's account)
3. ✅ Check job listings appear (Employer's jobs)
4. ✅ Verify portfolio items display (Freelancer's portfolio)
5. ⏭️ Begin database integration (replace mock data with Supabase queries)

## Related Documentation

- [Database Schema](./DATABASE.md)
- [Testing Guide](./TESTING.md)
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
- [Security Best Practices](./SECURITY.md)
