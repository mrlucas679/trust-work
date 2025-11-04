/**
 * Application System Types
 * 
 * TypeScript interfaces and types for the freelancer application workflow
 */

import type { UserProfile } from './user';
import type { Assignment } from './assignments';

/**
 * Application status lifecycle
 * pending -> shortlisted -> accepted | rejected
 * pending -> withdrawn (by freelancer)
 */
export type ApplicationStatus =
    | 'pending'      // Initial state when freelancer applies
    | 'shortlisted'  // Employer marked as interesting
    | 'accepted'     // Employer accepted the application
    | 'rejected'     // Employer rejected the application
    | 'withdrawn';   // Freelancer withdrew their application

/**
 * Status change history entry
 */
export interface ApplicationStatusHistory {
    from_status: ApplicationStatus;
    to_status: ApplicationStatus;
    timestamp: string;
    changed_by: string;
    reason?: string;
}

/**
 * File attachment in application
 */
export interface ApplicationAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

/**
 * Core application data structure
 */
export interface Application {
    id: string;
    assignment_id: string;
    freelancer_id: string;

    // Application details
    cover_letter: string;
    proposed_rate?: number;
    proposed_timeline?: string;
    availability_start?: string;
    portfolio_links?: string[];
    attachments: ApplicationAttachment[];

    // Status tracking
    status: ApplicationStatus;
    status_history: ApplicationStatusHistory[];

    // Employer response
    employer_message?: string;
    employer_responded_at?: string;

    // Metadata
    viewed_by_employer: boolean;
    viewed_at?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Application with populated freelancer details
 */
export interface ApplicationWithFreelancer extends Application {
    freelancer: UserProfile;
    display_name: string;
    avatar_url?: string;
    skills?: string[];
    hourly_rate?: number;
    location?: string;
    province?: string;
    average_rating?: number;
    total_reviews?: number;
    completed_projects?: number;
}

/**
 * Application with populated assignment details
 */
export interface ApplicationWithAssignment extends Application {
    assignment: Assignment;
    assignment_title: string;
    assignment_description: string;
    budget_min?: number;
    budget_max?: number;
    assignment_status: string;
    client_id: string;
}

/**
 * Input for creating a new application
 */
export interface CreateApplicationInput {
    assignment_id: string;
    cover_letter: string;
    proposed_rate?: number;
    proposed_timeline?: string;
    availability_start?: string;
    portfolio_links?: string[];
    attachments?: ApplicationAttachment[];
}

/**
 * Input for updating application status (by employer)
 */
export interface UpdateApplicationStatusInput {
    status: Extract<ApplicationStatus, 'shortlisted' | 'accepted' | 'rejected'>;
    employer_message?: string;
}

/**
 * Input for withdrawing application (by freelancer)
 */
export interface WithdrawApplicationInput {
    reason?: string;
}

/**
 * Application statistics for an assignment
 */
export interface ApplicationStatistics {
    total_applications: number;
    pending_count: number;
    shortlisted_count: number;
    accepted_count: number;
    rejected_count: number;
    withdrawn_count: number;
}

/**
 * Filters for querying applications
 */
export interface ApplicationFilters {
    assignment_id?: string;
    freelancer_id?: string;
    status?: ApplicationStatus | ApplicationStatus[];
    viewed_by_employer?: boolean;
    created_after?: string;
    created_before?: string;
}

/**
 * Sort options for applications
 */
export type ApplicationSortBy =
    | 'created_at_desc'
    | 'created_at_asc'
    | 'proposed_rate_asc'
    | 'proposed_rate_desc'
    | 'rating_desc';

/**
 * Pagination options for applications
 */
export interface ApplicationPaginationOptions {
    page?: number;
    pageSize?: number;
    sortBy?: ApplicationSortBy;
}

/**
 * Paginated application results
 */
export interface ApplicationResults<T = Application> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

/**
 * Helper: Check if application can be withdrawn
 */
export function canWithdrawApplication(application: Application): boolean {
    return application.status === 'pending' || application.status === 'shortlisted';
}

/**
 * Helper: Check if application can be updated by employer
 */
export function canUpdateApplicationStatus(application: Application): boolean {
    return application.status === 'pending' || application.status === 'shortlisted';
}

/**
 * Helper: Get status badge color
 */
export function getApplicationStatusColor(status: ApplicationStatus): string {
    const colorMap: Record<ApplicationStatus, string> = {
        pending: 'yellow',
        shortlisted: 'blue',
        accepted: 'green',
        rejected: 'red',
        withdrawn: 'gray',
    };
    return colorMap[status];
}

/**
 * Helper: Get status display text
 */
export function getApplicationStatusText(status: ApplicationStatus): string {
    const textMap: Record<ApplicationStatus, string> = {
        pending: 'Pending Review',
        shortlisted: 'Shortlisted',
        accepted: 'Accepted',
        rejected: 'Not Selected',
        withdrawn: 'Withdrawn',
    };
    return textMap[status];
}

/**
 * Helper: Format proposed rate
 */
export function formatProposedRate(rate?: number): string {
    if (!rate) return 'Rate not specified';
    return `R${rate.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Helper: Check if application is active
 */
export function isApplicationActive(status: ApplicationStatus): boolean {
    return status === 'pending' || status === 'shortlisted';
}

/**
 * Helper: Check if application is finalized
 */
export function isApplicationFinalized(status: ApplicationStatus): boolean {
    return status === 'accepted' || status === 'rejected' || status === 'withdrawn';
}

/**
 * Helper: Get latest status change
 */
export function getLatestStatusChange(application: Application): ApplicationStatusHistory | null {
    if (application.status_history.length === 0) return null;
    return application.status_history[application.status_history.length - 1];
}

/**
 * Helper: Calculate application age in days
 */
export function getApplicationAgeDays(application: Application): number {
    const created = new Date(application.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Helper: Validate application input
 */
export interface ApplicationValidationErrors {
    cover_letter?: string;
    proposed_rate?: string;
    proposed_timeline?: string;
    availability_start?: string;
}

export function validateApplicationInput(
    input: CreateApplicationInput
): ApplicationValidationErrors | null {
    const errors: ApplicationValidationErrors = {};

    if (!input.cover_letter || input.cover_letter.trim().length === 0) {
        errors.cover_letter = 'Cover letter is required';
    } else if (input.cover_letter.trim().length < 50) {
        errors.cover_letter = 'Cover letter must be at least 50 characters';
    } else if (input.cover_letter.trim().length > 5000) {
        errors.cover_letter = 'Cover letter must be less than 5000 characters';
    }

    if (input.proposed_rate !== undefined) {
        if (input.proposed_rate < 0) {
            errors.proposed_rate = 'Rate cannot be negative';
        } else if (input.proposed_rate > 1000000) {
            errors.proposed_rate = 'Rate seems unreasonably high';
        }
    }

    if (input.availability_start) {
        const availDate = new Date(input.availability_start);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (availDate < today) {
            errors.availability_start = 'Availability date cannot be in the past';
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Type guard: Check if value is valid ApplicationStatus
 */
export function isApplicationStatus(value: unknown): value is ApplicationStatus {
    return (
        typeof value === 'string' &&
        ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'].includes(value)
    );
}
