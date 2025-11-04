/**
 * Assignment Workflow Types
 * 
 * Types for managing assignment lifecycle:
 * - Status transitions
 * - Reviews and ratings
 * - Timeline tracking
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const ASSIGNMENT_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'] as const;
export type AssignmentStatus = typeof ASSIGNMENT_STATUSES[number];

export const REVIEW_RATINGS = [1, 2, 3, 4, 5] as const;
export type ReviewRating = typeof REVIEW_RATINGS[number];

export const REVIEWER_TYPES = ['employer', 'freelancer'] as const;
export type ReviewerType = typeof REVIEWER_TYPES[number];

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
    id: string;
    assignment_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: ReviewRating;
    review_text: string;
    reviewer_type: ReviewerType;
    helpful_count: number;
    flagged: boolean;
    verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface ReviewWithProfiles extends Review {
    reviewer: {
        id: string;
        display_name: string;
        avatar_url?: string;
        verified: boolean;
    };
    reviewee: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    assignment: {
        title: string;
    };
}

export interface CreateReviewInput {
    assignment_id: string;
    reviewee_id: string;
    rating: ReviewRating;
    review_text: string;
    reviewer_type: ReviewerType;
}

export interface UpdateReviewInput {
    rating?: ReviewRating;
    review_text?: string;
}

// ============================================================================
// ASSIGNMENT STATUS HISTORY TYPES
// ============================================================================

export interface AssignmentStatusHistoryEntry {
    id: string;
    assignment_id: string;
    old_status: AssignmentStatus;
    new_status: AssignmentStatus;
    changed_by: string;
    reason?: string;
    created_at: string;
}

export interface TimelineEvent {
    event_type: 'status_change' | 'application' | 'review' | 'message';
    event_description: string;
    event_timestamp: string;
    event_user: string;
}

// ============================================================================
// WORKFLOW OPERATION TYPES
// ============================================================================

export interface StartAssignmentWorkInput {
    assignment_id: string;
    application_id: string;
}

export interface CompleteAssignmentInput {
    assignment_id: string;
    completion_notes?: string;
}

export interface CancelAssignmentInput {
    assignment_id: string;
    reason: string;
}

export interface WorkflowOperationResult {
    success: boolean;
    message?: string;
    error?: string;
}

// ============================================================================
// ASSIGNMENT WORKFLOW STATE
// ============================================================================

export interface AssignmentWorkflowState {
    current_status: AssignmentStatus;
    can_start: boolean;
    can_complete: boolean;
    can_cancel: boolean;
    can_review: boolean;
    freelancer_id?: string;
    started_at?: string;
    completed_at?: string;
    review_submitted: boolean;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function isValidAssignmentStatus(status: unknown): status is AssignmentStatus {
    return typeof status === 'string' && ASSIGNMENT_STATUSES.includes(status as AssignmentStatus);
}

export function isValidReviewRating(rating: unknown): rating is ReviewRating {
    return typeof rating === 'number' && REVIEW_RATINGS.includes(rating as ReviewRating);
}

export function isValidReviewerType(type: unknown): type is ReviewerType {
    return typeof type === 'string' && REVIEWER_TYPES.includes(type as ReviewerType);
}

export function validateReviewInput(input: Partial<CreateReviewInput>): string[] {
    const errors: string[] = [];

    if (!input.assignment_id) {
        errors.push('Assignment ID is required');
    }

    if (!input.reviewee_id) {
        errors.push('Reviewee ID is required');
    }

    if (!input.rating || !isValidReviewRating(input.rating)) {
        errors.push('Valid rating (1-5) is required');
    }

    if (!input.review_text || input.review_text.trim().length < 10) {
        errors.push('Review text must be at least 10 characters');
    }

    if (input.review_text && input.review_text.length > 2000) {
        errors.push('Review text must not exceed 2000 characters');
    }

    if (!input.reviewer_type || !isValidReviewerType(input.reviewer_type)) {
        errors.push('Valid reviewer type is required');
    }

    return errors;
}

export function validateCancelReason(reason: string): string[] {
    const errors: string[] = [];

    if (!reason || reason.trim().length < 10) {
        errors.push('Cancellation reason must be at least 10 characters');
    }

    if (reason && reason.length > 500) {
        errors.push('Cancellation reason must not exceed 500 characters');
    }

    return errors;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function canTransitionToStatus(
    currentStatus: AssignmentStatus,
    newStatus: AssignmentStatus,
    userRole: 'employer' | 'freelancer'
): boolean {
    // Status transition rules
    const transitions: Record<AssignmentStatus, Partial<Record<AssignmentStatus, 'employer' | 'freelancer' | 'both'>>> = {
        open: {
            in_progress: 'employer',  // Employer accepts application
            cancelled: 'employer',     // Employer cancels before start
        },
        in_progress: {
            completed: 'freelancer',   // Freelancer marks complete
            cancelled: 'employer',     // Employer cancels during work
        },
        completed: {},                 // Cannot transition from completed
        cancelled: {},                 // Cannot transition from cancelled
    };

    const allowedRole = transitions[currentStatus]?.[newStatus];
    if (!allowedRole) return false;

    return allowedRole === 'both' || allowedRole === userRole;
}

export function getStatusLabel(status: AssignmentStatus): string {
    const labels: Record<AssignmentStatus, string> = {
        open: 'Open',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return labels[status];
}

export function getStatusColor(status: AssignmentStatus): string {
    const colors: Record<AssignmentStatus, string> = {
        open: 'bg-blue-500',
        in_progress: 'bg-yellow-500',
        completed: 'bg-green-500',
        cancelled: 'bg-gray-500',
    };
    return colors[status];
}

export function getRatingLabel(rating: ReviewRating): string {
    const labels: Record<ReviewRating, string> = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent',
    };
    return labels[rating];
}

export function calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(2));
}

export function formatTimelineDuration(startDate: string, endDate?: string): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Less than a day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    return `${Math.floor(diffDays / 30)} months`;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isReview(obj: unknown): obj is Review {
    if (typeof obj !== 'object' || obj === null) return false;
    const review = obj as Record<string, unknown>;

    return (
        typeof review.id === 'string' &&
        typeof review.assignment_id === 'string' &&
        typeof review.reviewer_id === 'string' &&
        typeof review.reviewee_id === 'string' &&
        isValidReviewRating(review.rating) &&
        typeof review.review_text === 'string' &&
        isValidReviewerType(review.reviewer_type)
    );
}

export function isWorkflowOperationResult(obj: unknown): obj is WorkflowOperationResult {
    if (typeof obj !== 'object' || obj === null) return false;
    const result = obj as Record<string, unknown>;

    return typeof result.success === 'boolean';
}
