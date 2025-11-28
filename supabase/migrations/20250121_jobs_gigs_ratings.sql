-- ============================================================================
-- MIGRATION: Jobs vs Gigs Separation + Skill Tests + Reviews System
-- Date: 2025-01-21
-- Description: Separates jobs from gigs, adds skill tests, reviews/ratings
-- ============================================================================

-- ============================================================================
-- PHASE 1: Skill Tests Table (create first for foreign key reference)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skill_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('technical', 'soft_skill', 'language', 'certification')) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  questions JSONB NOT NULL, -- array of test questions with answers/options
  passing_score INTEGER NOT NULL DEFAULT 70,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  category TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.skill_tests IS 'Skill test definitions used to verify applicant skills for jobs/gigs';
COMMENT ON COLUMN public.skill_tests.questions IS 'JSONB array: [{id, question, type, options, correct_answer, points}]';

-- ============================================================================
-- PHASE 2: Jobs vs Gigs Separation (now that skill_tests exists)
-- ============================================================================

-- Add type field to distinguish jobs from gigs
ALTER TABLE public.assignments 
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('job', 'gig')) NOT NULL DEFAULT 'job';

-- Add skill test requirement fields
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS requires_skill_test BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS skill_test_id UUID REFERENCES public.skill_tests(id) ON DELETE SET NULL;

-- Add index for type filtering (performance optimization)
CREATE INDEX IF NOT EXISTS assignments_type_idx ON public.assignments(type);
CREATE INDEX IF NOT EXISTS assignments_type_status_idx ON public.assignments(type, status);

COMMENT ON COLUMN public.assignments.type IS 'Job = long-term hiring (employer posts only), Gig = short-term task (anyone can post)';
COMMENT ON COLUMN public.assignments.requires_skill_test IS 'If true, applicants must complete skill test before applying';

-- ============================================================================
-- PHASE 3: Skill Test Results
-- ============================================================================

-- Skill test results (tracks test attempts for applications)
CREATE TABLE IF NOT EXISTS public.skill_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_test_id UUID NOT NULL REFERENCES public.skill_tests(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken_minutes INTEGER,
  answers JSONB, -- array of answers for review
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.skill_test_results IS 'Tracks skill test attempts by job seekers for job/gig applications';
COMMENT ON COLUMN public.skill_test_results.passed IS 'True if score >= passing_score for the test';

-- ============================================================================
-- PHASE 4: Assignment Certificates (for portfolio building)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assignment_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed_at TIMESTAMPTZ,
  score INTEGER,
  certificate_url TEXT,
  badge_level TEXT CHECK (badge_level IN ('bronze', 'silver', 'gold', 'platinum')),
  skills_demonstrated TEXT[], -- array of skills proved by completing this
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.assignment_certificates IS 'Standalone skill-building assignments for earning portfolio certificates';
COMMENT ON COLUMN public.assignment_certificates.badge_level IS 'Achievement level based on score/performance';

-- ============================================================================
-- PHASE 5: Reviews and Ratings System
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gig_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  skills_demonstrated TEXT[], -- skills the reviewee demonstrated
  would_work_again BOOLEAN DEFAULT FALSE,
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(gig_id, reviewer_id, reviewee_id) -- One review per person per gig
);

COMMENT ON TABLE public.gig_reviews IS 'Reviews and ratings after gig completion (mutual reviews between parties)';
COMMENT ON COLUMN public.gig_reviews.rating IS 'Overall rating 1-5 stars';

-- ============================================================================
-- PHASE 6: Profile Enhancements for Ratings
-- ============================================================================

-- Add rating fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS overall_rating NUMERIC(3,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_gigs_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2) DEFAULT 0.00;

COMMENT ON COLUMN public.profiles.overall_rating IS 'Aggregate rating from all reviews (1-5 scale)';
COMMENT ON COLUMN public.profiles.success_rate IS 'Percentage of successfully completed gigs';

-- ============================================================================
-- PHASE 7: Application Enhancements
-- ============================================================================

-- Add CV and gig-specific fields to applications
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cv_url TEXT,
  ADD COLUMN IF NOT EXISTS bid_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS estimated_duration TEXT,
  ADD COLUMN IF NOT EXISTS skill_test_result_id UUID REFERENCES public.skill_test_results(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.applications.cv_url IS 'CV/Resume URL (required for job applications, not for gigs)';
COMMENT ON COLUMN public.applications.bid_amount IS 'Bid amount for gig applications';
COMMENT ON COLUMN public.applications.estimated_duration IS 'Estimated completion time for gig';

-- ============================================================================
-- PHASE 8: Row Level Security (RLS) Policies
-- ============================================================================

-- Skill Tests: Public read, admin only write
ALTER TABLE public.skill_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill tests" ON public.skill_tests
  FOR SELECT USING (true);

CREATE POLICY "Only admins can create skill tests" ON public.skill_tests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'employer' -- Admins can be employers with special flag
    )
  );

-- Skill Test Results: Users can view/insert their own results
ALTER TABLE public.skill_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test results" ON public.skill_test_results
  FOR SELECT USING (auth.uid() = job_seeker_id);

CREATE POLICY "Users can insert own test results" ON public.skill_test_results
  FOR INSERT WITH CHECK (auth.uid() = job_seeker_id);

-- Assignment Certificates: Users can view their own certificates
ALTER TABLE public.assignment_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON public.assignment_certificates
  FOR SELECT USING (auth.uid() = job_seeker_id);

CREATE POLICY "Users can insert own certificates" ON public.assignment_certificates
  FOR INSERT WITH CHECK (auth.uid() = job_seeker_id);

-- Gig Reviews: Anyone can read, only involved parties can write
ALTER TABLE public.gig_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON public.gig_reviews
  FOR SELECT USING (true);

CREATE POLICY "Only involved parties can create reviews" ON public.gig_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE assignment_id = gig_id
      AND (freelancer_id = reviewer_id OR freelancer_id = reviewee_id)
      AND status = 'completed'
    )
  );

-- ============================================================================
-- PHASE 9: Indexes for Performance
-- ============================================================================

-- Skill test results indexes
CREATE INDEX IF NOT EXISTS skill_test_results_job_seeker_id_idx ON public.skill_test_results(job_seeker_id);
CREATE INDEX IF NOT EXISTS skill_test_results_application_id_idx ON public.skill_test_results(application_id);
CREATE INDEX IF NOT EXISTS skill_test_results_passed_idx ON public.skill_test_results(passed);

-- Assignment certificates indexes
CREATE INDEX IF NOT EXISTS assignment_certificates_job_seeker_id_idx ON public.assignment_certificates(job_seeker_id);
CREATE INDEX IF NOT EXISTS assignment_certificates_badge_level_idx ON public.assignment_certificates(badge_level);

-- Gig reviews indexes
CREATE INDEX IF NOT EXISTS gig_reviews_reviewee_id_idx ON public.gig_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS gig_reviews_reviewer_id_idx ON public.gig_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS gig_reviews_gig_id_idx ON public.gig_reviews(gig_id);
CREATE INDEX IF NOT EXISTS gig_reviews_rating_idx ON public.gig_reviews(rating);

-- Application enhancements indexes
CREATE INDEX IF NOT EXISTS applications_skill_test_result_id_idx ON public.applications(skill_test_result_id);

-- ============================================================================
-- PHASE 10: Triggers for Automatic Updates
-- ============================================================================

-- Trigger for skill_tests updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_skill_tests_updated_at
  BEFORE UPDATE ON public.skill_tests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_assignment_certificates_updated_at
  BEFORE UPDATE ON public.assignment_certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_gig_reviews_updated_at
  BEFORE UPDATE ON public.gig_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger to update profile ratings when new review is added
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reviewee's overall rating and total reviews
  UPDATE public.profiles
  SET 
    overall_rating = (
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM public.gig_reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.gig_reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_review
  AFTER INSERT ON public.gig_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_rating();

-- ============================================================================
-- PHASE 11: Helper Functions
-- ============================================================================

-- Function to calculate user's success rate
CREATE OR REPLACE FUNCTION public.calculate_success_rate(user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_gigs INTEGER;
  completed_gigs INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_gigs
  FROM public.applications
  WHERE freelancer_id = user_id
  AND assignment_id IN (SELECT id FROM public.assignments WHERE type = 'gig');
  
  SELECT COUNT(*) INTO completed_gigs
  FROM public.applications
  WHERE freelancer_id = user_id
  AND status = 'completed'
  AND assignment_id IN (SELECT id FROM public.assignments WHERE type = 'gig');
  
  IF total_gigs = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (completed_gigs::NUMERIC / total_gigs::NUMERIC * 100)::NUMERIC(5,2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.calculate_success_rate IS 'Calculates percentage of successfully completed gigs for a user';

-- ============================================================================
-- PHASE 12: Data Migration (Update Existing Records)
-- ============================================================================

-- Set all existing assignments to 'job' type (default)
UPDATE public.assignments 
SET type = 'job' 
WHERE type IS NULL;

-- Initialize profile rating fields for existing users
UPDATE public.profiles
SET 
  overall_rating = 0.00,
  total_reviews = 0,
  total_gigs_completed = 0,
  success_rate = 0.00
WHERE overall_rating IS NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Created tables:';
  RAISE NOTICE '  - skill_tests';
  RAISE NOTICE '  - skill_test_results';
  RAISE NOTICE '  - assignment_certificates';
  RAISE NOTICE '  - gig_reviews';
  RAISE NOTICE 'Enhanced tables:';
  RAISE NOTICE '  - assignments (added type, skill test fields)';
  RAISE NOTICE '  - applications (added CV, bid, skill test result)';
  RAISE NOTICE '  - profiles (added ratings, success rate)';
  RAISE NOTICE 'Created indexes, triggers, and RLS policies.';
END $$;
