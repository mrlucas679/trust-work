# Database Migration Deployment Checklist

Use this checklist to track your migration deployment progress.

## Pre-Deployment

- [ ] Supabase project created and accessible
- [ ] Base `schema.sql` applied successfully
- [ ] `.env` configured with correct credentials:
  - [ ] `VITE_SUPABASE_URL=https://sojjizqahgphybdijqaj.supabase.co`
  - [ ] `VITE_SUPABASE_ANON_KEY=<your-key>`
- [ ] Dev server runs without errors: `npm run dev`
- [ ] Verified base tables exist (profiles, notifications)

## Migration Deployment

### Migration 001: Search and Discovery

- [ ] Opened file: `supabase/migrations/001_search_and_discovery.sql`
- [ ] Copied all contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Executed successfully (green success message)
- [ ] Verified: `saved_searches` table exists
- [ ] Verified: `assignments` table has new columns (location, province, budget_min, budget_max)
- [ ] Tested: `search_assignments()` function works
- [ ] Estimated time: ~5-10 seconds

### Migration 002: Messaging and Communication

- [ ] Opened file: `supabase/migrations/002_messaging_and_communication.sql`
- [ ] Copied all contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Executed successfully
- [ ] Verified: `conversations` table exists
- [ ] Verified: `messages` table exists
- [ ] Verified: RLS policies created (3-4 per table)
- [ ] Estimated time: ~5-10 seconds

### Migration 003: Notifications System

- [ ] Opened file: `supabase/migrations/003_notifications_system.sql`
- [ ] Copied all contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Executed successfully
- [ ] Verified: Enhanced notification types exist
- [ ] Verified: Triggers created
- [ ] Estimated time: ~3-5 seconds

### Migration 004: Analytics System

- [ ] Opened file: `supabase/migrations/004_analytics_system.sql`
- [ ] Copied all contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Executed successfully
- [ ] Verified: `profile_views` table exists
- [ ] Verified: `assignment_views` table exists
- [ ] Verified: `user_actions` table exists
- [ ] Verified: Analytics RPC functions exist
- [ ] Estimated time: ~10-15 seconds

### Migration 005: Advanced Search System

- [ ] Opened file: `supabase/migrations/005_search_system.sql`
- [ ] Copied all contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Executed successfully
- [ ] Verified: Full-text search indexes created
- [ ] Verified: Search functions work
- [ ] Tested: `search_assignments('developer')` returns results
- [ ] Estimated time: ~5-10 seconds

### Migration 006: Application System

- [ ] Opened file: `supabase/migrations/006_application_system.sql`
- [ ] Copied all contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Executed successfully
- [ ] Verified: `applications` table exists with 14 columns
- [ ] Verified: 6 RLS policies created:
  - [ ] Freelancers can view own applications
  - [ ] Employers can view applications for their assignments
  - [ ] Freelancers can insert applications
  - [ ] Freelancers can withdraw applications
  - [ ] Employers can update application status
  - [ ] System can update all fields
- [ ] Verified: 5 triggers created:
  - [ ] set_application_timestamps
  - [ ] track_application_status_changes
  - [ ] auto_reject_competing_applications
  - [ ] update_assignment_on_application_acceptance
  - [ ] update_assignment_application_count
- [ ] Verified: 4 new columns on `assignments`:
  - [ ] application_count
  - [ ] accepted_application_id
  - [ ] assigned_freelancer_id
  - [ ] assignment_status
- [ ] Verified: RPC functions work:
  - [ ] `get_assignment_application_stats(uuid)`
  - [ ] `can_apply_to_assignment(uuid, uuid)`
- [ ] Estimated time: ~10-15 seconds

## Post-Deployment Verification

### Database Structure

- [ ] Run comprehensive verification script (see DEPLOYMENT_GUIDE.md)
- [ ] All tables exist: profiles, notifications, assignments, saved_searches, conversations, messages, applications, analytics tables
- [ ] RLS enabled on all tables: 25-30 policies total
- [ ] Functions created: 8-12 RPC functions
- [ ] Triggers created: 8-12 triggers
- [ ] Indexes created: 15-25 indexes

### Application Testing

- [ ] Restart dev server: `npm run dev`
- [ ] No console errors on startup
- [ ] Sign up new test user
- [ ] Profile created automatically
- [ ] Navigate to job listings
- [ ] Apply to a job (ApplicationForm appears)
- [ ] Submit application successfully
- [ ] View application in "My Applications" page
- [ ] Application status displays correctly
- [ ] Employer can view applications for their jobs
- [ ] Search functionality works
- [ ] Notifications appear

### Security Testing

- [ ] RLS policies prevent unauthorized access
- [ ] User A cannot see User B's applications
- [ ] Employer cannot modify freelancer's application content
- [ ] Freelancer cannot modify employer's assignment
- [ ] Withdrawn applications cannot be reactivated
- [ ] Duplicate applications are prevented

### Performance Testing

- [ ] Page load times acceptable (<2s)
- [ ] Search queries fast (<500ms)
- [ ] Application submission quick (<1s)
- [ ] No N+1 query issues in console

### Code Quality

- [ ] Run type-check: `npm run type-check` ✅ PASSES
- [ ] Run lint: `npm run lint` (address critical issues)
- [ ] Run tests: `npm test` (aim for 80%+ coverage)
- [ ] Run security scan: Snyk code scan (address medium+ severity)

## Rollback Plan (If Needed)

- [ ] Documented current state before migration
- [ ] Know how to rollback each migration (see DEPLOYMENT_GUIDE.md)
- [ ] Have database backup (if production)
- [ ] Tested rollback procedure in dev environment

## Documentation

- [ ] Updated CHANGELOG.md with migration notes
- [ ] Noted migration versions in Git commit
- [ ] Tagged release (if deploying to production)
- [ ] Updated README.md if needed
- [ ] Documented any issues encountered

## Sign-Off

- [ ] **Developer**: Migrations applied successfully _______________
- [ ] **QA**: Testing complete _______________
- [ ] **Security**: Security scan passed _______________
- [ ] **Deployment Date**: _______________
- [ ] **Production URL** (if applicable): _______________

---

## Quick Commands Reference

```powershell
# Start dev server
npm run dev

# Type check
npm run type-check

# Run tests
npm test

# Coverage report
npm run test:coverage

# Lint
npm run lint

# Full validation
npm run validate
```

## Supabase SQL Editor

URL: <https://supabase.com/dashboard/project/sojjizqahgphybdijqaj/sql>

---

## Notes

_Use this space to track issues, observations, or important details during deployment_

```
Date: _______________
Time started: _______________
Time completed: _______________

Issues encountered:



Resolutions:



Performance notes:



Security concerns:



```

---

**Status**: ⏳ Ready for Deployment

Once complete, update status to: ✅ DEPLOYED
