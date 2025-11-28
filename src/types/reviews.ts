/**
 * Reviews System Types
 * Phase 10: Post-Employment Reviews
 */

export type ReviewerType = 'employer' | 'employee';
export type ModerationStatus = 'approved' | 'under_review' | 'edited' | 'removed';

export interface EmployeeReviewRatings {
  work_environment_rating: number; // 1-5
  management_rating: number; // 1-5
  compensation_rating: number; // 1-5
  career_growth_rating: number; // 1-5
}

export interface EmployerReviewRatings {
  technical_skills_rating: number; // 1-5
  communication_rating: number; // 1-5
  work_quality_rating: number; // 1-5
  professionalism_rating: number; // 1-5
}

export interface Review {
  id: string;
  
  // Review metadata
  application_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_type: ReviewerType;
  
  // Employment context
  position_title: string;
  employment_duration_months: number;
  employment_start_date?: string;
  employment_end_date?: string;
  
  // Ratings (conditional based on reviewer_type)
  work_environment_rating?: number;
  management_rating?: number;
  compensation_rating?: number;
  career_growth_rating?: number;
  technical_skills_rating?: number;
  communication_rating?: number;
  work_quality_rating?: number;
  professionalism_rating?: number;
  
  // Overall
  overall_rating: number; // Calculated average
  review_text: string; // 100-500 characters
  would_recommend: boolean;
  
  // Moderation
  is_flagged: boolean;
  flag_reason?: string;
  flagged_by?: string;
  flagged_at?: string;
  moderation_status: ModerationStatus;
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
  
  // Review window
  review_window_start: string;
  review_window_end: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ReviewWithProfiles extends Review {
  reviewer_profile: {
    id: string;
    full_name?: string;
    display_name?: string;
    email?: string;
    avatar_url?: string;
    business_name?: string;
  };
  reviewee_profile: {
    id: string;
    full_name?: string;
    display_name?: string;
    email?: string;
    avatar_url?: string;
    business_name?: string;
  };
  helpful_count: number;
}

export interface CreateEmployeeReviewInput {
  application_id: string;
  reviewee_id: string; // Employer ID
  position_title: string;
  employment_duration_months: number;
  employment_start_date?: string;
  employment_end_date?: string;
  
  // Employee rating categories
  work_environment_rating: number;
  management_rating: number;
  compensation_rating: number;
  career_growth_rating: number;
  
  // Common fields
  review_text: string;
  would_recommend: boolean;
  review_window_start: string;
  review_window_end: string;
}

export interface CreateEmployerReviewInput {
  application_id: string;
  reviewee_id: string; // Employee ID
  position_title: string;
  employment_duration_months: number;
  employment_start_date?: string;
  employment_end_date?: string;
  
  // Employer rating categories
  technical_skills_rating: number;
  communication_rating: number;
  work_quality_rating: number;
  professionalism_rating: number;
  
  // Common fields
  review_text: string;
  would_recommend: boolean;
  review_window_start: string;
  review_window_end: string;
}

export type CreateReviewInput = CreateEmployeeReviewInput | CreateEmployerReviewInput;

export interface UpdateReviewInput {
  review_text?: string;
  would_recommend?: boolean;
  // Ratings can be updated (within review window)
  work_environment_rating?: number;
  management_rating?: number;
  compensation_rating?: number;
  career_growth_rating?: number;
  technical_skills_rating?: number;
  communication_rating?: number;
  work_quality_rating?: number;
  professionalism_rating?: number;
}

export interface FlagReviewInput {
  flag_reason: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  as_employee_rating: number;
  as_employee_count: number;
  as_employer_rating: number;
  as_employer_count: number;
}

export interface ReviewFilters {
  reviewee_id?: string;
  reviewer_id?: string;
  reviewer_type?: ReviewerType;
  min_rating?: number;
  max_rating?: number;
  is_flagged?: boolean;
  moderation_status?: ModerationStatus;
  limit?: number;
  offset?: number;
}

export interface CanReviewResult {
  can_review: boolean;
  reason?: string;
  review_window_end?: string;
}

// Validation helpers
export const REVIEW_TEXT_MIN_LENGTH = 100;
export const REVIEW_TEXT_MAX_LENGTH = 500;
export const REVIEW_WINDOW_DAYS = 30;
export const MIN_EMPLOYMENT_DURATION_MONTHS = 1;

export function isEmployeeReview(review: Review): review is Review & EmployeeReviewRatings {
  return review.reviewer_type === 'employee';
}

export function isEmployerReview(review: Review): review is Review & EmployerReviewRatings {
  return review.reviewer_type === 'employer';
}

export function calculateAverageRating(ratings: number[]): number {
  const validRatings = ratings.filter(r => r >= 1 && r <= 5);
  if (validRatings.length === 0) return 0;
  const sum = validRatings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / validRatings.length) * 10) / 10;
}

export function getReviewWindowDates(employmentEndDate: Date): {
  start: string;
  end: string;
} {
  const start = new Date(employmentEndDate);
  start.setDate(start.getDate() + 7); // Start 1 week after employment ends
  
  const end = new Date(start);
  end.setDate(end.getDate() + REVIEW_WINDOW_DAYS);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

export function isWithinReviewWindow(reviewWindowEnd: string): boolean {
  const now = new Date();
  const end = new Date(reviewWindowEnd);
  return now <= end;
}

export function validateReviewText(text: string): string | null {
  if (!text || text.trim().length < REVIEW_TEXT_MIN_LENGTH) {
    return `Review must be at least ${REVIEW_TEXT_MIN_LENGTH} characters`;
  }
  if (text.length > REVIEW_TEXT_MAX_LENGTH) {
    return `Review must be no more than ${REVIEW_TEXT_MAX_LENGTH} characters`;
  }
  return null;
}

export function validateRating(rating: number): string | null {
  if (rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }
  return null;
}
