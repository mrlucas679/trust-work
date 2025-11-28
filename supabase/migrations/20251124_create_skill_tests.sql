-- Skill Tests System Migration
-- Created: November 24, 2025
-- Purpose: Add skill test functionality for job/gig application screening

-- ============================================================
-- 1. CREATE NEW TABLES
-- ============================================================

-- skill_test_templates: Pre-made test categories
CREATE TABLE IF NOT EXISTS public.skill_test_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'briefcase',
  total_questions INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON public.skill_test_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.skill_test_templates(is_active) WHERE is_active = true;

-- skill_test_questions: AI-generated questions (50 per template)
CREATE TABLE IF NOT EXISTS public.skill_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.skill_test_templates(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('entry', 'mid', 'senior')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_template ON public.skill_test_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.skill_test_questions(template_id, difficulty);

-- skill_test_attempts: Track every test attempt
CREATE TABLE IF NOT EXISTS public.skill_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.skill_test_templates(id) ON DELETE CASCADE,
  gig_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('entry', 'mid', 'senior')),
  questions_data JSONB NOT NULL,
  answers_data JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_taken_seconds INTEGER,
  tab_switches INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed_cheat', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_gig_or_job CHECK (
    (gig_id IS NOT NULL AND job_id IS NULL) OR 
    (gig_id IS NULL AND job_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_attempts_applicant ON public.skill_test_attempts(applicant_id);
CREATE INDEX IF NOT EXISTS idx_attempts_gig ON public.skill_test_attempts(gig_id) WHERE gig_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attempts_job ON public.skill_test_attempts(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attempts_template ON public.skill_test_attempts(template_id);

-- Note: We can't use partial unique indexes with NOW() since it's not IMMUTABLE
-- Instead, we'll enforce the 7-day cooldown via the can_attempt_skill_test function
-- and application logic

-- ============================================================
-- 2. MODIFY EXISTING TABLES
-- ============================================================

-- Add skill test fields to assignments table (gigs)
ALTER TABLE public.assignments 
  ADD COLUMN IF NOT EXISTS requires_skill_test BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS skill_test_template_id UUID REFERENCES public.skill_test_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS skill_test_difficulty TEXT CHECK (skill_test_difficulty IN ('entry', 'mid', 'senior')),
  ADD COLUMN IF NOT EXISTS skill_test_passing_score INTEGER DEFAULT 70 CHECK (skill_test_passing_score >= 0 AND skill_test_passing_score <= 100);

CREATE INDEX IF NOT EXISTS idx_assignments_requires_test ON public.assignments(requires_skill_test) WHERE requires_skill_test = true;

-- Add skill test attempt reference to applications table
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS skill_test_attempt_id UUID REFERENCES public.skill_test_attempts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_applications_test ON public.applications(skill_test_attempt_id) WHERE skill_test_attempt_id IS NOT NULL;

-- ============================================================
-- 3. CREATE FUNCTIONS
-- ============================================================

-- Function: Get random questions for test
CREATE OR REPLACE FUNCTION get_random_test_questions(
  p_template_id UUID,
  p_difficulty TEXT,
  p_count INTEGER
)
RETURNS SETOF skill_test_questions
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.skill_test_questions
  WHERE template_id = p_template_id
    AND difficulty = p_difficulty
  ORDER BY RANDOM()
  LIMIT p_count;
$$;

-- Function: Check if user can attempt test (7-day cooldown)
CREATE OR REPLACE FUNCTION can_attempt_skill_test(
  p_applicant_id UUID,
  p_gig_id UUID DEFAULT NULL,
  p_job_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  last_attempt_date TIMESTAMPTZ;
BEGIN
  -- Check for recent attempt
  SELECT created_at INTO last_attempt_date
  FROM public.skill_test_attempts
  WHERE applicant_id = p_applicant_id
    AND status = 'completed'
    AND (
      (p_gig_id IS NOT NULL AND gig_id = p_gig_id) OR
      (p_job_id IS NOT NULL AND job_id = p_job_id)
    )
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no attempt found, can attempt
  IF last_attempt_date IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if 7 days have passed
  RETURN (NOW() - last_attempt_date) >= INTERVAL '7 days';
END;
$$;

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE public.skill_test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_test_attempts ENABLE ROW LEVEL SECURITY;

-- Templates: Everyone can view active templates
DROP POLICY IF EXISTS "Public read active templates" ON public.skill_test_templates;
CREATE POLICY "Public read active templates" ON public.skill_test_templates
  FOR SELECT USING (is_active = true);

-- Questions: Users view questions during active test
DROP POLICY IF EXISTS "Users view questions during test" ON public.skill_test_questions;
CREATE POLICY "Users view questions during test" ON public.skill_test_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.skill_test_attempts
      WHERE skill_test_attempts.template_id = skill_test_questions.template_id
        AND skill_test_attempts.applicant_id = auth.uid()
        AND skill_test_attempts.status IN ('in_progress', 'completed')
        AND skill_test_attempts.created_at > NOW() - INTERVAL '7 days'
    )
  );

-- Attempts: Users manage own attempts
DROP POLICY IF EXISTS "Users manage own attempts" ON public.skill_test_attempts;
CREATE POLICY "Users manage own attempts" ON public.skill_test_attempts
  FOR ALL USING (applicant_id = auth.uid());

-- Attempts: Employers view attempts for their postings
DROP POLICY IF EXISTS "Employers view attempts for their postings" ON public.skill_test_attempts;
CREATE POLICY "Employers view attempts for their postings" ON public.skill_test_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignments
      WHERE (
        (skill_test_attempts.gig_id = assignments.id) OR
        (skill_test_attempts.job_id = assignments.id)
      )
      AND assignments.client_id = auth.uid()
    )
  );

-- ============================================================
-- 5. TRIGGER FOR UPDATED_AT
-- ============================================================

-- Reuse existing set_updated_at function
DROP TRIGGER IF EXISTS set_skill_test_templates_updated_at ON public.skill_test_templates;
CREATE TRIGGER set_skill_test_templates_updated_at
BEFORE UPDATE ON public.skill_test_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_skill_test_questions_updated_at ON public.skill_test_questions;
CREATE TRIGGER set_skill_test_questions_updated_at
BEFORE UPDATE ON public.skill_test_questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 6. SAMPLE DATA (25 Templates)
-- ============================================================

INSERT INTO public.skill_test_templates (name, category, description, icon) VALUES
  ('SEO Specialist', 'Digital Marketing', 'Test knowledge of search engine optimization, keyword research, and on-page/off-page SEO techniques', 'search'),
  ('Social Media Marketing', 'Digital Marketing', 'Assess skills in social media strategy, content creation, and platform-specific marketing', 'share-2'),
  ('Email Marketing', 'Digital Marketing', 'Evaluate expertise in email campaigns, automation, segmentation, and deliverability', 'mail'),
  ('PPC Advertising', 'Digital Marketing', 'Test proficiency in paid advertising, Google Ads, Facebook Ads, and campaign optimization', 'target'),
  
  ('Frontend Development', 'Web Development', 'Assess React, HTML, CSS, JavaScript skills and modern frontend frameworks', 'code'),
  ('Backend Development', 'Web Development', 'Test Node.js, Python, databases, API design, and server-side programming', 'database'),
  ('WordPress Development', 'Web Development', 'Evaluate WordPress theme/plugin development, PHP, and CMS customization', 'layout'),
  ('Shopify Development', 'Web Development', 'Test Shopify theme development, Liquid templating, and e-commerce integration', 'shopping-cart'),
  
  ('Logo & Branding', 'Graphic Design', 'Assess logo design, brand identity, color theory, and visual branding skills', 'palette'),
  ('UI/UX Design', 'Graphic Design', 'Test user interface design, user experience principles, and design tools proficiency', 'figma'),
  ('Print Design', 'Graphic Design', 'Evaluate print layout, typography, Adobe InDesign, and production knowledge', 'printer'),
  
  ('Blog Writing', 'Content Writing', 'Test content writing, SEO writing, research skills, and engaging blog creation', 'file-text'),
  ('Copywriting', 'Content Writing', 'Assess persuasive writing, sales copy, ad copy, and conversion-focused content', 'pen-tool'),
  ('Technical Writing', 'Content Writing', 'Evaluate technical documentation, API docs, user manuals, and clear explanations', 'book-open'),
  
  ('Video Production', 'Video Editing', 'Test video editing, Adobe Premiere/Final Cut Pro, storytelling, and production skills', 'video'),
  ('Motion Graphics', 'Video Editing', 'Assess After Effects, animation, motion design, and visual effects knowledge', 'film'),
  
  ('Community Management', 'Social Media Management', 'Test community engagement, moderation, brand voice, and audience building', 'users'),
  ('Social Media Analytics', 'Social Media Management', 'Evaluate analytics tools, metrics interpretation, and data-driven strategy', 'bar-chart'),
  
  ('Data Entry Specialist', 'Data Entry', 'Assess accuracy, speed, data validation, spreadsheet skills, and attention to detail', 'table'),
  
  ('Administrative Assistant', 'Virtual Assistant', 'Test email management, scheduling, organization, and general admin skills', 'clipboard'),
  ('Executive Assistant', 'Virtual Assistant', 'Evaluate executive support, calendar management, travel coordination, and professionalism', 'briefcase'),
  
  ('Customer Support', 'Customer Service', 'Test customer service skills, problem resolution, communication, and empathy', 'headphones'),
  ('Live Chat Support', 'Customer Service', 'Assess live chat etiquette, multitasking, typing speed, and real-time support', 'message-circle'),
  
  ('Project Management', 'Business', 'Evaluate project planning, Agile/Scrum, risk management, and team coordination', 'trello'),
  ('Business Analysis', 'Business', 'Test requirements gathering, data analysis, process improvement, and stakeholder management', 'trending-up')
ON CONFLICT DO NOTHING;

-- Migration complete
COMMENT ON TABLE public.skill_test_templates IS 'Pre-defined test categories that employers can assign to job/gig postings';
COMMENT ON TABLE public.skill_test_questions IS 'AI-generated questions for skill tests (50 per template: 20 entry, 20 mid, 10 senior)';
COMMENT ON TABLE public.skill_test_attempts IS 'Tracks all skill test attempts with scores and anti-cheat data';
