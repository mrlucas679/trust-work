import { supabase } from '@/lib/supabaseClient';
import type {
    Application,
    ApplicationWithFreelancer,
    ApplicationWithAssignment,
    CreateApplicationInput,
    UpdateApplicationStatusInput,
    WithdrawApplicationInput,
    ApplicationFilters,
    ApplicationPaginationOptions,
    ApplicationResults,
    ApplicationStatistics,
    validateApplicationInput,
} from '@/types/applications';

/**
 * Submit a new application to an assignment
 * @param input Application data including cover letter, rate, etc.
 * @returns Created application or error
 */
export async function submitApplication(input: CreateApplicationInput): Promise<{
    success: boolean;
    data?: Application;
    error?: string;
}> {
    try {
        // Validate input
        const validationErrors = validateApplicationInput(input);
        if (validationErrors) {
            return {
                success: false,
                error: `Validation failed: ${Object.values(validationErrors).join(', ')}`,
            };
        }

        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Check if user can apply (using RPC function)
        const { data: canApply, error: checkError } = await supabase.rpc('can_apply_to_assignment', {
            p_assignment_id: input.assignment_id,
            p_user_id: user.id,
        });

        if (checkError) {
            return { success: false, error: checkError.message };
        }

        if (!canApply) {
            return {
                success: false,
                error: 'You cannot apply to this assignment (may be closed or already applied)',
            };
        }

        // Create application
        const { data, error } = await supabase
            .from('applications')
            .insert({
                assignment_id: input.assignment_id,
                freelancer_id: user.id,
                cover_letter: input.cover_letter,
                proposed_rate: input.proposed_rate,
                proposed_timeline: input.proposed_timeline,
                availability_start: input.availability_start,
                portfolio_links: input.portfolio_links || [],
                attachments: input.attachments || [],
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error submitting application:', error);
        return { success: false, error: 'Failed to submit application' };
    }
}

/**
 * Withdraw a pending application
 * @param applicationId Application UUID
 * @param input Optional reason for withdrawal
 * @returns Success status or error
 */
export async function withdrawApplication(
    applicationId: string,
    input?: WithdrawApplicationInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Update to withdrawn status (RLS will ensure user owns application)
        const { error } = await supabase
            .from('applications')
            .update({
                status: 'withdrawn',
                employer_message: input?.reason || null,
            })
            .eq('id', applicationId)
            .eq('freelancer_id', user.id)
            .in('status', ['pending', 'shortlisted']);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error withdrawing application:', error);
        return { success: false, error: 'Failed to withdraw application' };
    }
}

/**
 * Update application status (employer action)
 * @param applicationId Application UUID
 * @param input Status update (shortlisted, accepted, rejected) with optional message
 * @returns Success status or error
 */
export async function updateApplicationStatus(
    applicationId: string,
    input: UpdateApplicationStatusInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Update status (RLS will ensure user owns the assignment)
        const { error } = await supabase
            .from('applications')
            .update({
                status: input.status,
                employer_message: input.employer_message || null,
                employer_responded_at: new Date().toISOString(),
            })
            .eq('id', applicationId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating application status:', error);
        return { success: false, error: 'Failed to update application status' };
    }
}

/**
 * Get applications with filters and pagination
 * @param filters Filter criteria (assignment, freelancer, status, etc.)
 * @param options Pagination and sorting
 * @returns Paginated applications or error
 */
export async function getApplications(
    filters?: ApplicationFilters,
    options?: ApplicationPaginationOptions
): Promise<{
    success: boolean;
    data?: ApplicationResults<ApplicationWithFreelancer>;
    error?: string;
}> {
    try {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;
        const sortBy = options?.sortBy || 'created_at_desc';

        // Start query with view for freelancer details
        let query = supabase.from('applications_with_freelancer').select('*', { count: 'exact' });

        // Apply filters
        if (filters?.assignment_id) {
            query = query.eq('assignment_id', filters.assignment_id);
        }
        if (filters?.freelancer_id) {
            query = query.eq('freelancer_id', filters.freelancer_id);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.viewed_by_employer !== undefined) {
            query = query.eq('viewed_by_employer', filters.viewed_by_employer);
        }
        if (filters?.created_after) {
            query = query.gte('created_at', filters.created_after);
        }
        if (filters?.created_before) {
            query = query.lte('created_at', filters.created_before);
        }

        // Apply sorting
        switch (sortBy) {
            case 'created_at_asc':
                query = query.order('created_at', { ascending: true });
                break;
            case 'created_at_desc':
                query = query.order('created_at', { ascending: false });
                break;
            case 'proposed_rate_asc':
                query = query.order('proposed_rate', { ascending: true, nullsFirst: false });
                break;
            case 'proposed_rate_desc':
                query = query.order('proposed_rate', { ascending: false, nullsFirst: false });
                break;
            case 'rating_desc':
                query = query.order('average_rating', { ascending: false, nullsFirst: false });
                break;
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                data: (data || []) as ApplicationWithFreelancer[],
                total: count || 0,
                page,
                pageSize,
                hasMore: (count || 0) > page * pageSize,
            },
        };
    } catch (error) {
        console.error('Error fetching applications:', error);
        return { success: false, error: 'Failed to fetch applications' };
    }
}

/**
 * Get a single application by ID with all details
 * @param applicationId Application UUID
 * @param includeAssignment Whether to include assignment details
 * @returns Application with freelancer (and optionally assignment) details
 */
export async function getApplication(
    applicationId: string,
    includeAssignment = false
): Promise<{
    success: boolean;
    data?: ApplicationWithFreelancer | ApplicationWithAssignment;
    error?: string;
}> {
    try {
        const view = includeAssignment ? 'applications_with_assignment' : 'applications_with_freelancer';

        const { data, error } = await supabase.from(view).select('*').eq('id', applicationId).single();

        if (error) {
            return { success: false, error: error.message };
        }

        // Mark as viewed by employer if current user is employer
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user && data) {
            // Check if user owns the assignment
            const { data: assignment } = await supabase
                .from('assignments')
                .select('client_id')
                .eq('id', data.assignment_id)
                .single();

            if (assignment?.client_id === user.id && !data.viewed_by_employer) {
                // Update viewed status
                await supabase
                    .from('applications')
                    .update({
                        viewed_by_employer: true,
                        viewed_at: new Date().toISOString(),
                    })
                    .eq('id', applicationId);
            }
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching application:', error);
        return { success: false, error: 'Failed to fetch application' };
    }
}

/**
 * Get application statistics for an assignment
 * @param assignmentId Assignment UUID
 * @returns Statistics (total, pending, shortlisted, accepted, rejected, withdrawn)
 */
export async function getApplicationStatistics(assignmentId: string): Promise<{
    success: boolean;
    data?: ApplicationStatistics;
    error?: string;
}> {
    try {
        const { data, error } = await supabase.rpc('get_assignment_application_stats', {
            p_assignment_id: assignmentId,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            return {
                success: true,
                data: {
                    total_applications: 0,
                    pending_count: 0,
                    shortlisted_count: 0,
                    accepted_count: 0,
                    rejected_count: 0,
                    withdrawn_count: 0,
                },
            };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error fetching application statistics:', error);
        return { success: false, error: 'Failed to fetch statistics' };
    }
}

/**
 * Check if current user can apply to an assignment
 * @param assignmentId Assignment UUID
 * @returns Boolean indicating if user can apply
 */
export async function canUserApplyToAssignment(assignmentId: string): Promise<{
    success: boolean;
    data?: boolean;
    error?: string;
}> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { data, error } = await supabase.rpc('can_apply_to_assignment', {
            p_assignment_id: assignmentId,
            p_user_id: user.id,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error checking if user can apply:', error);
        return { success: false, error: 'Failed to check application eligibility' };
    }
}

/**
 * Get freelancer's own applications
 * @param filters Optional filters (status, assignment)
 * @param options Pagination and sorting
 * @returns Applications with assignment details
 */
export async function getMyApplications(
    filters?: Pick<ApplicationFilters, 'status' | 'assignment_id' | 'created_after' | 'created_before'>,
    options?: ApplicationPaginationOptions
): Promise<{
    success: boolean;
    data?: ApplicationResults<ApplicationWithAssignment>;
    error?: string;
}> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;
        const sortBy = options?.sortBy || 'created_at_desc';

        // Use view with assignment details
        let query = supabase
            .from('applications_with_assignment')
            .select('*', { count: 'exact' })
            .eq('freelancer_id', user.id);

        // Apply filters
        if (filters?.assignment_id) {
            query = query.eq('assignment_id', filters.assignment_id);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.created_after) {
            query = query.gte('created_at', filters.created_after);
        }
        if (filters?.created_before) {
            query = query.lte('created_at', filters.created_before);
        }

        // Apply sorting
        switch (sortBy) {
            case 'created_at_asc':
                query = query.order('created_at', { ascending: true });
                break;
            case 'created_at_desc':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                data: (data || []) as ApplicationWithAssignment[],
                total: count || 0,
                page,
                pageSize,
                hasMore: (count || 0) > page * pageSize,
            },
        };
    } catch (error) {
        console.error('Error fetching my applications:', error);
        return { success: false, error: 'Failed to fetch applications' };
    }
}
