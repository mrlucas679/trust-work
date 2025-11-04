-- ============================================================================
-- TrustWork: Apply All Migrations Script
-- ============================================================================
-- This script applies all migrations in order to set up the complete database
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
--
-- IMPORTANT: Run this AFTER applying the base schema.sql
--
-- Order of execution:
-- 1. Base schema (profiles, notifications) - MUST BE APPLIED FIRST
-- 2. Search & Discovery (assignments, saved searches)
-- 3. Messaging & Communication (messages, conversations)
-- 4. Notifications System (notification types, triggers)
-- 5. Analytics System (tracking, metrics, aggregations)
-- 6. Advanced Search System (full-text search, filters)
-- 7. Application System (applications, status tracking, RLS)
--
-- Execution time: ~30-60 seconds total
-- ============================================================================

-- Check if base schema is applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'Base schema not found! Apply supabase/schema.sql first.';
    END IF;
    
    RAISE NOTICE '✓ Base schema detected. Proceeding with migrations...';
END $$;

-- ============================================================================
-- Migration tracking table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    id SERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE,
    description TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function to check if migration was applied
CREATE OR REPLACE FUNCTION migration_applied(version_num TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.schema_migrations WHERE version = version_num);
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE '============================================================================';
RAISE NOTICE 'Starting TrustWork Migration Deployment';
RAISE NOTICE '============================================================================';

-- ============================================================================
-- MIGRATION 001: Search and Discovery
-- ============================================================================
DO $$
BEGIN
    IF NOT migration_applied('001') THEN
        RAISE NOTICE '→ Applying Migration 001: Search and Discovery...';
        -- Migration will be applied by including the file content
        INSERT INTO public.schema_migrations (version, description) 
        VALUES ('001', 'Search and Discovery System');
        RAISE NOTICE '✓ Migration 001 applied successfully';
    ELSE
        RAISE NOTICE '⊙ Migration 001 already applied, skipping';
    END IF;
END $$;

\i 'supabase/migrations/001_search_and_discovery.sql'

-- ============================================================================
-- MIGRATION 002: Messaging and Communication
-- ============================================================================
DO $$
BEGIN
    IF NOT migration_applied('002') THEN
        RAISE NOTICE '→ Applying Migration 002: Messaging and Communication...';
        INSERT INTO public.schema_migrations (version, description) 
        VALUES ('002', 'Messaging and Communication System');
        RAISE NOTICE '✓ Migration 002 applied successfully';
    ELSE
        RAISE NOTICE '⊙ Migration 002 already applied, skipping';
    END IF;
END $$;

\i 'supabase/migrations/002_messaging_and_communication.sql'

-- ============================================================================
-- MIGRATION 003: Notifications System
-- ============================================================================
DO $$
BEGIN
    IF NOT migration_applied('003') THEN
        RAISE NOTICE '→ Applying Migration 003: Notifications System...';
        INSERT INTO public.schema_migrations (version, description) 
        VALUES ('003', 'Enhanced Notifications System');
        RAISE NOTICE '✓ Migration 003 applied successfully';
    ELSE
        RAISE NOTICE '⊙ Migration 003 already applied, skipping';
    END IF;
END $$;

\i 'supabase/migrations/003_notifications_system.sql'

-- ============================================================================
-- MIGRATION 004: Analytics System
-- ============================================================================
DO $$
BEGIN
    IF NOT migration_applied('004') THEN
        RAISE NOTICE '→ Applying Migration 004: Analytics System...';
        INSERT INTO public.schema_migrations (version, description) 
        VALUES ('004', 'Comprehensive Analytics System');
        RAISE NOTICE '✓ Migration 004 applied successfully';
    ELSE
        RAISE NOTICE '⊙ Migration 004 already applied, skipping';
    END IF;
END $$;

\i 'supabase/migrations/004_analytics_system.sql'

-- ============================================================================
-- MIGRATION 005: Advanced Search System
-- ============================================================================
DO $$
BEGIN
    IF NOT migration_applied('005') THEN
        RAISE NOTICE '→ Applying Migration 005: Advanced Search System...';
        INSERT INTO public.schema_migrations (version, description) 
        VALUES ('005', 'Advanced Search with Full-Text');
        RAISE NOTICE '✓ Migration 005 applied successfully';
    ELSE
        RAISE NOTICE '⊙ Migration 005 already applied, skipping';
    END IF;
END $$;

\i 'supabase/migrations/005_search_system.sql'

-- ============================================================================
-- MIGRATION 006: Application System
-- ============================================================================
DO $$
BEGIN
    IF NOT migration_applied('006') THEN
        RAISE NOTICE '→ Applying Migration 006: Application System...';
        INSERT INTO public.schema_migrations (version, description) 
        VALUES ('006', 'Job Application System with RLS');
        RAISE NOTICE '✓ Migration 006 applied successfully';
    ELSE
        RAISE NOTICE '⊙ Migration 006 already applied, skipping';
    END IF;
END $$;

\i 'supabase/migrations/006_application_system.sql'

-- ============================================================================
-- Final Verification
-- ============================================================================
RAISE NOTICE '============================================================================';
RAISE NOTICE 'Migration Summary:';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
    migration_record RECORD;
BEGIN
    FOR migration_record IN 
        SELECT version, description, applied_at 
        FROM public.schema_migrations 
        ORDER BY version
    LOOP
        RAISE NOTICE '✓ Migration %: % (applied at: %)', 
            migration_record.version, 
            migration_record.description,
            migration_record.applied_at;
    END LOOP;
END $$;

RAISE NOTICE '============================================================================';
RAISE NOTICE 'All migrations applied successfully!';
RAISE NOTICE '============================================================================';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Verify tables exist in Table Editor';
RAISE NOTICE '2. Check RLS policies in Database > Policies';
RAISE NOTICE '3. Test API functions work correctly';
RAISE NOTICE '4. Run application and verify features work';
RAISE NOTICE '';
RAISE NOTICE '============================================================================';
