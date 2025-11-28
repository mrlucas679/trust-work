-- =============================================
-- TrustWork Reviews System Migration
-- Phase 10: Post-Employment Reviews
-- Created: 2025-11-25
-- =============================================

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Review metadata
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('employer', 'employee')),
  
  -- Employment context
  position_title VARCHAR(200) NOT NULL,
  employment_duration_months INTEGER NOT NULL CHECK (employment_duration_months > 0),
  employment_start_date DATE,
  employment_end_date DATE,
  
  -- Rating categories (1-5 stars)
  -- For employee reviewing employer
  work_environment_rating DECIMAL(2,1) CHECK (work_environment_rating >= 1.0 AND work_environment_rating <= 5.0),
  management_rating DECIMAL(2,1) CHECK (management_rating >= 1.0 AND management_rating <= 5.0),
  compensation_rating DECIMAL(2,1) CHECK (compensation_rating >= 1.0 AND compensation_rating <= 5.0),
  career_growth_rating DECIMAL(2,1) CHECK (career_growth_rating >= 1.0 AND career_growth_rating <= 5.0),
  
  -- For employer reviewing employee
  technical_skills_rating DECIMAL(2,1) CHECK (technical_skills_rating >= 1.0 AND technical_skills_rating <= 5.0),
  communication_rating DECIMAL(2,1) CHECK (communication_rating >= 1.0 AND communication_rating <= 5.0),
  work_quality_rating DECIMAL(2,1) CHECK (work_quality_rating >= 1.0 AND work_quality_rating <= 5.0),
  professionalism_rating DECIMAL(2,1) CHECK (professionalism_rating >= 1.0 AND professionalism_rating <= 5.0),
  
  -- Overall rating (calculated average)
  overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
  
  -- Written review
  review_text TEXT NOT NULL CHECK (char_length(review_text) >= 100 AND char_length(review_text) <= 500),
  
  -- Would recommend?
  would_recommend BOOLEAN NOT NULL,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  flagged_by UUID REFERENCES profiles(id),
  flagged_at TIMESTAMP,
  moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'under_review', 'edited', 'removed')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMP,
  
  -- Review window (30 days after employment end)
  review_window_start DATE NOT NULL,
  review_window_end DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_review_per_application_reviewer UNIQUE (application_id, reviewer_id),
  CONSTRAINT reviewer_not_reviewee CHECK (reviewer_id != reviewee_id),
  CONSTRAINT valid_review_window CHECK (review_window_end > review_window_start),
  CONSTRAINT created_within_window CHECK (created_at::date <= review_window_end)
);

-- Indexes for performance
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_application_id ON reviews(application_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_overall_rating ON reviews(overall_rating DESC);
CREATE INDEX idx_reviews_moderation_status ON reviews(moderation_status);
CREATE INDEX idx_reviews_is_flagged ON reviews(is_flagged) WHERE is_flagged = true;

-- Row Level Security (RLS) Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (moderation_status = 'approved');

-- Policy: Users can view their own reviews regardless of status
CREATE POLICY "Users can view their own reviews"
  ON reviews FOR SELECT
  USING (
    auth.uid() = reviewer_id 
    OR auth.uid() = reviewee_id
  );

-- Policy: Users can create reviews for applications they're part of
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = application_id
      AND (
        (a.employer_id = auth.uid() AND reviewer_type = 'employer')
        OR (a.freelancer_id = auth.uid() AND reviewer_type = 'employee')
      )
    )
    AND NOW()::date <= review_window_end
  );

-- Policy: Users can update their own reviews within window
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (
    auth.uid() = reviewer_id
    AND NOW()::date <= review_window_end
  )
  WITH CHECK (
    auth.uid() = reviewer_id
  );

-- Policy: Users can flag reviews
CREATE POLICY "Users can flag reviews"
  ON reviews FOR UPDATE
  USING (
    auth.uid() = reviewer_id 
    OR auth.uid() = reviewee_id
  )
  WITH CHECK (
    is_flagged = true
  );

-- Function: Calculate overall rating
CREATE OR REPLACE FUNCTION calculate_overall_rating(
  p_reviewer_type VARCHAR,
  p_work_environment_rating DECIMAL,
  p_management_rating DECIMAL,
  p_compensation_rating DECIMAL,
  p_career_growth_rating DECIMAL,
  p_technical_skills_rating DECIMAL,
  p_communication_rating DECIMAL,
  p_work_quality_rating DECIMAL,
  p_professionalism_rating DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_total DECIMAL := 0;
  v_count INTEGER := 0;
BEGIN
  IF p_reviewer_type = 'employee' THEN
    -- Employee reviewing employer
    IF p_work_environment_rating IS NOT NULL THEN
      v_total := v_total + p_work_environment_rating;
      v_count := v_count + 1;
    END IF;
    IF p_management_rating IS NOT NULL THEN
      v_total := v_total + p_management_rating;
      v_count := v_count + 1;
    END IF;
    IF p_compensation_rating IS NOT NULL THEN
      v_total := v_total + p_compensation_rating;
      v_count := v_count + 1;
    END IF;
    IF p_career_growth_rating IS NOT NULL THEN
      v_total := v_total + p_career_growth_rating;
      v_count := v_count + 1;
    END IF;
  ELSE
    -- Employer reviewing employee
    IF p_technical_skills_rating IS NOT NULL THEN
      v_total := v_total + p_technical_skills_rating;
      v_count := v_count + 1;
    END IF;
    IF p_communication_rating IS NOT NULL THEN
      v_total := v_total + p_communication_rating;
      v_count := v_count + 1;
    END IF;
    IF p_work_quality_rating IS NOT NULL THEN
      v_total := v_total + p_work_quality_rating;
      v_count := v_count + 1;
    END IF;
    IF p_professionalism_rating IS NOT NULL THEN
      v_total := v_total + p_professionalism_rating;
      v_count := v_count + 1;
    END IF;
  END IF;
  
  IF v_count = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(v_total / v_count, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: Auto-calculate overall rating on insert/update
CREATE OR REPLACE FUNCTION trigger_calculate_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_rating := calculate_overall_rating(
    NEW.reviewer_type,
    NEW.work_environment_rating,
    NEW.management_rating,
    NEW.compensation_rating,
    NEW.career_growth_rating,
    NEW.technical_skills_rating,
    NEW.communication_rating,
    NEW.work_quality_rating,
    NEW.professionalism_rating
  );
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_overall_rating_trigger
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_overall_rating();

-- Function: Get average rating for a user
CREATE OR REPLACE FUNCTION get_user_average_rating(p_user_id UUID)
RETURNS TABLE (
  average_rating DECIMAL,
  total_reviews INTEGER,
  as_employee_rating DECIMAL,
  as_employee_count INTEGER,
  as_employer_rating DECIMAL,
  as_employer_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(AVG(r.overall_rating), 0)::DECIMAL(2,1) as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    COALESCE(AVG(CASE WHEN r.reviewer_type = 'employer' THEN r.overall_rating END), 0)::DECIMAL(2,1) as as_employee_rating,
    COUNT(CASE WHEN r.reviewer_type = 'employer' THEN 1 END)::INTEGER as as_employee_count,
    COALESCE(AVG(CASE WHEN r.reviewer_type = 'employee' THEN r.overall_rating END), 0)::DECIMAL(2,1) as as_employer_rating,
    COUNT(CASE WHEN r.reviewer_type = 'employee' THEN 1 END)::INTEGER as as_employer_count
  FROM reviews r
  WHERE r.reviewee_id = p_user_id
    AND r.moderation_status = 'approved';
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if user can review (within 30-day window)
CREATE OR REPLACE FUNCTION can_submit_review(
  p_application_id UUID,
  p_reviewer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_can_review BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM applications a
    WHERE a.id = p_application_id
      AND (a.employer_id = p_reviewer_id OR a.freelancer_id = p_reviewer_id)
      AND a.status IN ('completed', 'closed')
      AND NOT EXISTS (
        SELECT 1 FROM reviews r
        WHERE r.application_id = p_application_id
          AND r.reviewer_id = p_reviewer_id
      )
  ) INTO v_can_review;
  
  RETURN v_can_review;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Auto-flag potentially problematic reviews
CREATE OR REPLACE FUNCTION auto_flag_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Flag if review is too short or too long (outside 100-500 char range)
  IF char_length(NEW.review_text) < 100 OR char_length(NEW.review_text) > 500 THEN
    NEW.is_flagged := true;
    NEW.flag_reason := 'Review length outside acceptable range';
    NEW.moderation_status := 'under_review';
  END IF;
  
  -- Flag if all ratings are exactly 1.0 or 5.0 (potential fake)
  IF NEW.reviewer_type = 'employee' THEN
    IF (NEW.work_environment_rating = 1.0 AND NEW.management_rating = 1.0 
        AND NEW.compensation_rating = 1.0 AND NEW.career_growth_rating = 1.0)
    OR (NEW.work_environment_rating = 5.0 AND NEW.management_rating = 5.0 
        AND NEW.compensation_rating = 5.0 AND NEW.career_growth_rating = 5.0) THEN
      NEW.is_flagged := true;
      NEW.flag_reason := 'All ratings identical - potential fake review';
      NEW.moderation_status := 'under_review';
    END IF;
  ELSE
    IF (NEW.technical_skills_rating = 1.0 AND NEW.communication_rating = 1.0 
        AND NEW.work_quality_rating = 1.0 AND NEW.professionalism_rating = 1.0)
    OR (NEW.technical_skills_rating = 5.0 AND NEW.communication_rating = 5.0 
        AND NEW.work_quality_rating = 5.0 AND NEW.professionalism_rating = 5.0) THEN
      NEW.is_flagged := true;
      NEW.flag_reason := 'All ratings identical - potential fake review';
      NEW.moderation_status := 'under_review';
    END IF;
  END IF;
  
  -- Check for profanity patterns (basic)
  IF NEW.review_text ~* '(fuck|shit|damn|bitch|asshole|bastard|idiot|stupid)' THEN
    NEW.is_flagged := true;
    NEW.flag_reason := 'Contains potentially offensive language';
    NEW.moderation_status := 'under_review';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_flag_review_trigger
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_flag_review();

-- Add review stats to profiles (denormalized for performance)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_average_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS as_employee_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS as_employee_review_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS as_employer_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS as_employer_review_count INTEGER DEFAULT 0;

-- Function: Update profile review stats
CREATE OR REPLACE FUNCTION update_profile_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reviewee's profile stats
  UPDATE profiles
  SET
    review_average_rating = stats.average_rating,
    review_count = stats.total_reviews,
    as_employee_rating = stats.as_employee_rating,
    as_employee_review_count = stats.as_employee_count,
    as_employer_rating = stats.as_employer_rating,
    as_employer_review_count = stats.as_employer_count
  FROM get_user_average_rating(NEW.reviewee_id) AS stats
  WHERE profiles.id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_review_stats_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  WHEN (NEW.moderation_status = 'approved')
  EXECUTE FUNCTION update_profile_review_stats();

-- Comments
COMMENT ON TABLE reviews IS 'Post-employment reviews between employers and employees';
COMMENT ON COLUMN reviews.reviewer_type IS 'Whether reviewer is employer or employee';
COMMENT ON COLUMN reviews.employment_duration_months IS 'How long employment lasted (affects review weight)';
COMMENT ON COLUMN reviews.overall_rating IS 'Calculated average of all category ratings';
COMMENT ON COLUMN reviews.review_window_start IS 'Review can be submitted starting this date';
COMMENT ON COLUMN reviews.review_window_end IS '30 days after employment end - review deadline';
COMMENT ON COLUMN reviews.moderation_status IS 'Review approval status: approved/under_review/edited/removed';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
