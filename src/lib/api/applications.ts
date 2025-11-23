/**
 * @fileoverview Applications (Job Applications) API functions
 */

import { supabase } from '../supabaseClient';
import type { Assignment } from './assignments';

export interface Application {
    id: string;
    assignment_id: string;
    freelancer_id: string;
    proposal: string;
    cover_letter: string | null;
    bid_amount: number | null;
    estimated_duration: string | null;
    estimated_start_date: string | null;
    status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';
    reviewed_at: string | null;
    reviewed_by: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApplicationWithDetails extends Application {
    assignment?: Assignment;
    freelancer?: {
        id: string;
        display_name: string;
        cv_url: string | null;
        skills: string[];
        experience_level: string;
        city: string;
        province: string;
    };
}

export interface CreateApplicationInput {
    assignment_id: string;
    proposal: string;
    cover_letter?: string;
    bid_amount?: number;
    estimated_duration?: string;
    estimated_start_date?: string;
}

export interface UpdateApplicationInput {
    proposal?: string;
    cover_letter?: string;
    bid_amount?: number;
    estimated_duration?: string;
    estimated_start_date?: string;
}

export interface ReviewApplicationInput {
    status: 'accepted' | 'rejected';
    rejection_reason?: string;
}

/**
 * Submit an application to an assignment
 */
export async function submitApplication(
    input: CreateApplicationInput
): Promise<Application> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    // Check if user already applied to this assignment
    const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('assignment_id', input.assignment_id)
        .eq('freelancer_id', user.user.id)
        .single();

    if (existing) {
        throw new Error('You have already applied to this assignment');
    }

    const { data, error } = await supabase
        .from('applications')
        .insert({
            freelancer_id: user.user.id,
            ...input,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to submit application: ${error.message}`);
    }

    return data as Application;
}

/**
 * Get applications by the current user (freelancer view)
 */
export async function getMyApplications(): Promise<ApplicationWithDetails[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      assignment:assignments(*)
    `)
        .eq('freelancer_id', user.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch your applications: ${error.message}`);
    }

    return (data as unknown as ApplicationWithDetails[]) || [];
}

/**
 * Get applications for a specific assignment (employer view)
 */
export async function getAssignmentApplications(
    assignmentId: string
): Promise<ApplicationWithDetails[]> {
    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      freelancer:profiles!applications_freelancer_id_fkey(
        id,
        display_name,
        cv_url,
        skills,
        experience_level,
        city,
        province
      )
    `)
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return (data as unknown as ApplicationWithDetails[]) || [];
}

/**
 * Get all applications for assignments owned by the current user (employer dashboard)
 */
export async function getApplicationsForMyAssignments(): Promise<ApplicationWithDetails[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      assignment:assignments!inner(
        id,
        title,
        client_id
      ),
      freelancer:profiles!applications_freelancer_id_fkey(
        id,
        display_name,
        cv_url,
        skills,
        experience_level,
        city,
        province
      )
    `)
        .eq('assignment.client_id', user.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return (data as unknown as ApplicationWithDetails[]) || [];
}

/**
 * Get a single application by ID
 */
export async function getApplication(id: string): Promise<ApplicationWithDetails> {
    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      assignment:assignments(*),
      freelancer:profiles!applications_freelancer_id_fkey(
        id,
        display_name,
        cv_url,
        skills,
        experience_level,
        city,
        province
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(`Failed to fetch application: ${error.message}`);
    }

    return data as unknown as ApplicationWithDetails;
}

/**
 * Update an application (freelancer can only update pending applications)
 */
export async function updateApplication(
    id: string,
    input: UpdateApplicationInput
): Promise<Application> {
    const { data, error } = await supabase
        .from('applications')
        .update(input)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update application: ${error.message}`);
    }

    return data as Application;
}

/**
 * Review an application (employer accepts or rejects)
 */
export async function reviewApplication(
    id: string,
    input: ReviewApplicationInput
): Promise<Application> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('applications')
        .update({
            status: input.status,
            rejection_reason: input.rejection_reason || null,
            reviewed_by: user.user.id,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to review application: ${error.message}`);
    }

    return data as Application;
}

/**
 * Withdraw an application (freelancer cancels their application)
 */
export async function withdrawApplication(id: string): Promise<Application> {
    const { data, error } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to withdraw application: ${error.message}`);
    }

    return data as Application;
}

/**
 * Delete an application (only pending applications can be deleted)
 */
export async function deleteApplication(id: string): Promise<void> {
    const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete application: ${error.message}`);
    }
}

/**
 * Check if the current user has already applied to an assignment
 */
export async function hasApplied(assignmentId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        return false;
    }

    const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('freelancer_id', user.user.id)
        .single();

    return !!data;
}

/**
 * Application statistics for dashboard
 */
export interface ApplicationStats {
    total: number;
    pending: number;
    reviewing: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
    thisWeek: number;
    responseRate: number;
}

/**
 * Get application statistics for the current user
 */
export async function getApplicationStats(freelancerId: string): Promise<ApplicationStats> {
    const { data, error } = await supabase
        .from('applications')
        .select('status, created_at')
        .eq('freelancer_id', freelancerId);

    if (error) {
        throw new Error(`Failed to fetch application stats: ${error.message}`);
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats: ApplicationStats = {
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        reviewing: data.filter(a => a.status === 'reviewing').length,
        accepted: data.filter(a => a.status === 'accepted').length,
        rejected: data.filter(a => a.status === 'rejected').length,
        withdrawn: data.filter(a => a.status === 'withdrawn').length,
        thisWeek: data.filter(a => new Date(a.created_at) > weekAgo).length,
        responseRate: 0
    };

    const responded = stats.accepted + stats.rejected;
    stats.responseRate = stats.total > 0 ? (responded / stats.total) * 100 : 0;

    return stats;
}

/**
 * Subscribe to application status changes for real-time updates
 * Returns an unsubscribe function
 */
export function subscribeToApplicationUpdates(
    freelancerId: string,
    onUpdate: (payload: { new: Application; old: Application; eventType: string }) => void
): () => void {
    const channel = supabase
        .channel('application-updates')
        .on(
            'postgres_changes' as const,
            {
                event: '*',
                schema: 'public',
                table: 'applications',
                filter: `freelancer_id=eq.${freelancerId}`
            } as const,
            (payload) => {
                onUpdate({
                    new: payload.new as Application,
                    old: payload.old as Application,
                    eventType: payload.eventType
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
