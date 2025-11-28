/**
 * @fileoverview AI Matching Algorithm Service
 * Matches job seekers with assignments based on skills, experience, and preferences
 */

import { supabase } from '@/lib/supabaseClient';
import type { Assignment } from './assignments.service';

export interface MatchScore {
  assignmentId: string;
  assignment: Assignment;
  score: number;
  breakdown: {
    skillMatch: number;
    experienceMatch: number;
    locationMatch: number;
    budgetMatch: number;
    availabilityMatch: number;
  };
  reasons: string[];
}

export interface MatchPreferences {
  minBudget?: number;
  maxBudget?: number;
  preferredLocations?: string[];
  remoteOnly?: boolean;
  jobTypes?: string[];
  experienceLevels?: string[];
}

/**
 * Calculate skill match score (0-100)
 */
function calculateSkillMatch(userSkills: string[], requiredSkills: string[]): number {
  if (!requiredSkills.length) return 50; // Neutral if no requirements

  const matchedSkills = userSkills.filter(skill =>
    requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()) || 
                               skill.toLowerCase().includes(req.toLowerCase()))
  );

  const matchPercentage = (matchedSkills.length / requiredSkills.length) * 100;
  return Math.min(100, matchPercentage);
}

/**
 * Calculate experience match score (0-100)
 */
function calculateExperienceMatch(userLevel: string, requiredLevel: string): number {
  if (requiredLevel === 'any') return 100;

  const levels = { 'entry': 1, 'intermediate': 2, 'expert': 3 };
  const userLevelNum = levels[userLevel.toLowerCase() as keyof typeof levels] || 1;
  const requiredLevelNum = levels[requiredLevel.toLowerCase() as keyof typeof levels] || 1;

  if (userLevelNum >= requiredLevelNum) return 100;
  if (userLevelNum === requiredLevelNum - 1) return 70;
  return 30;
}

/**
 * Calculate location match score (0-100)
 */
function calculateLocationMatch(
  userLocation: string | null,
  assignmentLocation: string | null,
  remoteAllowed: boolean,
  preferredLocations?: string[]
): number {
  if (remoteAllowed) return 100;
  if (!assignmentLocation) return 50;
  if (!userLocation) return 30;

  // Exact match
  if (userLocation.toLowerCase() === assignmentLocation.toLowerCase()) return 100;

  // Partial match (city/state)
  if (userLocation.toLowerCase().includes(assignmentLocation.toLowerCase()) ||
      assignmentLocation.toLowerCase().includes(userLocation.toLowerCase())) {
    return 80;
  }

  // Check preferred locations
  if (preferredLocations?.some(loc => 
    assignmentLocation.toLowerCase().includes(loc.toLowerCase())
  )) {
    return 60;
  }

  return 20;
}

/**
 * Calculate budget match score (0-100)
 */
function calculateBudgetMatch(
  userExpectation: number | null,
  assignmentMin: number | null,
  assignmentMax: number | null
): number {
  if (!userExpectation) return 50;
  if (!assignmentMin && !assignmentMax) return 50;

  const budgetMid = assignmentMax 
    ? (assignmentMin || 0 + assignmentMax) / 2
    : assignmentMin || 0;

  const difference = Math.abs(userExpectation - budgetMid);
  const percentDiff = (difference / userExpectation) * 100;

  if (percentDiff < 10) return 100;
  if (percentDiff < 25) return 80;
  if (percentDiff < 50) return 60;
  return 30;
}

/**
 * Calculate availability match score (0-100)
 */
function calculateAvailabilityMatch(userAvailability: string | null, assignmentDeadline: string | null): number {
  if (!assignmentDeadline) return 100;
  if (!userAvailability) return 50;

  const now = new Date();
  const deadline = new Date(assignmentDeadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (userAvailability === 'immediate' && daysUntilDeadline > 0) return 100;
  if (userAvailability === 'within_week' && daysUntilDeadline > 7) return 90;
  if (userAvailability === 'within_month' && daysUntilDeadline > 30) return 80;
  
  return 60;
}

/**
 * Get matching assignments for current user
 */
export async function getMatchingAssignments(
  preferences?: MatchPreferences,
  limit: number = 20
): Promise<MatchScore[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;

  // Get open assignments
  let query = supabase
    .from('assignments')
    .select('*, profiles!assignments_client_id_fkey(display_name, business_verified, verification_badge_level)')
    .eq('status', 'open');

  // Apply preference filters
  if (preferences?.minBudget) {
    query = query.gte('budget_min', preferences.minBudget);
  }
  if (preferences?.maxBudget) {
    query = query.lte('budget_max', preferences.maxBudget);
  }
  if (preferences?.remoteOnly) {
    query = query.eq('remote_allowed', true);
  }
  if (preferences?.jobTypes && preferences.jobTypes.length > 0) {
    query = query.in('job_type', preferences.jobTypes);
  }
  if (preferences?.experienceLevels && preferences.experienceLevels.length > 0) {
    query = query.in('experience_level', preferences.experienceLevels);
  }

  const { data: assignments, error: assignmentsError } = await query;
  if (assignmentsError) throw assignmentsError;

  // Calculate match scores
  const matches: MatchScore[] = assignments.map(assignment => {
    const skillMatch = calculateSkillMatch(
      profile.skills || [],
      assignment.required_skills || []
    );

    const experienceMatch = calculateExperienceMatch(
      profile.experience_level || 'entry',
      assignment.experience_level || 'any'
    );

    const locationMatch = calculateLocationMatch(
      profile.location,
      assignment.location,
      assignment.remote_allowed || false,
      preferences?.preferredLocations
    );

    const budgetMatch = calculateBudgetMatch(
      profile.salary_expectation ? parseFloat(profile.salary_expectation) : null,
      assignment.budget_min,
      assignment.budget_max
    );

    const availabilityMatch = calculateAvailabilityMatch(
      profile.availability,
      assignment.deadline
    );

    // Weighted average (skills are most important)
    const score = (
      skillMatch * 0.4 +
      experienceMatch * 0.25 +
      locationMatch * 0.15 +
      budgetMatch * 0.1 +
      availabilityMatch * 0.1
    );

    const reasons: string[] = [];
    if (skillMatch > 70) reasons.push('Strong skill match');
    if (experienceMatch === 100) reasons.push('Experience level matches perfectly');
    if (locationMatch === 100) reasons.push('Perfect location match or remote work');
    if (budgetMatch > 80) reasons.push('Budget aligns with your expectations');

    return {
      assignmentId: assignment.id,
      assignment,
      score: Math.round(score),
      breakdown: {
        skillMatch: Math.round(skillMatch),
        experienceMatch: Math.round(experienceMatch),
        locationMatch: Math.round(locationMatch),
        budgetMatch: Math.round(budgetMatch),
        availabilityMatch: Math.round(availabilityMatch),
      },
      reasons,
    };
  });

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get matching candidates for an assignment (employer view)
 */
export async function getMatchingCandidates(assignmentId: string, limit: number = 20): Promise<any[]> {
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (assignmentError) throw assignmentError;

  // Get job seekers
  const query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'job_seeker');

  const { data: candidates, error: candidatesError } = await query;
  if (candidatesError) throw candidatesError;

  // Calculate match scores
  const matches = candidates.map(candidate => {
    const skillMatch = calculateSkillMatch(
      candidate.skills || [],
      assignment.required_skills || []
    );

    const experienceMatch = calculateExperienceMatch(
      candidate.experience_level || 'entry',
      assignment.experience_level || 'any'
    );

    const locationMatch = calculateLocationMatch(
      candidate.location,
      assignment.location,
      assignment.remote_allowed || false
    );

    const score = (
      skillMatch * 0.5 +
      experienceMatch * 0.3 +
      locationMatch * 0.2
    );

    return {
      candidate,
      score: Math.round(score),
      skillMatch: Math.round(skillMatch),
      experienceMatch: Math.round(experienceMatch),
      locationMatch: Math.round(locationMatch),
    };
  });

  return matches
    .filter(m => m.score > 50) // Only show reasonable matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Save match preferences
 */
export async function saveMatchPreferences(preferences: MatchPreferences): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Store in user's profile or separate preferences table
  const { error } = await supabase
    .from('profiles')
    .update({
      // Store as JSON or individual columns
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;
}
