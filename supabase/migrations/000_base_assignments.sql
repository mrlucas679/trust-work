-- =====================================================
-- Base Assignments Table Creation
-- =====================================================
-- Description: Creates the core assignments table for job postings/gigs
-- Dependencies: profiles table (from base schema.sql)
-- Version: 1.0
-- Created: 2025-11-04
-- IMPORTANT: Run this BEFORE migration 001

-- =====================================================
-- ASSIGNMENTS TABLE (Job Postings / Gigs)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Classification
    type TEXT CHECK (type IN ('job', 'gig', 'contract', 'full-time', 'part-time')) DEFAULT 'gig',
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    
    -- Financial
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    currency TEXT DEFAULT 'ZAR',
    
    -- Location
    location TEXT,
    province TEXT,
    remote BOOLEAN DEFAULT false,
    
    -- Skills & Requirements
    skills_required TEXT[],
    experience_level TEXT,
    industry TEXT,
    
    -- Timeline
    deadline TIMESTAMPTZ,
    estimated_duration TEXT, -- e.g., "2 weeks", "1 month"
    
    -- Safety & Verification
    verified BOOLEAN DEFAULT false,
    flagged BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS assignments_client_id_idx ON public.assignments(client_id);
CREATE INDEX IF NOT EXISTS assignments_status_idx ON public.assignments(status);
CREATE INDEX IF NOT EXISTS assignments_created_at_idx ON public.assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS assignments_province_idx ON public.assignments(province);
CREATE INDEX IF NOT EXISTS assignments_industry_idx ON public.assignments(industry);

-- Skills array search (GIN index for array containment)
CREATE INDEX IF NOT EXISTS assignments_skills_gin_idx ON public.assignments USING GIN (skills_required);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Anyone can view open, non-flagged assignments
DROP POLICY IF EXISTS "Anyone can view open assignments" ON public.assignments;
CREATE POLICY "Anyone can view open assignments" ON public.assignments
    FOR SELECT
    USING (status = 'open' AND flagged = false);

-- Authenticated users can view all assignments (for search, analytics)
DROP POLICY IF EXISTS "Authenticated users can view all assignments" ON public.assignments;
CREATE POLICY "Authenticated users can view all assignments" ON public.assignments
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Employers can insert their own assignments
DROP POLICY IF EXISTS "Employers can create assignments" ON public.assignments;
CREATE POLICY "Employers can create assignments" ON public.assignments
    FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- Employers can update their own assignments
DROP POLICY IF EXISTS "Employers can update own assignments" ON public.assignments;
CREATE POLICY "Employers can update own assignments" ON public.assignments
    FOR UPDATE
    USING (auth.uid() = client_id)
    WITH CHECK (auth.uid() = client_id);

-- Employers can delete their own assignments
DROP POLICY IF EXISTS "Employers can delete own assignments" ON public.assignments;
CREATE POLICY "Employers can delete own assignments" ON public.assignments
    FOR DELETE
    USING (auth.uid() = client_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Automatically update updated_at timestamp
DROP TRIGGER IF EXISTS set_assignments_updated_at ON public.assignments;

CREATE TRIGGER set_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE public.assignments IS 'Core table for job postings and gigs posted by employers';
COMMENT ON COLUMN public.assignments.client_id IS 'UUID of the employer who posted the assignment';
COMMENT ON COLUMN public.assignments.title IS 'Job title or gig name';
COMMENT ON COLUMN public.assignments.status IS 'Current status: open (accepting applications), in_progress (assigned), completed, cancelled';
COMMENT ON COLUMN public.assignments.flagged IS 'If true, assignment has been flagged for review and hidden from public listings';
COMMENT ON COLUMN public.assignments.verified IS 'If true, assignment has been verified by TrustWork admins';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check table was created successfully
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments' AND table_schema = 'public') THEN
        RAISE NOTICE '✓ assignments table created successfully';
    ELSE
        RAISE EXCEPTION '✗ assignments table creation failed';
    END IF;
    
    -- Check RLS is enabled
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assignments' AND schemaname = 'public' AND rowsecurity = true) THEN
        RAISE NOTICE '✓ RLS enabled on assignments table';
    ELSE
        RAISE WARNING '⚠ RLS not enabled on assignments table';
    END IF;
    
    -- Check policies exist
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'assignments') >= 5 THEN
        RAISE NOTICE '✓ RLS policies created (% policies found)', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'assignments');
    ELSE
        RAISE WARNING '⚠ Expected 5+ RLS policies, found: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'assignments');
    END IF;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Base assignments table setup complete!';
    RAISE NOTICE '============================================';
END $$;
