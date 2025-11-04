-- ============================================================================
-- TrustWork Search & Discovery System
-- Migration: 005_search_system.sql
-- Description: Full-text search, saved searches, and search history
-- Created: 2025-11-04
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Trigram similarity for fuzzy matching
CREATE EXTENSION IF NOT EXISTS unaccent; -- Remove accents for better search

-- ============================================================================
-- 1. FULL-TEXT SEARCH CONFIGURATION
-- ============================================================================

-- Create custom text search configuration for English
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS english_unaccent (COPY = english);
ALTER TEXT SEARCH CONFIGURATION english_unaccent
    ALTER MAPPING FOR hword, hword_part, word
    WITH unaccent, english_stem;

-- ============================================================================
-- 2. ADD SEARCH COLUMNS TO ASSIGNMENTS TABLE
-- ============================================================================

-- Add tsvector column for full-text search if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE public.assignments 
        ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.update_assignment_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english_unaccent', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english_unaccent', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english_unaccent', COALESCE(array_to_string(NEW.skills_required, ' '), '')), 'C') ||
        setweight(to_tsvector('english_unaccent', COALESCE(NEW.industry, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector on insert/update
DROP TRIGGER IF EXISTS assignments_search_vector_update ON public.assignments;
CREATE TRIGGER assignments_search_vector_update
    BEFORE INSERT OR UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_assignment_search_vector();

-- Update existing assignments with search vectors
UPDATE public.assignments 
SET search_vector = 
    setweight(to_tsvector('english_unaccent', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english_unaccent', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english_unaccent', COALESCE(array_to_string(skills_required, ' '), '')), 'C') ||
    setweight(to_tsvector('english_unaccent', COALESCE(industry, '')), 'D')
WHERE search_vector IS NULL;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_assignments_search_vector 
ON public.assignments USING gin(search_vector);

-- Create additional indexes for common filters
CREATE INDEX IF NOT EXISTS idx_assignments_location ON public.assignments(location);
CREATE INDEX IF NOT EXISTS idx_assignments_industry ON public.assignments(industry);
CREATE INDEX IF NOT EXISTS idx_assignments_budget ON public.assignments(budget);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at_desc ON public.assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);

-- Create composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_assignments_status_created 
ON public.assignments(status, created_at DESC) 
WHERE status = 'open';

-- ============================================================================
-- 3. ADD SEARCH COLUMNS TO PROFILES TABLE
-- ============================================================================

-- Add tsvector column for freelancer search
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Create function to update profile search vector
CREATE OR REPLACE FUNCTION public.update_profile_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english_unaccent', COALESCE(NEW.full_name, '')), 'A') ||
        setweight(to_tsvector('english_unaccent', COALESCE(NEW.bio, '')), 'B') ||
        setweight(to_tsvector('english_unaccent', COALESCE(array_to_string(NEW.skills, ' '), '')), 'A') ||
        setweight(to_tsvector('english_unaccent', COALESCE(NEW.title, '')), 'B') ||
        setweight(to_tsvector('english_unaccent', COALESCE(NEW.location, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile search vector
DROP TRIGGER IF EXISTS profiles_search_vector_update ON public.profiles;
CREATE TRIGGER profiles_search_vector_update
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_search_vector();

-- Update existing profiles with search vectors
UPDATE public.profiles 
SET search_vector = 
    setweight(to_tsvector('english_unaccent', COALESCE(full_name, '')), 'A') ||
    setweight(to_tsvector('english_unaccent', COALESCE(bio, '')), 'B') ||
    setweight(to_tsvector('english_unaccent', COALESCE(array_to_string(skills, ' '), '')), 'A') ||
    setweight(to_tsvector('english_unaccent', COALESCE(title, '')), 'B') ||
    setweight(to_tsvector('english_unaccent', COALESCE(location, '')), 'C')
WHERE search_vector IS NULL AND role = 'freelancer';

-- Create GIN index for profile search
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector 
ON public.profiles USING gin(search_vector);

-- Create additional indexes for freelancer search
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_hourly_rate ON public.profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_profiles_availability ON public.profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_available 
ON public.profiles(role, availability_status) 
WHERE role = 'freelancer';

-- ============================================================================
-- 4. SAVED SEARCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_searches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name varchar(100) NOT NULL,
    search_type varchar(20) NOT NULL CHECK (search_type IN ('assignment', 'freelancer')),
    
    -- Search filters stored as JSONB for flexibility
    filters jsonb NOT NULL DEFAULT '{}',
    
    -- Alert settings
    alert_enabled boolean NOT NULL DEFAULT false,
    alert_frequency varchar(20) CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
    last_alerted_at timestamptz,
    
    -- Result count for user reference
    last_result_count integer,
    last_run_at timestamptz,
    
    -- Metadata
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, name)
);

-- Indexes for saved searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_user 
ON public.saved_searches(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts 
ON public.saved_searches(alert_enabled, alert_frequency, last_alerted_at) 
WHERE alert_enabled = true;

-- RLS policies for saved searches
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved searches"
ON public.saved_searches FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved searches"
ON public.saved_searches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
ON public.saved_searches FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
ON public.saved_searches FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- 5. SEARCH HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.search_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    search_type varchar(20) NOT NULL CHECK (search_type IN ('assignment', 'freelancer')),
    
    -- Search query and filters
    query text,
    filters jsonb DEFAULT '{}',
    
    -- Search results metadata
    result_count integer,
    clicked_result_ids uuid[],
    
    -- Metadata
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Composite index on user and created date
    CONSTRAINT search_history_user_created_idx 
        EXCLUDE USING gist (user_id WITH =, created_at WITH =)
);

-- Indexes for search history
CREATE INDEX IF NOT EXISTS idx_search_history_user_created 
ON public.search_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_history_query 
ON public.search_history USING gin(to_tsvector('english_unaccent', query));

-- RLS policies for search history
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search history"
ON public.search_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own search history"
ON public.search_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search history"
ON public.search_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- 6. SEARCH FUNCTIONS
-- ============================================================================

-- Function to search assignments with full-text search and filters
CREATE OR REPLACE FUNCTION public.search_assignments(
    p_user_id uuid,
    p_query text DEFAULT NULL,
    p_location text DEFAULT NULL,
    p_min_budget numeric DEFAULT NULL,
    p_max_budget numeric DEFAULT NULL,
    p_skills text[] DEFAULT NULL,
    p_industry text DEFAULT NULL,
    p_posted_after timestamptz DEFAULT NULL,
    p_status text DEFAULT 'open',
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    title varchar,
    description text,
    budget numeric,
    location varchar,
    industry varchar,
    skills_required text[],
    status varchar,
    created_at timestamptz,
    employer_id uuid,
    employer_name varchar,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.budget,
        a.location,
        a.industry,
        a.skills_required,
        a.status,
        a.created_at,
        a.employer_id,
        p.full_name AS employer_name,
        CASE 
            WHEN p_query IS NOT NULL THEN 
                ts_rank(a.search_vector, plainto_tsquery('english_unaccent', p_query))
            ELSE 0
        END AS rank
    FROM public.assignments a
    LEFT JOIN public.profiles p ON a.employer_id = p.id
    WHERE 
        -- Status filter
        (p_status IS NULL OR a.status = p_status)
        -- Full-text search
        AND (p_query IS NULL OR a.search_vector @@ plainto_tsquery('english_unaccent', p_query))
        -- Location filter (case-insensitive partial match)
        AND (p_location IS NULL OR a.location ILIKE '%' || p_location || '%')
        -- Budget range filter
        AND (p_min_budget IS NULL OR a.budget >= p_min_budget)
        AND (p_max_budget IS NULL OR a.budget <= p_max_budget)
        -- Skills filter (any skill matches)
        AND (p_skills IS NULL OR a.skills_required && p_skills)
        -- Industry filter
        AND (p_industry IS NULL OR a.industry = p_industry)
        -- Date filter
        AND (p_posted_after IS NULL OR a.created_at >= p_posted_after)
    ORDER BY 
        -- Rank by relevance if query provided, otherwise by date
        CASE WHEN p_query IS NOT NULL THEN rank END DESC NULLS LAST,
        a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search freelancers
CREATE OR REPLACE FUNCTION public.search_freelancers(
    p_user_id uuid,
    p_query text DEFAULT NULL,
    p_location text DEFAULT NULL,
    p_min_rate numeric DEFAULT NULL,
    p_max_rate numeric DEFAULT NULL,
    p_skills text[] DEFAULT NULL,
    p_availability varchar DEFAULT NULL,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    full_name varchar,
    title varchar,
    bio text,
    location varchar,
    skills text[],
    hourly_rate numeric,
    availability_status varchar,
    avatar_url text,
    created_at timestamptz,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.title,
        p.bio,
        p.location,
        p.skills,
        p.hourly_rate,
        p.availability_status,
        p.avatar_url,
        p.created_at,
        CASE 
            WHEN p_query IS NOT NULL THEN 
                ts_rank(p.search_vector, plainto_tsquery('english_unaccent', p_query))
            ELSE 0
        END AS rank
    FROM public.profiles p
    WHERE 
        -- Only freelancers
        p.role = 'freelancer'
        -- Full-text search
        AND (p_query IS NULL OR p.search_vector @@ plainto_tsquery('english_unaccent', p_query))
        -- Location filter
        AND (p_location IS NULL OR p.location ILIKE '%' || p_location || '%')
        -- Hourly rate filter
        AND (p_min_rate IS NULL OR p.hourly_rate >= p_min_rate)
        AND (p_max_rate IS NULL OR p.hourly_rate <= p_max_rate)
        -- Skills filter
        AND (p_skills IS NULL OR p.skills && p_skills)
        -- Availability filter
        AND (p_availability IS NULL OR p.availability_status = p_availability)
    ORDER BY 
        CASE WHEN p_query IS NOT NULL THEN rank END DESC NULLS LAST,
        p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get search suggestions based on query
CREATE OR REPLACE FUNCTION public.get_search_suggestions(
    p_query text,
    p_type text DEFAULT 'assignment'
)
RETURNS TABLE (
    suggestion text,
    category text,
    count bigint
) AS $$
BEGIN
    IF p_type = 'assignment' THEN
        RETURN QUERY
        SELECT DISTINCT
            unnest(skills_required) AS suggestion,
            'skill'::text AS category,
            COUNT(*) AS count
        FROM public.assignments
        WHERE 
            status = 'open'
            AND EXISTS (
                SELECT 1 FROM unnest(skills_required) s 
                WHERE s ILIKE p_query || '%'
            )
        GROUP BY suggestion
        ORDER BY count DESC
        LIMIT 10;
    ELSE
        RETURN QUERY
        SELECT DISTINCT
            unnest(skills) AS suggestion,
            'skill'::text AS category,
            COUNT(*) AS count
        FROM public.profiles
        WHERE 
            role = 'freelancer'
            AND EXISTS (
                SELECT 1 FROM unnest(skills) s 
                WHERE s ILIKE p_query || '%'
            )
        GROUP BY suggestion
        ORDER BY count DESC
        LIMIT 10;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. UPDATE TIMESTAMPS TRIGGER FOR SAVED SEARCHES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_saved_searches_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_searches_updated_at ON public.saved_searches;
CREATE TRIGGER saved_searches_updated_at
    BEFORE UPDATE ON public.saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_saved_searches_updated_at();

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on search functions
GRANT EXECUTE ON FUNCTION public.search_assignments TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_freelancers TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_search_suggestions TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 005_search_system completed successfully';
    RAISE NOTICE 'Created tables: saved_searches, search_history';
    RAISE NOTICE 'Added full-text search to: assignments, profiles';
    RAISE NOTICE 'Created search functions: search_assignments, search_freelancers, get_search_suggestions';
END $$;
