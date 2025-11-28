/**
 * Skill Tests React Query Hooks
 * 
 * Custom hooks for data fetching, caching, and mutations
 * Uses TanStack Query (React Query) for server state management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSkillTestTemplates,
  getSkillTestTemplate,
  canAttemptSkillTest,
  startSkillTest,
  submitSkillTest,
  getSkillTestReview,
  getGigSkillTestAttempts,
  getJobSkillTestAttempts
} from '@/lib/api/skill-tests';
import type {
  SkillTestCategory,
  StartSkillTestRequest,
  SubmitSkillTestRequest
} from '@/types/skill-tests';

// ============================================================
// QUERY KEYS
// ============================================================

export const skillTestKeys = {
  all: ['skillTests'] as const,
  templates: () => [...skillTestKeys.all, 'templates'] as const,
  template: (id: string) => [...skillTestKeys.templates(), id] as const,
  templatesByCategory: (category?: SkillTestCategory) => 
    [...skillTestKeys.templates(), { category }] as const,
  eligibility: (gigId?: string, jobId?: string) => 
    [...skillTestKeys.all, 'eligibility', { gigId, jobId }] as const,
  review: (attemptId: string) => 
    [...skillTestKeys.all, 'review', attemptId] as const,
  gigAttempts: (gigId: string) => 
    [...skillTestKeys.all, 'gigAttempts', gigId] as const,
  jobAttempts: (jobId: string) => 
    [...skillTestKeys.all, 'jobAttempts', jobId] as const,
};

// ============================================================
// TEMPLATES QUERIES
// ============================================================

/**
 * Fetch all skill test templates (with optional category filter)
 */
export function useSkillTestTemplates(category?: SkillTestCategory) {
  return useQuery({
    queryKey: skillTestKeys.templatesByCategory(category),
    queryFn: () => getSkillTestTemplates(category),
    staleTime: 1000 * 60 * 60, // 1 hour (templates rarely change)
  });
}

/**
 * Fetch a single skill test template by ID
 */
export function useSkillTestTemplate(templateId: string) {
  return useQuery({
    queryKey: skillTestKeys.template(templateId),
    queryFn: () => getSkillTestTemplate(templateId),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!templateId,
  });
}

// ============================================================
// ELIGIBILITY QUERIES
// ============================================================

/**
 * Check if user can attempt a skill test (7-day cooldown)
 */
export function useCanAttemptTest({
  gigId,
  jobId,
  enabled = true
}: {
  gigId?: string;
  jobId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: skillTestKeys.eligibility(gigId, jobId),
    queryFn: () => canAttemptSkillTest(gigId, jobId),
    enabled: enabled && (!!gigId || !!jobId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry failed eligibility checks
  });
}

// ============================================================
// TEST LIFECYCLE MUTATIONS
// ============================================================

/**
 * Start a new skill test attempt
 */
export function useStartSkillTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartSkillTestRequest) => startSkillTest(request),
    onSuccess: (data, variables) => {
      // Invalidate eligibility cache for this gig/job
      queryClient.invalidateQueries({
        queryKey: skillTestKeys.eligibility(variables.gigId, variables.jobId),
      });
    },
  });
}

/**
 * Submit skill test answers and get results
 */
export function useSubmitSkillTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmitSkillTestRequest) => submitSkillTest(request),
    onSuccess: (_data, variables) => {
      // Invalidate eligibility cache (test completed, cooldown starts)
      queryClient.invalidateQueries({
        queryKey: skillTestKeys.eligibility(),
      });
      
      // Invalidate gig/job attempts lists (if employer views)
      queryClient.invalidateQueries({
        queryKey: skillTestKeys.gigAttempts,
      });
      queryClient.invalidateQueries({
        queryKey: skillTestKeys.jobAttempts,
      });
    },
  });
}

// ============================================================
// REVIEW QUERIES
// ============================================================

/**
 * Get test review (questions + user answers + explanations)
 */
export function useSkillTestReview(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: skillTestKeys.review(attemptId),
    queryFn: () => getSkillTestReview(attemptId),
    enabled: enabled && !!attemptId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (reviews don't change)
  });
}

// ============================================================
// EMPLOYER VIEWS
// ============================================================

/**
 * Get all test attempts for a gig (employer view)
 */
export function useGigSkillTestAttempts(gigId: string, enabled = true) {
  return useQuery({
    queryKey: skillTestKeys.gigAttempts(gigId),
    queryFn: () => getGigSkillTestAttempts(gigId),
    enabled: enabled && !!gigId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get all test attempts for a job (employer view)
 */
export function useJobSkillTestAttempts(jobId: string, enabled = true) {
  return useQuery({
    queryKey: skillTestKeys.jobAttempts(jobId),
    queryFn: () => getJobSkillTestAttempts(jobId),
    enabled: enabled && !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================================
// UTILITY HOOKS
// ============================================================

/**
 * Prefetch templates (useful for pre-loading on page load)
 */
export function usePrefetchSkillTestTemplates() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: skillTestKeys.templates(),
      queryFn: () => getSkillTestTemplates(),
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  };
}

/**
 * Invalidate all skill test queries (useful after major changes)
 */
export function useInvalidateSkillTests() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: skillTestKeys.all,
    });
  };
}
