-- Migration: Applications Improvements
-- Description: Add performance indexes and analytics tracking columns
-- Date: 2025-01-21

-- Add performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_applications_freelancer_id 
ON public.applications(freelancer_id);

CREATE INDEX IF NOT EXISTS idx_applications_assignment_id 
ON public.applications(assignment_id);

CREATE INDEX IF NOT EXISTS idx_applications_status 
ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_applications_created_at 
ON public.applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_freelancer_status 
ON public.applications(freelancer_id, status);

-- Composite index for common query pattern (freelancer + status + date)
CREATE INDEX IF NOT EXISTS idx_applications_freelancer_status_created 
ON public.applications(freelancer_id, status, created_at DESC);

-- Add application analytics tracking columns
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS viewed_by_client boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS client_viewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS response_time_hours numeric,
ADD COLUMN IF NOT EXISTS is_shortlisted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS shortlisted_at timestamp with time zone;

-- Add application source tracking (for future analytics)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'web'::text 
CHECK (source = ANY (ARRAY['web'::text, 'mobile'::text, 'email'::text, 'referral'::text]));

-- Add comment for documentation
COMMENT ON COLUMN public.applications.viewed_by_client IS 'Tracks if the client has viewed this application';
COMMENT ON COLUMN public.applications.client_viewed_at IS 'Timestamp when client first viewed the application';
COMMENT ON COLUMN public.applications.response_time_hours IS 'Hours between application submission and client response';
COMMENT ON COLUMN public.applications.is_shortlisted IS 'Whether the application has been shortlisted by the client';
COMMENT ON COLUMN public.applications.shortlisted_at IS 'Timestamp when application was shortlisted';
COMMENT ON COLUMN public.applications.source IS 'Source of the application (web, mobile, email, referral)';

-- Create a function to automatically calculate response time
CREATE OR REPLACE FUNCTION calculate_application_response_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('accepted', 'rejected') AND OLD.status = 'pending' THEN
    NEW.response_time_hours := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate response time
DROP TRIGGER IF EXISTS trg_calculate_response_time ON public.applications;
CREATE TRIGGER trg_calculate_response_time
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION calculate_application_response_time();

-- Grant necessary permissions (adjust as needed for your RLS policies)
-- These are examples - adjust based on your existing security setup
GRANT SELECT ON public.applications TO authenticated;
GRANT INSERT ON public.applications TO authenticated;
GRANT UPDATE ON public.applications TO authenticated;
