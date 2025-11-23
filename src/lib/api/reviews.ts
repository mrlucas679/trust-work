import { supabase } from '../supabaseClient';

export interface GigReview {
  id: string;
  gig_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  communication_rating: number | null;
  quality_rating: number | null;
  timeliness_rating: number | null;
  professionalism_rating: number | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewData {
  gig_id: string;
  reviewed_user_id: string;
  rating: number;
  communication_rating?: number;
  quality_rating?: number;
  timeliness_rating?: number;
  professionalism_rating?: number;
  review_text?: string;
}

export interface ReviewStats {
  overall_rating: number;
  communication_rating: number;
  quality_rating: number;
  timeliness_rating: number;
  professionalism_rating: number;
  total_reviews: number;
}

/**
 * Create a review for a completed gig
 */
export async function createReview(data: CreateReviewData): Promise<GigReview> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to submit a review');
  }

  // Validate rating values (1-5)
  const ratings = [
    data.rating,
    data.communication_rating,
    data.quality_rating,
    data.timeliness_rating,
    data.professionalism_rating,
  ].filter((r) => r !== undefined);

  if (ratings.some((r) => r! < 1 || r! > 5)) {
    throw new Error('Ratings must be between 1 and 5');
  }

  // Check if reviewer participated in the gig
  const { data: gig, error: gigError } = await supabase
    .from('assignments')
    .select('id, client_id')
    .eq('id', data.gig_id)
    .eq('type', 'gig')
    .single();

  if (gigError || !gig) {
    throw new Error('Gig not found');
  }

  // Check if user has already reviewed this person for this gig
  const { data: existingReview } = await supabase
    .from('gig_reviews')
    .select('id')
    .eq('gig_id', data.gig_id)
    .eq('reviewer_id', user.id)
    .eq('reviewed_user_id', data.reviewed_user_id)
    .single();

  if (existingReview) {
    throw new Error('You have already reviewed this user for this gig');
  }

  // Insert review
  const { data: review, error } = await supabase
    .from('gig_reviews')
    .insert({
      gig_id: data.gig_id,
      reviewer_id: user.id,
      reviewed_user_id: data.reviewed_user_id,
      rating: data.rating,
      communication_rating: data.communication_rating || null,
      quality_rating: data.quality_rating || null,
      timeliness_rating: data.timeliness_rating || null,
      professionalism_rating: data.professionalism_rating || null,
      review_text: data.review_text || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw new Error(`Failed to create review: ${error.message}`);
  }

  return review as GigReview;
}

/**
 * Get all reviews received by a user
 */
export async function getReviewsForUser(userId: string): Promise<GigReview[]> {
  const { data, error } = await supabase
    .from('gig_reviews')
    .select('*')
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return (data || []) as GigReview[];
}

/**
 * Get all reviews written by a user
 */
export async function getReviewsByUser(userId: string): Promise<GigReview[]> {
  const { data, error } = await supabase
    .from('gig_reviews')
    .select('*')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return (data || []) as GigReview[];
}

/**
 * Get all reviews for a specific gig
 */
export async function getGigReviews(gigId: string): Promise<GigReview[]> {
  const { data, error } = await supabase
    .from('gig_reviews')
    .select('*')
    .eq('gig_id', gigId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gig reviews:', error);
    throw new Error(`Failed to fetch gig reviews: ${error.message}`);
  }

  return (data || []) as GigReview[];
}

/**
 * Calculate overall rating statistics for a user
 */
export async function calculateReviewStats(userId: string): Promise<ReviewStats> {
  const { data, error } = await supabase
    .from('gig_reviews')
    .select('rating, communication_rating, quality_rating, timeliness_rating, professionalism_rating')
    .eq('reviewed_user_id', userId);

  if (error) {
    console.error('Error calculating review stats:', error);
    throw new Error(`Failed to calculate review stats: ${error.message}`);
  }

  const reviews = (data || []) as GigReview[];

  if (reviews.length === 0) {
    return {
      overall_rating: 0,
      communication_rating: 0,
      quality_rating: 0,
      timeliness_rating: 0,
      professionalism_rating: 0,
      total_reviews: 0,
    };
  }

  const sum = (arr: (number | null)[]) => {
    const filtered = arr.filter((v) => v !== null) as number[];
    return filtered.length > 0 ? filtered.reduce((a, b) => a + b, 0) : 0;
  };

  const avg = (arr: (number | null)[]) => {
    const filtered = arr.filter((v) => v !== null) as number[];
    return filtered.length > 0 ? sum(filtered) / filtered.length : 0;
  };

  return {
    overall_rating: avg(reviews.map((r) => r.rating)),
    communication_rating: avg(reviews.map((r) => r.communication_rating)),
    quality_rating: avg(reviews.map((r) => r.quality_rating)),
    timeliness_rating: avg(reviews.map((r) => r.timeliness_rating)),
    professionalism_rating: avg(reviews.map((r) => r.professionalism_rating)),
    total_reviews: reviews.length,
  };
}

/**
 * Check if current user can review another user for a specific gig
 */
export async function canReviewUser(gigId: string, reviewedUserId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Check if gig exists and is completed
  const { data: gig } = await supabase
    .from('assignments')
    .select('id, status')
    .eq('id', gigId)
    .eq('type', 'gig')
    .single();

  if (!gig || gig.status !== 'completed') {
    return false;
  }

  // Check if user already reviewed this person for this gig
  const { data: existingReview } = await supabase
    .from('gig_reviews')
    .select('id')
    .eq('gig_id', gigId)
    .eq('reviewer_id', user.id)
    .eq('reviewed_user_id', reviewedUserId)
    .single();

  return !existingReview;
}

/**
 * Update a review (within 24 hours of creation)
 */
export async function updateReview(
  reviewId: string,
  updates: Partial<Omit<CreateReviewData, 'gig_id' | 'reviewed_user_id'>>
): Promise<GigReview> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to update a review');
  }

  // Validate rating values if provided
  const ratings = [
    updates.rating,
    updates.communication_rating,
    updates.quality_rating,
    updates.timeliness_rating,
    updates.professionalism_rating,
  ].filter((r) => r !== undefined);

  if (ratings.some((r) => r! < 1 || r! > 5)) {
    throw new Error('Ratings must be between 1 and 5');
  }

  // Check if review exists and was created by current user
  const { data: existingReview, error: fetchError } = await supabase
    .from('gig_reviews')
    .select('created_at')
    .eq('id', reviewId)
    .eq('reviewer_id', user.id)
    .single();

  if (fetchError || !existingReview) {
    throw new Error('Review not found or you do not have permission to update it');
  }

  // Check if review was created within last 24 hours
  const createdAt = new Date(existingReview.created_at);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceCreation > 24) {
    throw new Error('Reviews can only be updated within 24 hours of creation');
  }

  // Update review
  const { data: review, error } = await supabase
    .from('gig_reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('reviewer_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    throw new Error(`Failed to update review: ${error.message}`);
  }

  return review as GigReview;
}

/**
 * Delete a review (within 24 hours of creation)
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to delete a review');
  }

  // Check if review exists and was created by current user
  const { data: existingReview, error: fetchError } = await supabase
    .from('gig_reviews')
    .select('created_at')
    .eq('id', reviewId)
    .eq('reviewer_id', user.id)
    .single();

  if (fetchError || !existingReview) {
    throw new Error('Review not found or you do not have permission to delete it');
  }

  // Check if review was created within last 24 hours
  const createdAt = new Date(existingReview.created_at);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceCreation > 24) {
    throw new Error('Reviews can only be deleted within 24 hours of creation');
  }

  // Delete review
  const { error } = await supabase
    .from('gig_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('reviewer_id', user.id);

  if (error) {
    console.error('Error deleting review:', error);
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}
