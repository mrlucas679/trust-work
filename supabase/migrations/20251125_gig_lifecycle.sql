-- ============================================================
-- GIG LIFECYCLE COMPLETE DATABASE MIGRATION
-- TrustWork Platform - PayFast Integration & Milestone System
-- Created: November 25, 2025
-- ============================================================

-- ============================================================
-- 1. UPDATE ASSIGNMENTS TABLE (Add milestones, deliverables, payment fields)
-- ============================================================

-- Add type column to distinguish between jobs and gigs
ALTER TABLE public.assignments 
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('job', 'gig')) DEFAULT 'gig';

-- Add milestone and deliverable support
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb;

-- Add payment status tracking
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (
    payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded', 'disputed')
  ) DEFAULT 'unpaid';

-- Add completion tracking
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_freelancer_id UUID REFERENCES auth.users(id);

-- Add currency support (defaulting to ZAR for South Africa)
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ZAR';

-- Add estimated duration as structured field
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS estimated_duration TEXT;

-- ============================================================
-- 2. PAYFAST TRANSACTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payfast_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to gig/assignment
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  
  -- PayFast specific fields
  pf_payment_id TEXT UNIQUE,
  payment_status TEXT NOT NULL CHECK (payment_status IN (
    'COMPLETE', 'FAILED', 'PENDING', 'CANCELLED'
  )),
  
  -- Transaction details
  amount_gross NUMERIC(10,2) NOT NULL,
  amount_fee NUMERIC(10,2) DEFAULT 0,
  amount_net NUMERIC(10,2) NOT NULL,
  
  -- Parties
  payer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Payment method used
  payment_method TEXT, -- 'eft', 'cc', 'snapscan', etc.
  
  -- Merchant info
  merchant_id TEXT,
  
  -- Item details
  item_name TEXT NOT NULL,
  item_description TEXT,
  
  -- Email info
  email_address TEXT,
  
  -- Raw PayFast webhook data
  raw_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for updating payfast_transactions updated_at
DROP TRIGGER IF EXISTS set_payfast_transactions_updated_at ON public.payfast_transactions;

CREATE TRIGGER set_payfast_transactions_updated_at
BEFORE UPDATE ON public.payfast_transactions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS payfast_transactions_assignment_id_idx ON public.payfast_transactions(assignment_id);
CREATE INDEX IF NOT EXISTS payfast_transactions_payer_id_idx ON public.payfast_transactions(payer_id);
CREATE INDEX IF NOT EXISTS payfast_transactions_status_idx ON public.payfast_transactions(payment_status);
CREATE INDEX IF NOT EXISTS payfast_transactions_pf_payment_id_idx ON public.payfast_transactions(pf_payment_id);

-- RLS
ALTER TABLE public.payfast_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payfast_transactions' AND policyname = 'PayFast transactions select own'
  ) THEN
    CREATE POLICY "PayFast transactions select own" ON public.payfast_transactions
      FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = recipient_id);
  END IF;
END $$;

-- ============================================================
-- 3. UPDATE ESCROW PAYMENTS TABLE (Add PayFast support)
-- ============================================================

-- Add PayFast-specific columns to existing escrow_payments table
ALTER TABLE public.escrow_payments
  ADD COLUMN IF NOT EXISTS payfast_transaction_id UUID REFERENCES public.payfast_transactions(id),
  ADD COLUMN IF NOT EXISTS payout_status TEXT CHECK (payout_status IN (
    'pending', 'processing', 'completed', 'failed'
  )) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payout_batch_id UUID,
  ADD COLUMN IF NOT EXISTS payout_initiated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payout_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payout_reference TEXT,
  ADD COLUMN IF NOT EXISTS payout_error TEXT;

-- Update payment_method constraint to include PayFast
-- First drop the old constraint, then add new one
DO $$ BEGIN
  ALTER TABLE public.escrow_payments 
    DROP CONSTRAINT IF EXISTS escrow_payments_payment_method_check;
  ALTER TABLE public.escrow_payments 
    ADD CONSTRAINT escrow_payments_payment_method_check 
    CHECK (payment_method IN ('stripe', 'paypal', 'payfast'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================
-- 4. GIG MILESTONES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gig_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Milestone details
  title TEXT NOT NULL,
  description TEXT,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  due_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  
  -- Status tracking
  status TEXT CHECK (status IN (
    'pending', 'in_progress', 'submitted', 'approved', 'rejected', 'revision_requested'
  )) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  
  -- Deliverables for this milestone
  deliverable_files JSONB DEFAULT '[]'::jsonb,
  deliverable_links TEXT[],
  submission_notes TEXT,
  
  -- Client feedback
  client_notes TEXT,
  revision_requested BOOLEAN DEFAULT false,
  revision_count INTEGER DEFAULT 0,
  max_revisions INTEGER DEFAULT 3,
  
  -- Payment tracking
  payment_released BOOLEAN DEFAULT false,
  payment_released_at TIMESTAMPTZ,
  escrow_payment_id UUID REFERENCES public.escrow_payments(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for updating gig_milestones updated_at
DROP TRIGGER IF EXISTS set_gig_milestones_updated_at ON public.gig_milestones;

CREATE TRIGGER set_gig_milestones_updated_at
BEFORE UPDATE ON public.gig_milestones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS gig_milestones_gig_id_idx ON public.gig_milestones(gig_id);
CREATE INDEX IF NOT EXISTS gig_milestones_freelancer_id_idx ON public.gig_milestones(freelancer_id);
CREATE INDEX IF NOT EXISTS gig_milestones_status_idx ON public.gig_milestones(status);
CREATE INDEX IF NOT EXISTS gig_milestones_order_idx ON public.gig_milestones(gig_id, order_index);

-- RLS
ALTER TABLE public.gig_milestones ENABLE ROW LEVEL SECURITY;

-- Users can view milestones for gigs they're involved in
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gig_milestones' AND policyname = 'Milestones select own'
  ) THEN
    CREATE POLICY "Milestones select own" ON public.gig_milestones
      FOR SELECT USING (
        auth.uid() = freelancer_id OR
        auth.uid() IN (
          SELECT client_id FROM public.assignments WHERE id = gig_id
        )
      );
  END IF;
END $$;

-- Freelancers can update their own milestones (for submissions)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gig_milestones' AND policyname = 'Milestones update by freelancer'
  ) THEN
    CREATE POLICY "Milestones update by freelancer" ON public.gig_milestones
      FOR UPDATE USING (auth.uid() = freelancer_id);
  END IF;
END $$;

-- Clients can update milestones (for approval/rejection)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gig_milestones' AND policyname = 'Milestones update by client'
  ) THEN
    CREATE POLICY "Milestones update by client" ON public.gig_milestones
      FOR UPDATE USING (
        auth.uid() IN (
          SELECT client_id FROM public.assignments WHERE id = gig_id
        )
      );
  END IF;
END $$;

-- ============================================================
-- 5. GIG DELIVERABLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gig_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES public.gig_milestones(id) ON DELETE CASCADE,
  gig_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Deliverable info
  title TEXT NOT NULL,
  description TEXT,
  file_type TEXT CHECK (file_type IN (
    'document', 'image', 'video', 'code', 'archive', 'link', 'other'
  )) NOT NULL,
  
  -- File storage
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT, -- bytes
  storage_path TEXT, -- Supabase storage path
  
  -- External links
  external_link TEXT,
  
  -- Version tracking
  version INTEGER DEFAULT 1,
  parent_deliverable_id UUID REFERENCES public.gig_deliverables(id),
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  
  -- Feedback
  client_feedback TEXT,
  revision_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for updating gig_deliverables updated_at
DROP TRIGGER IF EXISTS set_gig_deliverables_updated_at ON public.gig_deliverables;

CREATE TRIGGER set_gig_deliverables_updated_at
BEFORE UPDATE ON public.gig_deliverables
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS gig_deliverables_milestone_id_idx ON public.gig_deliverables(milestone_id);
CREATE INDEX IF NOT EXISTS gig_deliverables_gig_id_idx ON public.gig_deliverables(gig_id);
CREATE INDEX IF NOT EXISTS gig_deliverables_freelancer_id_idx ON public.gig_deliverables(freelancer_id);
CREATE INDEX IF NOT EXISTS gig_deliverables_status_idx ON public.gig_deliverables(status);

-- RLS
ALTER TABLE public.gig_deliverables ENABLE ROW LEVEL SECURITY;

-- Users can view deliverables for gigs they're involved in
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gig_deliverables' AND policyname = 'Deliverables select own'
  ) THEN
    CREATE POLICY "Deliverables select own" ON public.gig_deliverables
      FOR SELECT USING (
        auth.uid() = freelancer_id OR
        auth.uid() IN (
          SELECT client_id FROM public.assignments WHERE id = gig_id
        )
      );
  END IF;
END $$;

-- Freelancers can insert deliverables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gig_deliverables' AND policyname = 'Deliverables insert by freelancer'
  ) THEN
    CREATE POLICY "Deliverables insert by freelancer" ON public.gig_deliverables
      FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
  END IF;
END $$;

-- Freelancers can update their own deliverables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gig_deliverables' AND policyname = 'Deliverables update by freelancer'
  ) THEN
    CREATE POLICY "Deliverables update by freelancer" ON public.gig_deliverables
      FOR UPDATE USING (auth.uid() = freelancer_id);
  END IF;
END $$;

-- Clients can update deliverables (for approval/rejection)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gig_deliverables' AND policyname = 'Deliverables update by client'
  ) THEN
    CREATE POLICY "Deliverables update by client" ON public.gig_deliverables
      FOR UPDATE USING (
        auth.uid() IN (
          SELECT client_id FROM public.assignments WHERE id = gig_id
        )
      );
  END IF;
END $$;

-- ============================================================
-- 6. FREELANCER BANK ACCOUNTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.freelancer_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Account details
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  branch_code TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('savings', 'current', 'transmission')) NOT NULL,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_method TEXT, -- 'micro_deposit', 'manual', 'instant'
  
  -- South African banks
  swift_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for updating freelancer_bank_accounts updated_at
DROP TRIGGER IF EXISTS set_freelancer_bank_accounts_updated_at ON public.freelancer_bank_accounts;

CREATE TRIGGER set_freelancer_bank_accounts_updated_at
BEFORE UPDATE ON public.freelancer_bank_accounts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS freelancer_bank_accounts_user_id_idx ON public.freelancer_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS freelancer_bank_accounts_verified_idx ON public.freelancer_bank_accounts(is_verified);

-- RLS
ALTER TABLE public.freelancer_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own bank account
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_bank_accounts' AND policyname = 'Bank accounts select own'
  ) THEN
    CREATE POLICY "Bank accounts select own" ON public.freelancer_bank_accounts
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_bank_accounts' AND policyname = 'Bank accounts insert own'
  ) THEN
    CREATE POLICY "Bank accounts insert own" ON public.freelancer_bank_accounts
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_bank_accounts' AND policyname = 'Bank accounts update own'
  ) THEN
    CREATE POLICY "Bank accounts update own" ON public.freelancer_bank_accounts
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_bank_accounts' AND policyname = 'Bank accounts delete own'
  ) THEN
    CREATE POLICY "Bank accounts delete own" ON public.freelancer_bank_accounts
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 7. PAYOUT BATCHES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_reference TEXT UNIQUE NOT NULL,
  
  -- Batch details
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payout_count INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')) DEFAULT 'pending',
  
  -- Results
  successful_payouts INTEGER DEFAULT 0,
  failed_payouts INTEGER DEFAULT 0,
  
  -- Timestamps
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  error_details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for updating payout_batches updated_at
DROP TRIGGER IF EXISTS set_payout_batches_updated_at ON public.payout_batches;

CREATE TRIGGER set_payout_batches_updated_at
BEFORE UPDATE ON public.payout_batches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS payout_batches_status_idx ON public.payout_batches(status);
CREATE INDEX IF NOT EXISTS payout_batches_scheduled_at_idx ON public.payout_batches(scheduled_at);

-- RLS (admin only - no public access needed)
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

-- Add foreign key to escrow_payments
ALTER TABLE public.escrow_payments
  DROP CONSTRAINT IF EXISTS escrow_payments_payout_batch_id_fkey;
ALTER TABLE public.escrow_payments
  ADD CONSTRAINT escrow_payments_payout_batch_id_fkey 
  FOREIGN KEY (payout_batch_id) REFERENCES public.payout_batches(id);

-- ============================================================
-- 8. DISPUTES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  escrow_payment_id UUID REFERENCES public.escrow_payments(id) ON DELETE SET NULL,
  
  -- Parties
  initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  respondent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  
  -- Dispute details
  reason TEXT CHECK (reason IN (
    'quality_issue',
    'non_delivery',
    'scope_change',
    'payment_issue',
    'communication_breakdown',
    'deadline_missed',
    'unauthorized_use',
    'other'
  )) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Evidence
  evidence_files JSONB DEFAULT '[]'::jsonb,
  initiator_evidence TEXT,
  respondent_evidence TEXT,
  
  -- Resolution
  status TEXT CHECK (status IN (
    'open',
    'under_review',
    'awaiting_response',
    'resolved',
    'escalated',
    'closed'
  )) DEFAULT 'open',
  
  -- Admin handling
  assigned_admin_id UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  internal_notes TEXT,
  
  -- Resolution decision
  resolution_decision TEXT CHECK (resolution_decision IN (
    'favor_freelancer',
    'favor_client',
    'split_payment',
    'no_fault',
    'mutual_agreement'
  )),
  payment_adjustment NUMERIC(10,2),
  resolution_summary TEXT,
  
  -- Response deadline
  response_deadline TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Trigger for updating disputes updated_at
DROP TRIGGER IF EXISTS set_disputes_updated_at ON public.disputes;

CREATE TRIGGER set_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS disputes_gig_id_idx ON public.disputes(gig_id);
CREATE INDEX IF NOT EXISTS disputes_initiated_by_idx ON public.disputes(initiated_by);
CREATE INDEX IF NOT EXISTS disputes_respondent_id_idx ON public.disputes(respondent_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx ON public.disputes(status);
CREATE INDEX IF NOT EXISTS disputes_created_at_idx ON public.disputes(created_at DESC);

-- RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Users can view disputes they're involved in
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Disputes select own'
  ) THEN
    CREATE POLICY "Disputes select own" ON public.disputes
      FOR SELECT USING (
        auth.uid() = initiated_by OR 
        auth.uid() = respondent_id OR
        auth.uid() = assigned_admin_id
      );
  END IF;
END $$;

-- Users can create disputes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Disputes insert own'
  ) THEN
    CREATE POLICY "Disputes insert own" ON public.disputes
      FOR INSERT WITH CHECK (auth.uid() = initiated_by);
  END IF;
END $$;

-- Users can update disputes they created (for adding evidence)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Disputes update own'
  ) THEN
    CREATE POLICY "Disputes update own" ON public.disputes
      FOR UPDATE USING (
        auth.uid() = initiated_by OR 
        auth.uid() = respondent_id
      );
  END IF;
END $$;

-- ============================================================
-- 9. REVIEWS TABLE (Enhanced)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  
  -- Parties
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  
  -- Review type
  review_type TEXT CHECK (review_type IN ('client_to_freelancer', 'freelancer_to_client')) NOT NULL,
  
  -- Overall rating
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Category ratings (1-5 each)
  quality_rating NUMERIC(2,1) CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating NUMERIC(2,1) CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating NUMERIC(2,1) CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating NUMERIC(2,1) CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  
  -- For client reviews (client reviewing freelancer)
  clarity_rating NUMERIC(2,1) CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
  payment_rating NUMERIC(2,1) CHECK (payment_rating >= 1 AND payment_rating <= 5),
  
  -- Review content
  review_text TEXT,
  
  -- Recommendation
  would_work_again BOOLEAN,
  would_hire_again BOOLEAN,
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  
  -- Response from reviewee
  response_text TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate reviews
  UNIQUE (gig_id, reviewer_id, reviewee_id)
);

-- Trigger for updating reviews updated_at
DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;

CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS reviews_gig_id_idx ON public.reviews(gig_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_reviewee_id_idx ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public reviews can be viewed by anyone, private only by parties
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews select public or own'
  ) THEN
    CREATE POLICY "Reviews select public or own" ON public.reviews
      FOR SELECT USING (
        is_public = true OR 
        auth.uid() = reviewer_id OR 
        auth.uid() = reviewee_id
      );
  END IF;
END $$;

-- Users can create reviews for gigs they were involved in
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews insert own'
  ) THEN
    CREATE POLICY "Reviews insert own" ON public.reviews
      FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END $$;

-- Users can update their own reviews
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews update own'
  ) THEN
    CREATE POLICY "Reviews update own" ON public.reviews
      FOR UPDATE USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
  END IF;
END $$;

-- ============================================================
-- 10. PROFILE ENHANCEMENTS (Add rating/stats columns)
-- ============================================================

-- Add freelancer stats to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS overall_rating NUMERIC(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_gigs_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_gigs_in_progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_earnings NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_balance NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_balance NUMERIC(12,2) DEFAULT 0;

-- ============================================================
-- 11. HELPER FUNCTIONS
-- ============================================================

-- Function to calculate and update user rating
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the reviewee's rating stats
  UPDATE public.profiles
  SET 
    overall_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM public.reviews 
      WHERE reviewee_id = NEW.reviewee_id AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE reviewee_id = NEW.reviewee_id AND is_public = true
    )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating on new review
DROP TRIGGER IF EXISTS update_user_rating_trigger ON public.reviews;

CREATE TRIGGER update_user_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- Function to check if all milestones are approved
CREATE OR REPLACE FUNCTION public.check_gig_completion(p_gig_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_milestones INTEGER;
  v_approved_milestones INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'approved')
  INTO v_total_milestones, v_approved_milestones
  FROM public.gig_milestones
  WHERE gig_id = p_gig_id;
  
  -- If no milestones, can't complete
  IF v_total_milestones = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- All milestones must be approved
  RETURN v_total_milestones = v_approved_milestones;
END;
$$ LANGUAGE plpgsql;

-- Function to release escrow on gig completion
CREATE OR REPLACE FUNCTION public.complete_gig_and_release_escrow(p_gig_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_can_complete BOOLEAN;
BEGIN
  -- Check if all milestones approved
  v_can_complete := public.check_gig_completion(p_gig_id);
  
  IF NOT v_can_complete THEN
    RETURN FALSE;
  END IF;
  
  -- Update gig status
  UPDATE public.assignments
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_gig_id;
  
  -- Release escrow
  UPDATE public.escrow_payments
  SET 
    status = 'released',
    released_at = NOW()
  WHERE assignment_id = p_gig_id AND status = 'held';
  
  -- Update application status
  UPDATE public.applications
  SET status = 'completed'
  WHERE assignment_id = p_gig_id AND status = 'accepted';
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 12. STORAGE BUCKET FOR DELIVERABLES
-- ============================================================

-- Note: Run this in Supabase Dashboard > Storage > New Bucket
-- Or via API:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('gig-deliverables', 'gig-deliverables', false);

-- Storage policies would be:
-- Allow freelancers to upload to their gig folders
-- Allow clients to download from their gig folders

-- ============================================================
-- 13. NOTIFICATION TYPE UPDATES
-- ============================================================

-- Update notification type constraint to include new types
DO $$ BEGIN
  ALTER TABLE public.notifications 
    DROP CONSTRAINT IF EXISTS notifications_type_check;
  ALTER TABLE public.notifications 
    ADD CONSTRAINT notifications_type_check CHECK (
      type IN (
        'job_match',
        'application',
        'message',
        'payment',
        'safety',
        'system',
        'milestone_submitted',
        'milestone_approved',
        'milestone_rejected',
        'revision_requested',
        'gig_completed',
        'payment_received',
        'payment_released',
        'payout_sent',
        'dispute_opened',
        'dispute_resolved',
        'review_received'
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

COMMENT ON TABLE public.payfast_transactions IS 'Stores all PayFast payment transactions for gig payments';
COMMENT ON TABLE public.gig_milestones IS 'Tracks milestone progress for gig-based work';
COMMENT ON TABLE public.gig_deliverables IS 'Stores deliverable files and links for gig milestones';
COMMENT ON TABLE public.freelancer_bank_accounts IS 'Stores freelancer bank account details for payouts';
COMMENT ON TABLE public.payout_batches IS 'Groups payouts into daily batches for processing';
COMMENT ON TABLE public.disputes IS 'Handles disputes between clients and freelancers';
COMMENT ON TABLE public.reviews IS 'Stores reviews and ratings after gig completion';
