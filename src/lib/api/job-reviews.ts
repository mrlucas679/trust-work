/**
 * Job Employment Reviews API
 * Phase 10: Post-Employment Reviews for Jobs (not gigs)
 */

import { supabase } from '../supabaseClient';
import type {
  Review,
  ReviewWithProfiles,
  CreateEmployeeReviewInput,
  CreateEmployerReviewInput,
  UpdateReviewInput,
  FlagReviewInput,
  ReviewStats,
  ReviewFilters,
  CanReviewResult,
  ReviewerType
} from '@/types/reviews';
import {
  validateReviewText,
  validateRating,
  isWithinReviewWindow
} from '@/types/reviews';

/**
 * Create a job employment review (employee reviewing employer OR employer reviewing employee)
 */
export async function createJobReview(
  input: CreateEmployeeReviewInput | CreateEmployerReviewInput,
  reviewerType: ReviewerType
): Promise<Review> {
  // Validate review text
  const textError = validateReviewText(input.review_text);
  if (textError) {
    throw new Error(textError);
  }

  // Validate ratings based on reviewer type
  if (reviewerType === 'employee') {
    const employeeInput = input as CreateEmployeeReviewInput;
    const ratingErrors = [
      validateRating(employeeInput.work_environment_rating),
      validateRating(employeeInput.management_rating),
      validateRating(employeeInput.compensation_rating),
      validateRating(employeeInput.career_growth_rating)
    ].filter(Boolean);
    
    if (ratingErrors.length > 0) {
      throw new Error(ratingErrors[0]!);
    }
  } else {
    const employerInput = input as CreateEmployerReviewInput;
    const ratingErrors = [
      validateRating(employerInput.technical_skills_rating),
      validateRating(employerInput.communication_rating),
      validateRating(employerInput.work_quality_rating),
      validateRating(employerInput.professionalism_rating)
    ].filter(Boolean);
    
    if (ratingErrors.length > 0) {
      throw new Error(ratingErrors[0]!);
    }
  }

  // Check if within review window
  if (!isWithinReviewWindow(input.review_window_end)) {
    throw new Error('Review window has closed. Reviews must be submitted within 30 days of employment end.');
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to submit a review');
  }

  // Create review record
  const reviewData: any = {
    ...input,
    reviewer_id: user.id,
    reviewer_type: reviewerType
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();

  if (error) {
    console.error('Error creating job review:', error);
    throw new Error(error.message || 'Failed to create review');
  }

  return data;
}

/**
 * Get job employment reviews for a specific user (as reviewee)
 */
export async function getUserJobReviews(
  userId: string,
  filters?: ReviewFilters
): Promise<ReviewWithProfiles[]> {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      reviewer_profile:reviewer_id(id, full_name, avatar_url, business_name),
      reviewee_profile:reviewee_id(id, full_name, avatar_url, business_name)
    `)
    .eq('reviewee_id', userId)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.reviewer_type) {
    query = query.eq('reviewer_type', filters.reviewer_type);
  }
  if (filters?.min_rating) {
    query = query.gte('overall_rating', filters.min_rating);
  }
  if (filters?.max_rating) {
    query = query.lte('overall_rating', filters.max_rating);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user job reviews:', error);
    throw new Error('Failed to fetch reviews');
  }

  return data || [];
}

/**
 * Get job reviews written by a specific user
 */
export async function getJobReviewsByReviewer(
  reviewerId: string,
  limit = 10
): Promise<ReviewWithProfiles[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer_profile:reviewer_id(id, full_name, avatar_url, business_name),
      reviewee_profile:reviewee_id(id, full_name, avatar_url, business_name)
    `)
    .eq('reviewer_id', reviewerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reviewer job reviews:', error);
    throw new Error('Failed to fetch reviews');
  }

  return data || [];
}

/**
 * Get a single job review by ID
 */
export async function getJobReview(reviewId: string): Promise<ReviewWithProfiles | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer_profile:reviewer_id(id, full_name, avatar_url, business_name),
      reviewee_profile:reviewee_id(id, full_name, avatar_url, business_name)
    `)
    .eq('id', reviewId)
    .single();

  if (error) {
    console.error('Error fetching job review:', error);
    return null;
  }

  return data;
}

/**
 * Update a job review (only within review window)
 */
export async function updateJobReview(
  reviewId: string,
  updates: UpdateReviewInput
): Promise<Review> {
  // Validate review text if provided
  if (updates.review_text) {
    const textError = validateReviewText(updates.review_text);
    if (textError) {
      throw new Error(textError);
    }
  }

  // Validate any rating updates
  const ratingFields = [
    'work_environment_rating',
    'management_rating',
    'compensation_rating',
    'career_growth_rating',
    'technical_skills_rating',
    'communication_rating',
    'work_quality_rating',
    'professionalism_rating'
  ];

  for (const field of ratingFields) {
    if (updates[field as keyof UpdateReviewInput] !== undefined) {
      const ratingError = validateRating(updates[field as keyof UpdateReviewInput] as number);
      if (ratingError) {
        throw new Error(ratingError);
      }
    }
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job review:', error);
    throw new Error(error.message || 'Failed to update review');
  }

  return data;
}

/**
 * Flag a job review as inappropriate
 */
export async function flagJobReview(
  reviewId: string,
  input: FlagReviewInput
): Promise<Review> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to flag a review');
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({
      is_flagged: true,
      flag_reason: input.flag_reason,
      flagged_by: user.id,
      flagged_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error flagging job review:', error);
    throw new Error('Failed to flag review');
  }

  return data;
}

/**
 * Get job review statistics for a user
 */
export async function getUserJobReviewStats(userId: string): Promise<ReviewStats> {
  const { data, error } = await supabase
    .rpc('get_user_average_rating', { p_user_id: userId });

  if (error) {
    console.error('Error fetching job review stats:', error);
    return {
      average_rating: 0,
      total_reviews: 0,
      as_employee_rating: 0,
      as_employee_count: 0,
      as_employer_rating: 0,
      as_employer_count: 0
    };
  }

  return data[0] || {
    average_rating: 0,
    total_reviews: 0,
    as_employee_rating: 0,
    as_employee_count: 0,
    as_employer_rating: 0,
    as_employer_count: 0
  };
}

/**
 * Check if user can submit a review for a job application
 */
export async function canSubmitJobReview(
  applicationId: string
): Promise<CanReviewResult> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      can_review: false,
      reason: 'You must be logged in'
    };
  }

  // Check if application exists and user is part of it
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, employer_id, freelancer_id, status')
    .eq('id', applicationId)
    .single();

  if (appError || !application) {
    return {
      can_review: false,
      reason: 'Application not found'
    };
  }

  // Check if user is employer or employee
  const isEmployer = application.employer_id === user.id;
  const isEmployee = application.freelancer_id === user.id;

  if (!isEmployer && !isEmployee) {
    return {
      can_review: false,
      reason: 'You are not part of this application'
    };
  }

  // Check if application is completed
  if (application.status !== 'completed' && application.status !== 'closed') {
    return {
      can_review: false,
      reason: 'Reviews can only be submitted after employment ends'
    };
  }

  // Check if review already exists
  const { data: existingReview, error: reviewError } = await supabase
    .from('reviews')
    .select('id, review_window_end')
    .eq('application_id', applicationId)
    .eq('reviewer_id', user.id)
    .single();

  if (existingReview) {
    return {
      can_review: false,
      reason: 'You have already reviewed this employment',
      review_window_end: existingReview.review_window_end
    };
  }

  return {
    can_review: true
  };
}

/**
 * Get current user's review for specific application
 */
export async function getMyJobReviewForApplication(
  applicationId: string
): Promise<Review | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('application_id', applicationId)
    .eq('reviewer_id', user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Delete a job review (only if within edit window and not yet approved)
 */
export async function deleteJobReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting job review:', error);
    throw new Error('Failed to delete review');
  }
}

/**
 * Get pending job reviews (where user should leave a review)
 */
export async function getPendingJobReviews(): Promise<any[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return [];
  }

  // Get completed applications where user hasn't left a review
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      assignment:assignment_id(id, title, employer_id, type),
      employer:employer_id(id, full_name, business_name),
      freelancer:freelancer_id(id, full_name),
      status,
      reviewed_at
    `)
    .or(`employer_id.eq.${user.id},freelancer_id.eq.${user.id}`)
    .in('status', ['completed', 'closed']);

  if (error) {
    console.error('Error fetching pending job reviews:', error);
    return [];
  }

  // Filter to only job applications (not gigs) and where user hasn't reviewed
  const jobApplicationsWithoutReview = [];
  for (const app of data || []) {
    // Skip if not a job
    if (app.assignment?.type !== 'job') continue;

    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('application_id', app.id)
      .eq('reviewer_id', user.id)
      .single();

    if (!existingReview) {
      jobApplicationsWithoutReview.push(app);
    }
  }

  return jobApplicationsWithoutReview;
}
