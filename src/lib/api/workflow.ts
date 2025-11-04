/**
 * Assignment Workflow API
 * 
 * API functions for managing assignment lifecycle:
 * - Status transitions (start, complete, cancel)
 * - Reviews and ratings
 * - Timeline tracking
 * 
 * Security: All operations protected by RLS policies
 */

import { supabase } from '../supabaseClient';
import type {
    Review,
    ReviewWithProfiles,
    CreateReviewInput,
    UpdateReviewInput,
    AssignmentStatusHistoryEntry,
    TimelineEvent,
    StartAssignmentWorkInput,
    CompleteAssignmentInput,
    CancelAssignmentInput,
    WorkflowOperationResult,
} from '@/types/workflow';
import { validateReviewInput, validateCancelReason } from '@/types/workflow';

// ============================================================================
// WORKFLOW OPERATIONS (RPC Functions)
// ============================================================================

/**
 * Start assignment work (employer accepts application)
 * @security Requires authentication, RLS enforces ownership
 */
export async function startAssignmentWork(
    input: StartAssignmentWorkInput
): Promise<WorkflowOperationResult> {
    try {
        const { data, error } = await supabase.rpc('start_assignment_work', {
            p_assignment_id: input.assignment_id,
            p_application_id: input.application_id,
        });

        if (error) throw error;

        return data as WorkflowOperationResult;
    } catch (error) {
        console.error('Error starting assignment work:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to start assignment',
        };
    }
}

/**
 * Complete assignment (freelancer marks as done)
 * @security Requires authentication, RLS enforces ownership
 */
export async function completeAssignment(
    input: CompleteAssignmentInput
): Promise<WorkflowOperationResult> {
    try {
        const { data, error } = await supabase.rpc('complete_assignment', {
            p_assignment_id: input.assignment_id,
            p_completion_notes: input.completion_notes || null,
        });

        if (error) throw error;

        return data as WorkflowOperationResult;
    } catch (error) {
        console.error('Error completing assignment:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to complete assignment',
        };
    }
}

/**
 * Cancel assignment with reason
 * @security Requires authentication, RLS enforces ownership (employer only)
 */
export async function cancelAssignment(
    input: CancelAssignmentInput
): Promise<WorkflowOperationResult> {
    try {
        // Validate reason
        const validationErrors = validateCancelReason(input.reason);
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: validationErrors.join(', '),
            };
        }

        const { data, error } = await supabase.rpc('cancel_assignment', {
            p_assignment_id: input.assignment_id,
            p_reason: input.reason,
        });

        if (error) throw error;

        return data as WorkflowOperationResult;
    } catch (error) {
        console.error('Error cancelling assignment:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cancel assignment',
        };
    }
}

/**
 * Get assignment timeline
 * @security RLS enforces that only participants can view
 */
export async function getAssignmentTimeline(
    assignmentId: string
): Promise<TimelineEvent[]> {
    try {
        const { data, error } = await supabase.rpc('get_assignment_timeline', {
            p_assignment_id: assignmentId,
        });

        if (error) throw error;

        return (data as TimelineEvent[]) || [];
    } catch (error) {
        console.error('Error fetching assignment timeline:', error);
        return [];
    }
}

// ============================================================================
// REVIEWS API
// ============================================================================

/**
 * Create a review for completed assignment
 * @security RLS enforces that only participants can review, after completion
 */
export async function createReview(
    input: CreateReviewInput
): Promise<{ review: Review | null; error: string | null }> {
    try {
        // Validate input
        const validationErrors = validateReviewInput(input);
        if (validationErrors.length > 0) {
            return { review: null, error: validationErrors.join(', ') };
        }

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { review: null, error: 'Authentication required' };
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                assignment_id: input.assignment_id,
                reviewer_id: user.id,
                reviewee_id: input.reviewee_id,
                rating: input.rating,
                review_text: input.review_text.trim(),
                reviewer_type: input.reviewer_type,
            })
            .select()
            .single();

        if (error) throw error;

        return { review: data as Review, error: null };
    } catch (error) {
        console.error('Error creating review:', error);
        return {
            review: null,
            error: error instanceof Error ? error.message : 'Failed to create review',
        };
    }
}

/**
 * Update an existing review (within 7 days)
 * @security RLS enforces that only reviewer can update, within time limit
 */
export async function updateReview(
    reviewId: string,
    input: UpdateReviewInput
): Promise<{ review: Review | null; error: string | null }> {
    try {
        // Validate input if provided
        if (input.review_text) {
            const errors = validateReviewInput({ ...input, review_text: input.review_text } as CreateReviewInput);
            if (errors.length > 0) {
                return { review: null, error: errors.join(', ') };
            }
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (input.rating !== undefined) updateData.rating = input.rating;
        if (input.review_text !== undefined) updateData.review_text = input.review_text.trim();

        const { data, error } = await supabase
            .from('reviews')
            .update(updateData)
            .eq('id', reviewId)
            .select()
            .single();

        if (error) throw error;

        return { review: data as Review, error: null };
    } catch (error) {
        console.error('Error updating review:', error);
        return {
            review: null,
            error: error instanceof Error ? error.message : 'Failed to update review',
        };
    }
}

/**
 * Get reviews for a user (as reviewee)
 * @security RLS enforces public read access for non-flagged reviews
 */
export async function getUserReviews(
    userId: string,
    limit: number = 10
): Promise<ReviewWithProfiles[]> {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                reviewer:reviewer_id(id, display_name, avatar_url, verified:business_verified),
                reviewee:reviewee_id(id, display_name, avatar_url),
                assignment:assignment_id(title)
            `)
            .eq('reviewee_id', userId)
            .eq('flagged', false)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data as unknown as ReviewWithProfiles[]) || [];
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        return [];
    }
}

/**
 * Get reviews for an assignment
 * @security RLS enforces public read access for non-flagged reviews
 */
export async function getAssignmentReviews(
    assignmentId: string
): Promise<ReviewWithProfiles[]> {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                reviewer:reviewer_id(id, display_name, avatar_url, verified:business_verified),
                reviewee:reviewee_id(id, display_name, avatar_url),
                assignment:assignment_id(title)
            `)
            .eq('assignment_id', assignmentId)
            .eq('flagged', false)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data as unknown as ReviewWithProfiles[]) || [];
    } catch (error) {
        console.error('Error fetching assignment reviews:', error);
        return [];
    }
}

/**
 * Check if user has already reviewed an assignment
 */
export async function hasUserReviewed(
    assignmentId: string,
    userId?: string
): Promise<boolean> {
    try {
        // Get current user if not provided
        let reviewerId = userId;
        if (!reviewerId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;
            reviewerId = user.id;
        }

        const { data, error } = await supabase
            .from('reviews')
            .select('id')
            .eq('assignment_id', assignmentId)
            .eq('reviewer_id', reviewerId)
            .maybeSingle();

        if (error) throw error;

        return data !== null;
    } catch (error) {
        console.error('Error checking review status:', error);
        return false;
    }
}

/**
 * Mark review as helpful
 * @security Public operation, increments helpful count
 */
export async function markReviewHelpful(reviewId: string): Promise<boolean> {
    try {
        const { error } = await supabase.rpc('increment', {
            table_name: 'reviews',
            row_id: reviewId,
            column_name: 'helpful_count',
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error marking review as helpful:', error);
        return false;
    }
}

// ============================================================================
// STATUS HISTORY API
// ============================================================================

/**
 * Get status history for an assignment
 * @security RLS enforces that only participants can view
 */
export async function getAssignmentStatusHistory(
    assignmentId: string
): Promise<AssignmentStatusHistoryEntry[]> {
    try {
        const { data, error } = await supabase
            .from('assignment_status_history')
            .select('*')
            .eq('assignment_id', assignmentId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return (data as AssignmentStatusHistoryEntry[]) || [];
    } catch (error) {
        console.error('Error fetching status history:', error);
        return [];
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user can review an assignment
 */
export async function canReviewAssignment(
    assignmentId: string
): Promise<{ canReview: boolean; reason?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { canReview: false, reason: 'Not authenticated' };
        }

        // Get assignment
        const { data: assignment, error: assignmentError } = await supabase
            .from('assignments')
            .select('status, client_id, freelancer_id')
            .eq('id', assignmentId)
            .single();

        if (assignmentError || !assignment) {
            return { canReview: false, reason: 'Assignment not found' };
        }

        // Check if assignment is completed
        if (assignment.status !== 'completed') {
            return { canReview: false, reason: 'Assignment not completed yet' };
        }

        // Check if user is participant
        const isParticipant =
            assignment.client_id === user.id ||
            assignment.freelancer_id === user.id;

        if (!isParticipant) {
            return { canReview: false, reason: 'Not a participant in this assignment' };
        }

        // Check if already reviewed
        const alreadyReviewed = await hasUserReviewed(assignmentId, user.id);
        if (alreadyReviewed) {
            return { canReview: false, reason: 'Already reviewed this assignment' };
        }

        return { canReview: true };
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return { canReview: false, reason: 'Error checking eligibility' };
    }
}
