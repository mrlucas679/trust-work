-- =====================================================
-- Application System Schema
-- =====================================================
-- Description: Complete application workflow for freelancers to apply to assignments
-- Dependencies: assignments table, profiles table
-- Version: 1.0
-- Created: 2025-11-04

-- =====================================================
-- 1. APPLICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Application details
    cover_letter TEXT NOT NULL,
    proposed_rate DECIMAL(10,2),
    proposed_timeline TEXT,
    availability_start DATE,
    portfolio_links TEXT[],
    attachments JSONB DEFAULT '[]'::jsonb, -- [{name, url, type, size}]
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
    ),
    status_history JSONB DEFAULT '[]'::jsonb, -- [{status, timestamp, changed_by, reason}]
    
    -- Response from employer
    employer_message TEXT,
    employer_responded_at TIMESTAMPTZ,
    
    -- Metadata
    viewed_by_employer BOOLEAN DEFAULT false,
    viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(assignment_id, freelancer_id)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS applications_assignment_id_idx ON public.applications(assignment_id);
CREATE INDEX IF NOT EXISTS applications_freelancer_id_idx ON public.applications(freelancer_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON public.applications(status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS applications_assignment_status_idx ON public.applications(assignment_id, status);

-- Composite index for employer queries
CREATE INDEX IF NOT EXISTS applications_employer_queries_idx 
ON public.applications(assignment_id, status, created_at DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Freelancers can view their own applications
CREATE POLICY "Freelancers can view own applications" 
ON public.applications
FOR SELECT 
USING (auth.uid() = freelancer_id);

-- Employers can view applications for their assignments
CREATE POLICY "Employers can view applications for their assignments" 
ON public.applications
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = applications.assignment_id
        AND assignments.client_id = auth.uid()
    )
);

-- Freelancers can create applications
CREATE POLICY "Freelancers can create applications" 
ON public.applications
FOR INSERT 
WITH CHECK (
    auth.uid() = freelancer_id
    AND status = 'pending'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'job_seeker'
    )
);

-- Freelancers can update (withdraw) their own pending applications
CREATE POLICY "Freelancers can withdraw applications" 
ON public.applications
FOR UPDATE 
USING (
    auth.uid() = freelancer_id
    AND status IN ('pending', 'shortlisted')
)
WITH CHECK (
    auth.uid() = freelancer_id
    AND status = 'withdrawn'
);

-- Employers can update applications for their assignments
CREATE POLICY "Employers can update applications" 
ON public.applications
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = applications.assignment_id
        AND assignments.client_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = applications.assignment_id
        AND assignments.client_id = auth.uid()
    )
);

-- =====================================================
-- 4. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update application timestamps
CREATE OR REPLACE FUNCTION update_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_application_timestamp_trigger
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION update_application_timestamp();

-- Function to track status changes in history
CREATE OR REPLACE FUNCTION track_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        NEW.status_history = OLD.status_history || jsonb_build_object(
            'from_status', OLD.status,
            'to_status', NEW.status,
            'timestamp', NOW(),
            'changed_by', auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_status_change_trigger
BEFORE UPDATE ON public.applications
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION track_application_status_change();

-- Function to update assignment when application is accepted
CREATE OR REPLACE FUNCTION handle_application_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Update assignment status to in_progress
        UPDATE public.assignments
        SET 
            status = 'in_progress',
            freelancer_id = NEW.freelancer_id,
            started_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.assignment_id;
        
        -- Reject all other pending applications for this assignment
        UPDATE public.applications
        SET 
            status = 'rejected',
            employer_message = 'Position has been filled',
            employer_responded_at = NOW(),
            updated_at = NOW()
        WHERE 
            assignment_id = NEW.assignment_id
            AND id != NEW.id
            AND status IN ('pending', 'shortlisted');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_application_accepted_trigger
AFTER UPDATE ON public.applications
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND OLD.status != 'accepted')
EXECUTE FUNCTION handle_application_accepted();

-- Function to increment application count on assignments
CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.assignments
    SET 
        application_count = COALESCE(application_count, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.assignment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_application_count_trigger
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION increment_application_count();

-- Function to decrement application count when withdrawn
CREATE OR REPLACE FUNCTION decrement_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'withdrawn' AND OLD.status != 'withdrawn' THEN
        UPDATE public.assignments
        SET 
            application_count = GREATEST(COALESCE(application_count, 1) - 1, 0),
            updated_at = NOW()
        WHERE id = NEW.assignment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_application_count_trigger
AFTER UPDATE ON public.applications
FOR EACH ROW
WHEN (NEW.status = 'withdrawn' AND OLD.status != 'withdrawn')
EXECUTE FUNCTION decrement_application_count();

-- =====================================================
-- 5. ADD FIELDS TO ASSIGNMENTS TABLE
-- =====================================================

-- Add freelancer_id to track assigned freelancer
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add application count
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS application_count INT DEFAULT 0;

-- Add started_at for when work begins
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Add completed_at for when work is finished
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create index for freelancer assignments
CREATE INDEX IF NOT EXISTS assignments_freelancer_id_idx ON public.assignments(freelancer_id);

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function to get application statistics for an assignment
CREATE OR REPLACE FUNCTION get_assignment_application_stats(assignment_uuid UUID)
RETURNS TABLE (
    total_applications BIGINT,
    pending_count BIGINT,
    shortlisted_count BIGINT,
    accepted_count BIGINT,
    rejected_count BIGINT,
    withdrawn_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_applications,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'shortlisted') as shortlisted_count,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE status = 'withdrawn') as withdrawn_count
    FROM public.applications
    WHERE assignment_id = assignment_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can apply to assignment
CREATE OR REPLACE FUNCTION can_apply_to_assignment(
    assignment_uuid UUID,
    user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    assignment_status TEXT;
    existing_application_id UUID;
    user_role TEXT;
BEGIN
    -- Check if user is a job seeker
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = user_uuid;
    
    IF user_role != 'job_seeker' THEN
        RETURN FALSE;
    END IF;
    
    -- Check assignment status
    SELECT status INTO assignment_status
    FROM public.assignments
    WHERE id = assignment_uuid;
    
    IF assignment_status != 'open' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user already applied
    SELECT id INTO existing_application_id
    FROM public.applications
    WHERE assignment_id = assignment_uuid
    AND freelancer_id = user_uuid
    AND status NOT IN ('withdrawn', 'rejected');
    
    IF existing_application_id IS NOT NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for applications with freelancer details
CREATE OR REPLACE VIEW applications_with_freelancer AS
SELECT 
    a.*,
    p.display_name,
    p.avatar_url,
    p.skills,
    p.hourly_rate,
    p.location,
    p.province,
    p.average_rating,
    p.total_reviews,
    p.completed_projects
FROM public.applications a
JOIN public.profiles p ON p.id = a.freelancer_id;

-- View for applications with assignment details
CREATE OR REPLACE VIEW applications_with_assignment AS
SELECT 
    a.*,
    asn.title as assignment_title,
    asn.description as assignment_description,
    asn.budget_min,
    asn.budget_max,
    asn.status as assignment_status,
    asn.client_id
FROM public.applications a
JOIN public.assignments asn ON asn.id = a.assignment_id;

-- =====================================================
-- 8. SEED DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- This section can be uncommented for development/testing
/*
-- Example: Create test applications
INSERT INTO public.applications (
    assignment_id,
    freelancer_id,
    cover_letter,
    proposed_rate,
    proposed_timeline,
    status
) VALUES
(
    (SELECT id FROM public.assignments WHERE status = 'open' LIMIT 1),
    (SELECT id FROM auth.users WHERE email LIKE '%freelancer%' LIMIT 1),
    'I am very interested in this position and believe my skills are a perfect match.',
    500.00,
    '2 weeks',
    'pending'
);
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- - applications table with full CRUD support
-- - RLS policies for freelancers and employers
-- - Status tracking with history
-- - Automatic assignment status updates
-- - Application counting
-- - Utility functions and views
-- =====================================================
