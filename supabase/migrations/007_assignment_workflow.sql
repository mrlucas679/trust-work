-- =====================================================
-- Assignment Workflow Enhancement
-- =====================================================
-- Description: Complete assignment lifecycle management with reviews
-- Dependencies: assignments table, applications table, profiles table
-- Version: 1.0
-- Created: 2025-11-04

-- =====================================================
-- 1. REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Review content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL CHECK (char_length(review_text) >= 10 AND char_length(review_text) <= 2000),
    
    -- Review type
    reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('employer', 'freelancer')),
    
    -- Metadata
    helpful_count INT DEFAULT 0,
    flagged BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(assignment_id, reviewer_id),
    CHECK (reviewer_id != reviewee_id)
);

-- =====================================================
-- 2. ASSIGNMENT STATUS HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.assignment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    
    -- Status change
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS reviews_assignment_id_idx ON public.reviews(assignment_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_reviewee_id_idx ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS assignment_status_history_assignment_id_idx ON public.assignment_status_history(assignment_id);
CREATE INDEX IF NOT EXISTS assignment_status_history_created_at_idx ON public.assignment_status_history(created_at DESC);

-- =====================================================
-- 4. ENABLE RLS
-- =====================================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_status_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES - REVIEWS
-- =====================================================

-- Anyone can read reviews (public transparency)
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews" ON public.reviews
    FOR SELECT
    USING (flagged = false);

-- Only participants can create reviews (reviewer must be part of assignment)
DROP POLICY IF EXISTS "Participants can create reviews" ON public.reviews;
CREATE POLICY "Participants can create reviews" ON public.reviews
    FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = assignment_id
            AND (
                a.client_id = reviewer_id OR  -- Employer reviewing
                a.freelancer_id = reviewer_id  -- Freelancer reviewing
            )
            AND a.status = 'completed'  -- Only after completion
        )
    );

-- Reviewers can update their own reviews (within limits)
DROP POLICY IF EXISTS "Reviewers can update own reviews" ON public.reviews;
CREATE POLICY "Reviewers can update own reviews" ON public.reviews
    FOR UPDATE
    USING (auth.uid() = reviewer_id AND created_at > NOW() - INTERVAL '7 days')
    WITH CHECK (auth.uid() = reviewer_id);

-- Admins can flag inappropriate reviews
DROP POLICY IF EXISTS "Admins can flag reviews" ON public.reviews;
CREATE POLICY "Admins can flag reviews" ON public.reviews
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'is_admin' = 'true'
    );

-- =====================================================
-- 6. RLS POLICIES - ASSIGNMENT STATUS HISTORY
-- =====================================================

-- Users can view status history for their assignments
DROP POLICY IF EXISTS "Users can view own assignment history" ON public.assignment_status_history;
CREATE POLICY "Users can view own assignment history" ON public.assignment_status_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = assignment_id
            AND (a.client_id = auth.uid() OR a.freelancer_id = auth.uid())
        )
    );

-- System can insert status changes
DROP POLICY IF EXISTS "System can insert status history" ON public.assignment_status_history;
CREATE POLICY "System can insert status history" ON public.assignment_status_history
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 7. TRIGGERS - TRACK STATUS CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION track_assignment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.assignment_status_history (
            assignment_id,
            old_status,
            new_status,
            changed_by,
            reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            COALESCE(auth.uid(), NEW.client_id),  -- Use current user or fallback to client
            CASE 
                WHEN NEW.status = 'in_progress' THEN 'Application accepted and work started'
                WHEN NEW.status = 'completed' THEN 'Work completed by freelancer'
                WHEN NEW.status = 'cancelled' THEN 'Assignment cancelled'
                ELSE 'Status updated'
            END
        );
        
        -- Update timestamps
        IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
            NEW.started_at = NOW();
        END IF;
        
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            NEW.completed_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_assignment_status_change_trigger ON public.assignments;

CREATE TRIGGER track_assignment_status_change_trigger
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION track_assignment_status_change();

-- =====================================================
-- 8. TRIGGERS - UPDATE PROFILE RATINGS
-- =====================================================

CREATE OR REPLACE FUNCTION update_profile_ratings()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INT;
BEGIN
    -- Calculate average rating for the reviewee
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
    AND flagged = false;
    
    -- Update profile with new rating
    UPDATE public.profiles
    SET 
        rating = avg_rating,
        completed_projects = CASE 
            WHEN role = 'job_seeker' THEN review_count
            ELSE completed_projects
        END,
        updated_at = NOW()
    WHERE id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_profile_ratings_trigger ON public.reviews;

CREATE TRIGGER update_profile_ratings_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_ratings();

-- =====================================================
-- 9. RPC FUNCTIONS - WORKFLOW OPERATIONS
-- =====================================================

-- Start assignment work (employer accepts application)
CREATE OR REPLACE FUNCTION start_assignment_work(
    p_assignment_id UUID,
    p_application_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_assignment public.assignments;
    v_application public.applications;
    v_result JSONB;
BEGIN
    -- Get assignment (with RLS check)
    SELECT * INTO v_assignment
    FROM public.assignments
    WHERE id = p_assignment_id
    AND client_id = auth.uid();
    
    IF v_assignment IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Assignment not found or unauthorized'
        );
    END IF;
    
    -- Check assignment is open
    IF v_assignment.status != 'open' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Assignment is not open'
        );
    END IF;
    
    -- Get application (with RLS check)
    SELECT * INTO v_application
    FROM public.applications
    WHERE id = p_application_id
    AND assignment_id = p_assignment_id;
    
    IF v_application IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Application not found'
        );
    END IF;
    
    -- Update application status to accepted
    UPDATE public.applications
    SET 
        status = 'accepted',
        employer_responded_at = NOW(),
        updated_at = NOW()
    WHERE id = p_application_id;
    
    -- Update assignment status to in_progress
    UPDATE public.assignments
    SET 
        status = 'in_progress',
        freelancer_id = v_application.freelancer_id,
        started_at = NOW(),
        updated_at = NOW()
    WHERE id = p_assignment_id;
    
    -- Reject all other applications
    UPDATE public.applications
    SET 
        status = 'rejected',
        employer_message = 'Another applicant was selected for this assignment',
        employer_responded_at = NOW(),
        updated_at = NOW()
    WHERE assignment_id = p_assignment_id
    AND id != p_application_id
    AND status = 'pending';
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Assignment started successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete assignment (freelancer marks as done)
CREATE OR REPLACE FUNCTION complete_assignment(
    p_assignment_id UUID,
    p_completion_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_assignment public.assignments;
BEGIN
    -- Get assignment (with RLS check)
    SELECT * INTO v_assignment
    FROM public.assignments
    WHERE id = p_assignment_id
    AND freelancer_id = auth.uid();
    
    IF v_assignment IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Assignment not found or unauthorized'
        );
    END IF;
    
    -- Check assignment is in progress
    IF v_assignment.status != 'in_progress' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Assignment is not in progress'
        );
    END IF;
    
    -- Update assignment status
    UPDATE public.assignments
    SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_assignment_id;
    
    -- Create notification for employer
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        priority,
        action_url
    ) VALUES (
        v_assignment.client_id,
        'system',
        'Assignment Completed',
        'The freelancer has marked the assignment as completed. Please review and provide feedback.',
        'high',
        '/assignments/' || p_assignment_id::TEXT
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Assignment marked as completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel assignment
CREATE OR REPLACE FUNCTION cancel_assignment(
    p_assignment_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_assignment public.assignments;
BEGIN
    -- Get assignment (with RLS check - must be client)
    SELECT * INTO v_assignment
    FROM public.assignments
    WHERE id = p_assignment_id
    AND client_id = auth.uid();
    
    IF v_assignment IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Assignment not found or unauthorized'
        );
    END IF;
    
    -- Can't cancel completed assignments
    IF v_assignment.status = 'completed' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot cancel completed assignments'
        );
    END IF;
    
    -- Update assignment status
    UPDATE public.assignments
    SET 
        status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_assignment_id;
    
    -- Notify freelancer if assigned
    IF v_assignment.freelancer_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            priority
        ) VALUES (
            v_assignment.freelancer_id,
            'system',
            'Assignment Cancelled',
            'The employer has cancelled the assignment. Reason: ' || COALESCE(p_reason, 'Not specified'),
            'high'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Assignment cancelled'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get assignment timeline
CREATE OR REPLACE FUNCTION get_assignment_timeline(p_assignment_id UUID)
RETURNS TABLE (
    event_type TEXT,
    event_description TEXT,
    event_timestamp TIMESTAMPTZ,
    event_user UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'status_change' as event_type,
        'Status changed from ' || old_status || ' to ' || new_status as event_description,
        created_at as event_timestamp,
        changed_by as event_user
    FROM public.assignment_status_history
    WHERE assignment_id = p_assignment_id
    ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE public.reviews IS 'Reviews and ratings for completed assignments';
COMMENT ON TABLE public.assignment_status_history IS 'Audit trail for assignment status changes';
COMMENT ON FUNCTION start_assignment_work IS 'RPC: Employer accepts application and starts work';
COMMENT ON FUNCTION complete_assignment IS 'RPC: Freelancer marks assignment as complete';
COMMENT ON FUNCTION cancel_assignment IS 'RPC: Employer cancels assignment with reason';
COMMENT ON FUNCTION get_assignment_timeline IS 'RPC: Get complete timeline of assignment events';

-- =====================================================
-- 11. VERIFICATION
-- =====================================================

DO $$
BEGIN
    -- Check tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        RAISE NOTICE '✓ reviews table created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignment_status_history' AND table_schema = 'public') THEN
        RAISE NOTICE '✓ assignment_status_history table created';
    END IF;
    
    -- Check RLS enabled
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reviews' AND schemaname = 'public' AND rowsecurity = true) THEN
        RAISE NOTICE '✓ RLS enabled on reviews';
    END IF;
    
    -- Check functions exist
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'start_assignment_work') THEN
        RAISE NOTICE '✓ start_assignment_work() function created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'complete_assignment') THEN
        RAISE NOTICE '✓ complete_assignment() function created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cancel_assignment') THEN
        RAISE NOTICE '✓ cancel_assignment() function created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_assignment_timeline') THEN
        RAISE NOTICE '✓ get_assignment_timeline() function created';
    END IF;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Assignment Workflow System Complete!';
    RAISE NOTICE '============================================';
END $$;
