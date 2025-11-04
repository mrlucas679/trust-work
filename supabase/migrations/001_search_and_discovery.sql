-- Migration: Search & Discovery Feature
-- Created: November 3, 2025
-- Description: Adds search functionality, saved searches, and enhanced filtering

-- ============================================================================
-- 1. SAVED SEARCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_type TEXT CHECK (search_type IN ('assignments', 'freelancers')) NOT NULL,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    alert_enabled BOOLEAN DEFAULT false,
    alert_frequency TEXT CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
    last_alerted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. ENHANCE ASSIGNMENTS TABLE
-- ============================================================================

-- Add search and filter columns to assignments
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS budget_min DECIMAL(10,2);
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS budget_max DECIMAL(10,2);
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS skills_required TEXT[];
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- 3. ENHANCE PROFILES TABLE (verify existing fields)
-- ============================================================================

-- These fields should already exist from the initial schema, but adding IF NOT EXISTS for safety
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_projects INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================================
-- 4. INDEXES FOR SEARCH PERFORMANCE
-- ============================================================================

-- Saved searches indexes
CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS saved_searches_type_idx ON public.saved_searches(search_type);

-- Assignment search indexes
CREATE INDEX IF NOT EXISTS assignments_status_idx ON public.assignments(status);
CREATE INDEX IF NOT EXISTS assignments_province_idx ON public.assignments(province);
CREATE INDEX IF NOT EXISTS assignments_industry_idx ON public.assignments(industry);
CREATE INDEX IF NOT EXISTS assignments_created_at_idx ON public.assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS assignments_client_id_idx ON public.assignments(client_id);

-- Skills array search (GIN index for array containment)
CREATE INDEX IF NOT EXISTS assignments_skills_gin_idx ON public.assignments USING GIN (skills_required);
CREATE INDEX IF NOT EXISTS profiles_skills_gin_idx ON public.profiles USING GIN (skills);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS assignments_search_idx ON public.assignments 
    USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS profiles_search_idx ON public.profiles 
    USING GIN (to_tsvector('english', 
        COALESCE(display_name, '') || ' ' || 
        COALESCE(desired_role, '') || ' ' || 
        COALESCE(current_job_title, '')
    ));

-- Profile search indexes
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_province_idx ON public.profiles(province);
CREATE INDEX IF NOT EXISTS profiles_industry_idx ON public.profiles(industry);
CREATE INDEX IF NOT EXISTS profiles_rating_idx ON public.profiles(rating DESC);

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on saved_searches
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Saved searches policies
DROP POLICY IF EXISTS "Users can view own saved searches" ON public.saved_searches;
CREATE POLICY "Users can view own saved searches" ON public.saved_searches
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own saved searches" ON public.saved_searches;
CREATE POLICY "Users can create own saved searches" ON public.saved_searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved searches" ON public.saved_searches;
CREATE POLICY "Users can update own saved searches" ON public.saved_searches
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved searches" ON public.saved_searches;
CREATE POLICY "Users can delete own saved searches" ON public.saved_searches
    FOR DELETE USING (auth.uid() = user_id);

-- Assignments visibility (public can view open assignments)
DROP POLICY IF EXISTS "Anyone can view open assignments" ON public.assignments;
CREATE POLICY "Anyone can view open assignments" ON public.assignments
    FOR SELECT USING (status = 'open' OR client_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create assignments" ON public.assignments;
CREATE POLICY "Authenticated users can create assignments" ON public.assignments
    FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
CREATE POLICY "Users can update own assignments" ON public.assignments
    FOR UPDATE USING (auth.uid() = client_id);

-- Profiles visibility (public can view job seeker profiles)
DROP POLICY IF EXISTS "Anyone can view job seeker profiles" ON public.profiles;
CREATE POLICY "Anyone can view job seeker profiles" ON public.profiles
    FOR SELECT USING (role = 'job_seeker' OR id = auth.uid());

-- ============================================================================
-- 6. TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Trigger for saved_searches updated_at
DROP TRIGGER IF EXISTS set_saved_searches_updated_at ON public.saved_searches;
CREATE TRIGGER set_saved_searches_updated_at
    BEFORE UPDATE ON public.saved_searches
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger for assignments updated_at (if not exists)
DROP TRIGGER IF EXISTS set_assignments_updated_at ON public.assignments;
CREATE TRIGGER set_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to search assignments with filters
CREATE OR REPLACE FUNCTION search_assignments(
    search_query TEXT DEFAULT NULL,
    filter_province TEXT DEFAULT NULL,
    filter_industry TEXT DEFAULT NULL,
    filter_skills TEXT[] DEFAULT NULL,
    filter_budget_min DECIMAL DEFAULT NULL,
    filter_budget_max DECIMAL DEFAULT NULL,
    filter_experience TEXT DEFAULT NULL,
    filter_posted_days INT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    location TEXT,
    province TEXT,
    budget_min DECIMAL,
    budget_max DECIMAL,
    skills_required TEXT[],
    industry TEXT,
    experience_level TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    client_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.location,
        a.province,
        a.budget_min,
        a.budget_max,
        a.skills_required,
        a.industry,
        a.experience_level,
        a.status,
        a.created_at,
        a.client_id
    FROM public.assignments a
    WHERE a.status = 'open'
        AND (search_query IS NULL OR 
             to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.description, '')) @@ plainto_tsquery('english', search_query))
        AND (filter_province IS NULL OR a.province = filter_province)
        AND (filter_industry IS NULL OR a.industry = filter_industry)
        AND (filter_skills IS NULL OR a.skills_required @> filter_skills)
        AND (filter_budget_min IS NULL OR a.budget_max >= filter_budget_min)
        AND (filter_budget_max IS NULL OR a.budget_min <= filter_budget_max)
        AND (filter_experience IS NULL OR a.experience_level = filter_experience)
        AND (filter_posted_days IS NULL OR a.created_at >= NOW() - (filter_posted_days || ' days')::INTERVAL)
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to search freelancers with filters
CREATE OR REPLACE FUNCTION search_freelancers(
    search_query TEXT DEFAULT NULL,
    filter_province TEXT DEFAULT NULL,
    filter_industry TEXT DEFAULT NULL,
    filter_skills TEXT[] DEFAULT NULL,
    filter_experience TEXT DEFAULT NULL,
    filter_rating_min DECIMAL DEFAULT NULL,
    filter_availability TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    role TEXT,
    skills TEXT[],
    location TEXT,
    province TEXT,
    industry TEXT,
    experience_level TEXT,
    rating DECIMAL,
    completed_projects INT,
    avatar_url TEXT,
    availability TEXT,
    current_job_title TEXT,
    desired_role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.display_name,
        p.role,
        p.skills,
        p.location,
        p.province,
        p.industry,
        p.experience_level,
        p.rating,
        p.completed_projects,
        p.avatar_url,
        p.availability,
        p.current_job_title,
        p.desired_role
    FROM public.profiles p
    WHERE p.role = 'job_seeker'
        AND (search_query IS NULL OR 
             to_tsvector('english', 
                COALESCE(p.display_name, '') || ' ' || 
                COALESCE(p.desired_role, '') || ' ' || 
                COALESCE(p.current_job_title, '')
             ) @@ plainto_tsquery('english', search_query))
        AND (filter_province IS NULL OR p.province = filter_province)
        AND (filter_industry IS NULL OR p.industry = filter_industry)
        AND (filter_skills IS NULL OR p.skills @> filter_skills)
        AND (filter_experience IS NULL OR p.experience_level = filter_experience)
        AND (filter_rating_min IS NULL OR p.rating >= filter_rating_min)
        AND (filter_availability IS NULL OR p.availability = filter_availability)
    ORDER BY p.rating DESC NULLS LAST, p.completed_projects DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- 8. SAMPLE DATA (OPTIONAL - for testing)
-- ============================================================================

-- Uncomment to insert sample assignments for testing
/*
INSERT INTO public.assignments (client_id, title, description, location, province, budget_min, budget_max, skills_required, industry, experience_level, status)
VALUES 
    (auth.uid(), 'React Developer Needed', 'Looking for an experienced React developer for a 3-month project', 'Johannesburg', 'Gauteng', 50000, 80000, ARRAY['React', 'TypeScript', 'Node.js'], 'Technology', 'intermediate', 'open'),
    (auth.uid(), 'Graphic Designer for Startup', 'Need a creative graphic designer to create brand identity', 'Cape Town', 'Western Cape', 20000, 35000, ARRAY['Adobe Photoshop', 'Illustrator', 'Figma'], 'Marketing', 'entry', 'open'),
    (auth.uid(), 'Full Stack Engineer', 'Seeking senior full stack engineer for enterprise application', 'Durban', 'KwaZulu-Natal', 80000, 120000, ARRAY['Python', 'Django', 'PostgreSQL', 'React'], 'Technology', 'senior', 'open');
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE public.saved_searches IS 'Stores user saved searches with optional alerts';
COMMENT ON TABLE public.assignments IS 'Job/gig assignments with enhanced search fields';
COMMENT ON FUNCTION search_assignments IS 'Full-text search for assignments with multiple filters';
COMMENT ON FUNCTION search_freelancers IS 'Full-text search for freelancers with multiple filters';
