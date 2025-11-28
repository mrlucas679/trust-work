# Week 2: Admin Enhancements and Two-Factor Authentication

## Overview
This week focuses on completing the admin interface with additional management pages and implementing Two-Factor Authentication (2FA) for enhanced security.

## Changes Made

### 1. DisputeReview Admin Page
**File:** `src/pages/admin/DisputeReview.tsx`

A comprehensive dispute resolution interface for administrators to handle payment disputes between employers and job seekers.

**Features:**
- View pending, in-review, and resolved disputes
- Filter disputes by status and priority
- View dispute details including evidence from both parties
- Resolution workflow with outcome options (refund, partial refund, release payment)
- Audit trail for all actions taken
- Email notifications to involved parties

**Schema Requirements (migration):**
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  escrow_payment_id UUID REFERENCES escrow_payments(id),
  raised_by UUID REFERENCES profiles(id),
  against_user UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'escalated')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);
```

### 2. Two-Factor Authentication (2FA)
**Files:**
- `src/components/auth/TwoFactorSetup.tsx` - Setup component with QR code
- `src/components/auth/TwoFactorVerify.tsx` - Verification component
- `src/hooks/use-two-factor.ts` - Hook for 2FA operations
- `src/lib/api/twoFactorApi.ts` - API functions for 2FA

**Features:**
- TOTP-based authentication using Supabase MFA
- QR code generation for authenticator apps
- Recovery codes for account recovery
- Enable/disable 2FA from settings
- Verification during login when enabled
- Admin enforcement option for elevated privileges

**Supported Authenticator Apps:**
- Google Authenticator
- Microsoft Authenticator
- Authy
- Any TOTP-compatible app

### 3. UserManagement Admin Page
**File:** `src/pages/admin/UserManagement.tsx`

Complete user management interface for administrators.

**Features:**
- List all users with search and filters
- View user details and activity history
- Suspend/unsuspend user accounts
- Reset user passwords
- View user's verification status
- Export user data (GDPR compliance)
- User role management

**Schema Requirements:**
```sql
CREATE TABLE user_suspensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  suspended_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  suspended_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_user_suspensions_user_id ON user_suspensions(user_id);
```

### 4. ContentModeration Admin Page
**File:** `src/pages/admin/ContentModeration.tsx`

Content moderation queue for reviewing reported content.

**Features:**
- Review reported job postings
- Review reported user profiles
- Review reported messages
- Approve or remove flagged content
- Warning system for violations
- Strike tracking and automated suspensions
- Appeal workflow

**Schema Requirements:**
```sql
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('job', 'profile', 'message', 'review')),
  content_id UUID NOT NULL,
  reported_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_strikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  content_report_id UUID REFERENCES content_reports(id),
  issued_by UUID REFERENCES profiles(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  appealed BOOLEAN DEFAULT FALSE,
  appeal_status TEXT CHECK (appeal_status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_user_strikes_user_id ON user_strikes(user_id);
```

### 5. Updated Routes
**File:** `src/App.tsx`

New admin routes added:
```typescript
/admin/disputes - DisputeReview
/admin/users - UserManagement
/admin/moderation - ContentModeration
```

### 6. Environment Variables
No new environment variables required for Week 2.

## Files Modified

| File | Change |
|------|--------|
| `src/pages/admin/DisputeReview.tsx` | NEW - Dispute resolution interface |
| `src/pages/admin/UserManagement.tsx` | NEW - User management interface |
| `src/pages/admin/ContentModeration.tsx` | NEW - Content moderation queue |
| `src/components/auth/TwoFactorSetup.tsx` | NEW - 2FA setup with QR code |
| `src/components/auth/TwoFactorVerify.tsx` | NEW - 2FA verification component |
| `src/hooks/use-two-factor.ts` | NEW - 2FA hook |
| `src/lib/api/twoFactorApi.ts` | NEW - 2FA API functions |
| `src/pages/Settings.tsx` | MODIFIED - Added 2FA setup integration |
| `src/App.tsx` | MODIFIED - Added new admin routes |

## Testing

### Manual Testing Checklist
- [ ] Admin can access dispute review page
- [ ] Admin can filter and search disputes
- [ ] Admin can resolve disputes with different outcomes
- [ ] Users can enable 2FA from settings
- [ ] 2FA QR code displays correctly
- [ ] 2FA verification works during login
- [ ] Recovery codes can be generated
- [ ] Admin can search and filter users
- [ ] Admin can suspend/unsuspend users
- [ ] Content moderation queue displays reported items
- [ ] Admin can take action on reported content
- [ ] Strike system tracks violations

### Type Check
```bash
npm run type-check
```

### Lint Check
```bash
npm run lint
```

## Security Considerations

1. **2FA Storage**: TOTP secrets are stored securely by Supabase Auth
2. **Recovery Codes**: Hashed and stored, shown only once during setup
3. **Admin Actions**: All admin actions logged with timestamps and user IDs
4. **Dispute Evidence**: Files stored in secure storage bucket with access controls
5. **User Data Export**: Rate-limited to prevent abuse

## Next Steps (Week 3)

1. Analytics Dashboard with charts (Recharts integration)
2. System health monitoring
3. Automated report generation
4. Notification preferences for admins
5. Bulk operations for user management

## Migration Commands

When deploying to production, run these migrations:
```bash
supabase migration new add_disputes_table
supabase migration new add_user_suspensions_table
supabase migration new add_content_reports_table
supabase migration new add_user_strikes_table
```

## Rollback Plan

If issues arise:
1. Remove new routes from App.tsx
2. Keep existing admin functionality intact
3. 2FA can be disabled per-user via Supabase dashboard
