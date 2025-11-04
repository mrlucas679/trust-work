/**
 * Assignment Workflow Hooks
 * 
 * React Query hooks for assignment lifecycle operations:
 * - Status transitions
 * - Reviews and ratings
 * - Timeline tracking
 * 
 * Features: Optimistic updates, automatic cache invalidation
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type {
    Review,
    ReviewWithProfiles,
    CreateReviewInput,
    UpdateReviewInput,
    TimelineEvent,
    AssignmentStatusHistoryEntry,
    StartAssignmentWorkInput,
    CompleteAssignmentInput,
    CancelAssignmentInput,
    WorkflowOperationResult,
} from '@/types/workflow';
import {
    startAssignmentWork as apiStartWork,
    completeAssignment as apiCompleteAssignment,
    cancelAssignment as apiCancelAssignment,
    getAssignmentTimeline,
    createReview as apiCreateReview,
    updateReview as apiUpdateReview,
    getUserReviews,
    getAssignmentReviews,
    hasUserReviewed,
    canReviewAssignment,
    getAssignmentStatusHistory,
} from '@/lib/api/workflow';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const workflowKeys = {
    all: ['workflow'] as const,
    timeline: (assignmentId: string) => ['workflow', 'timeline', assignmentId] as const,
    statusHistory: (assignmentId: string) => ['workflow', 'status-history', assignmentId] as const,
    userReviews: (userId: string) => ['workflow', 'reviews', 'user', userId] as const,
    assignmentReviews: (assignmentId: string) => ['workflow', 'reviews', 'assignment', assignmentId] as const,
    reviewStatus: (assignmentId: string) => ['workflow', 'review-status', assignmentId] as const,
    canReview: (assignmentId: string) => ['workflow', 'can-review', assignmentId] as const,
};

// ============================================================================
// WORKFLOW OPERATION HOOKS
// ============================================================================

/**
 * Start assignment work (employer accepts application)
 */
export function useStartAssignmentWork() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation<
        WorkflowOperationResult,
        Error,
        StartAssignmentWorkInput
    >({
        mutationFn: apiStartWork,
        onSuccess: (result, variables) => {
            if (result.success) {
                // Invalidate related queries
                queryClient.invalidateQueries({ queryKey: ['assignments'] });
                queryClient.invalidateQueries({ queryKey: ['applications'] });
                queryClient.invalidateQueries({ queryKey: workflowKeys.timeline(variables.assignment_id) });
                queryClient.invalidateQueries({ queryKey: workflowKeys.statusHistory(variables.assignment_id) });

                // Navigate to assignment detail
                navigate(`/assignments/${variables.assignment_id}`);
            }
        },
    });
}

/**
 * Complete assignment (freelancer marks as done)
 */
export function useCompleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation<
        WorkflowOperationResult,
        Error,
        CompleteAssignmentInput
    >({
        mutationFn: apiCompleteAssignment,
        onSuccess: (result, variables) => {
            if (result.success) {
                // Invalidate related queries
                queryClient.invalidateQueries({ queryKey: ['assignments'] });
                queryClient.invalidateQueries({ queryKey: workflowKeys.timeline(variables.assignment_id) });
                queryClient.invalidateQueries({ queryKey: workflowKeys.statusHistory(variables.assignment_id) });
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
        },
    });
}

/**
 * Cancel assignment with reason
 */
export function useCancelAssignment() {
    const queryClient = useQueryClient();

    return useMutation<
        WorkflowOperationResult,
        Error,
        CancelAssignmentInput
    >({
        mutationFn: apiCancelAssignment,
        onSuccess: (result, variables) => {
            if (result.success) {
                // Invalidate related queries
                queryClient.invalidateQueries({ queryKey: ['assignments'] });
                queryClient.invalidateQueries({ queryKey: workflowKeys.timeline(variables.assignment_id) });
                queryClient.invalidateQueries({ queryKey: workflowKeys.statusHistory(variables.assignment_id) });
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
        },
    });
}

// ============================================================================
// TIMELINE HOOKS
// ============================================================================

/**
 * Get assignment timeline with all events
 */
export function useAssignmentTimeline(assignmentId: string, enabled = true) {
    return useQuery<TimelineEvent[]>({
        queryKey: workflowKeys.timeline(assignmentId),
        queryFn: () => getAssignmentTimeline(assignmentId),
        enabled: enabled && !!assignmentId,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Get assignment status history
 */
export function useAssignmentStatusHistory(assignmentId: string, enabled = true) {
    return useQuery<AssignmentStatusHistoryEntry[]>({
        queryKey: workflowKeys.statusHistory(assignmentId),
        queryFn: () => getAssignmentStatusHistory(assignmentId),
        enabled: enabled && !!assignmentId,
        staleTime: 1000 * 60, // 1 minute
    });
}

// ============================================================================
// REVIEW HOOKS
// ============================================================================

/**
 * Create a review
 */
export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation<
        { review: Review | null; error: string | null },
        Error,
        CreateReviewInput
    >({
        mutationFn: apiCreateReview,
        onSuccess: (result, variables) => {
            if (result.review) {
                // Invalidate related queries
                queryClient.invalidateQueries({
                    queryKey: workflowKeys.assignmentReviews(variables.assignment_id)
                });
                queryClient.invalidateQueries({
                    queryKey: workflowKeys.userReviews(variables.reviewee_id)
                });
                queryClient.invalidateQueries({
                    queryKey: workflowKeys.reviewStatus(variables.assignment_id)
                });
                queryClient.invalidateQueries({
                    queryKey: workflowKeys.canReview(variables.assignment_id)
                });
                queryClient.invalidateQueries({ queryKey: ['profiles'] });
            }
        },
    });
}

/**
 * Update a review
 */
export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation<
        { review: Review | null; error: string | null },
        Error,
        { reviewId: string; input: UpdateReviewInput; assignmentId: string }
    >({
        mutationFn: ({ reviewId, input }) => apiUpdateReview(reviewId, input),
        onSuccess: (result, variables) => {
            if (result.review) {
                // Invalidate related queries
                queryClient.invalidateQueries({
                    queryKey: workflowKeys.assignmentReviews(variables.assignmentId)
                });
                queryClient.invalidateQueries({ queryKey: ['profiles'] });
            }
        },
    });
}

/**
 * Get user reviews (as reviewee)
 */
export function useUserReviews(userId: string, limit = 10, enabled = true) {
    return useQuery<ReviewWithProfiles[]>({
        queryKey: workflowKeys.userReviews(userId),
        queryFn: () => getUserReviews(userId, limit),
        enabled: enabled && !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Get assignment reviews
 */
export function useAssignmentReviews(assignmentId: string, enabled = true) {
    return useQuery<ReviewWithProfiles[]>({
        queryKey: workflowKeys.assignmentReviews(assignmentId),
        queryFn: () => getAssignmentReviews(assignmentId),
        enabled: enabled && !!assignmentId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Check if user has already reviewed
 */
export function useHasUserReviewed(assignmentId: string, enabled = true) {
    return useQuery<boolean>({
        queryKey: workflowKeys.reviewStatus(assignmentId),
        queryFn: () => hasUserReviewed(assignmentId),
        enabled: enabled && !!assignmentId,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Check if user can review assignment
 */
export function useCanReviewAssignment(assignmentId: string, enabled = true) {
    return useQuery<{ canReview: boolean; reason?: string }>({
        queryKey: workflowKeys.canReview(assignmentId),
        queryFn: () => canReviewAssignment(assignmentId),
        enabled: enabled && !!assignmentId,
        staleTime: 1000 * 60, // 1 minute
    });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Complete workflow state for an assignment
 * Combines multiple queries for comprehensive state
 */
export function useAssignmentWorkflow(assignmentId: string) {
    const timeline = useAssignmentTimeline(assignmentId);
    const statusHistory = useAssignmentStatusHistory(assignmentId);
    const reviews = useAssignmentReviews(assignmentId);
    const canReview = useCanReviewAssignment(assignmentId);
    const hasReviewed = useHasUserReviewed(assignmentId);

    return {
        timeline: timeline.data || [],
        statusHistory: statusHistory.data || [],
        reviews: reviews.data || [],
        canReview: canReview.data?.canReview || false,
        canReviewReason: canReview.data?.reason,
        hasReviewed: hasReviewed.data || false,
        isLoading:
            timeline.isLoading ||
            statusHistory.isLoading ||
            reviews.isLoading ||
            canReview.isLoading ||
            hasReviewed.isLoading,
        error:
            timeline.error ||
            statusHistory.error ||
            reviews.error ||
            canReview.error ||
            hasReviewed.error,
    };
}
