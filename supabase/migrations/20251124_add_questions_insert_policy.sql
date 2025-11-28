-- Add INSERT policy for skill_test_questions table
-- This allows inserting questions (for seeding/generation scripts)

DROP POLICY IF EXISTS "Allow questions insert" ON public.skill_test_questions;
CREATE POLICY "Allow questions insert" ON public.skill_test_questions
  FOR INSERT 
  WITH CHECK (true);
