import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    submitApplication,
    withdrawApplication,
    updateApplicationStatus,
    getApplications,
    getApplication,
    getApplicationStatistics,
    canUserApplyToAssignment,
    getMyApplications,
} from '@/lib/api/applications';
import type {
    CreateApplicationInput,
    UpdateApplicationStatusInput,
    WithdrawApplicationInput,
    ApplicationFilters,
    ApplicationPaginationOptions,
} from '@/types/applications';

/**
 * Hook to fetch applications with filters and pagination
 * @param filters Filter criteria
 * @param options Pagination and sorting
 * @returns Query result with applications
 */
export function useApplications(
    filters?: ApplicationFilters,
    options?: ApplicationPaginationOptions
) {
    return useQuery({
        queryKey: ['applications', filters, options],
        queryFn: async () => {
            const result = await getApplications(filters, options);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch applications');
            }
            return result.data!;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch a single application by ID
 * @param applicationId Application UUID
 * @param includeAssignment Whether to include assignment details
 * @returns Query result with application
 */
export function useApplication(applicationId: string | undefined, includeAssignment = false) {
    return useQuery({
        queryKey: ['application', applicationId, includeAssignment],
        queryFn: async () => {
            if (!applicationId) {
                throw new Error('Application ID is required');
            }
            const result = await getApplication(applicationId, includeAssignment);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch application');
            }
            return result.data!;
        },
        enabled: !!applicationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch application statistics for an assignment
 * @param assignmentId Assignment UUID
 * @returns Query result with statistics
 */
export function useApplicationStatistics(assignmentId: string | undefined) {
    return useQuery({
        queryKey: ['application-statistics', assignmentId],
        queryFn: async () => {
            if (!assignmentId) {
                throw new Error('Assignment ID is required');
            }
            const result = await getApplicationStatistics(assignmentId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch statistics');
            }
            return result.data!;
        },
        enabled: !!assignmentId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to check if user can apply to an assignment
 * @param assignmentId Assignment UUID
 * @returns Query result with boolean
 */
export function useCanApply(assignmentId: string | undefined) {
    return useQuery({
        queryKey: ['can-apply', assignmentId],
        queryFn: async () => {
            if (!assignmentId) {
                return false;
            }
            const result = await canUserApplyToAssignment(assignmentId);
            if (!result.success) {
                return false;
            }
            return result.data || false;
        },
        enabled: !!assignmentId,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
}

/**
 * Hook to fetch freelancer's own applications
 * @param filters Filter criteria
 * @param options Pagination and sorting
 * @returns Query result with applications
 */
export function useMyApplications(
    filters?: Pick<
        ApplicationFilters,
        'status' | 'assignment_id' | 'created_after' | 'created_before'
    >,
    options?: ApplicationPaginationOptions
) {
    return useQuery({
        queryKey: ['my-applications', filters, options],
        queryFn: async () => {
            const result = await getMyApplications(filters, options);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch applications');
            }
            return result.data!;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to submit a new application
 * @returns Mutation for submitting application
 */
export function useSubmitApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateApplicationInput) => {
            const result = await submitApplication(input);
            if (!result.success) {
                throw new Error(result.error || 'Failed to submit application');
            }
            return result.data!;
        },
        onSuccess: (data, variables) => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['my-applications'] });
            queryClient.invalidateQueries({ queryKey: ['applications', { assignment_id: variables.assignment_id }] });
            queryClient.invalidateQueries({ queryKey: ['application-statistics', variables.assignment_id] });
            queryClient.invalidateQueries({ queryKey: ['can-apply', variables.assignment_id] });

            // Optimistically update assignment application count
            queryClient.invalidateQueries({ queryKey: ['assignment', variables.assignment_id] });
        },
    });
}

/**
 * Hook to withdraw an application
 * @returns Mutation for withdrawing application
 */
export function useWithdrawApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            applicationId,
            input,
        }: {
            applicationId: string;
            input?: WithdrawApplicationInput;
        }) => {
            const result = await withdrawApplication(applicationId, input);
            if (!result.success) {
                throw new Error(result.error || 'Failed to withdraw application');
            }
            return true;
        },
        onSuccess: (_, variables) => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['my-applications'] });
            queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });

            // Invalidate statistics (assignment ID not available here, so invalidate all)
            queryClient.invalidateQueries({ queryKey: ['application-statistics'] });
        },
    });
}

/**
 * Hook to update application status (employer action)
 * @returns Mutation for updating application status
 */
export function useUpdateApplicationStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            applicationId,
            input,
        }: {
            applicationId: string;
            input: UpdateApplicationStatusInput;
        }) => {
            const result = await updateApplicationStatus(applicationId, input);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update application status');
            }
            return true;
        },
        onSuccess: (_, variables) => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['application-statistics'] });

            // If accepted, invalidate assignment queries (status will change)
            if (variables.input.status === 'accepted') {
                queryClient.invalidateQueries({ queryKey: ['assignments'] });
                queryClient.invalidateQueries({ queryKey: ['assignment'] });
            }
        },
    });
}

/**
 * Hook to get application counts for multiple assignments
 * Useful for displaying application counts on assignment cards
 * @param assignmentIds Array of assignment UUIDs
 * @returns Query result with map of assignment ID to count
 */
export function useApplicationCounts(assignmentIds: string[]) {
    return useQuery({
        queryKey: ['application-counts', assignmentIds],
        queryFn: async () => {
            const counts: Record<string, number> = {};

            // Fetch statistics for each assignment
            const results = await Promise.all(
                assignmentIds.map((id) => getApplicationStatistics(id))
            );

            results.forEach((result, index) => {
                const assignmentId = assignmentIds[index];
                if (result.success && result.data) {
                    counts[assignmentId] = result.data.total_applications;
                } else {
                    counts[assignmentId] = 0;
                }
            });

            return counts;
        },
        enabled: assignmentIds.length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to check if freelancer has applied to multiple assignments
 * Useful for showing "Applied" badge on assignment cards
 * @param assignmentIds Array of assignment UUIDs
 * @returns Query result with map of assignment ID to boolean
 */
export function useHasApplied(assignmentIds: string[]) {
    return useQuery({
        queryKey: ['has-applied', assignmentIds],
        queryFn: async () => {
            const hasApplied: Record<string, boolean> = {};

            // Fetch freelancer's applications
            const result = await getMyApplications({ status: undefined }, { page: 1, pageSize: 100 });

            if (result.success && result.data) {
                const appliedAssignmentIds = new Set(
                    result.data.data
                        .filter((app) => app.status !== 'withdrawn')
                        .map((app) => app.assignment_id)
                );

                assignmentIds.forEach((id) => {
                    hasApplied[id] = appliedAssignmentIds.has(id);
                });
            } else {
                assignmentIds.forEach((id) => {
                    hasApplied[id] = false;
                });
            }

            return hasApplied;
        },
        enabled: assignmentIds.length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
