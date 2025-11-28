/**
 * @fileoverview Assignments (Job/Gig Postings) API functions
 */

import { supabase } from '../supabaseClient';

export interface Assignment {
    id: string;
    client_id: string;
    title: string;
    description: string;
    budget_min: number | null;
    budget_max: number | null;
    budget_type: 'fixed' | 'hourly' | 'negotiable';
    deadline: string | null;
    status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'closed';
    required_skills: string[];
    experience_level: 'entry' | 'intermediate' | 'expert' | 'any';
    job_type: 'full_time' | 'part_time' | 'contract' | 'freelance';
    location: string | null;
    remote_allowed: boolean;
    category: string | null;
    applications_count: number;
    views_count: number;
    type: 'job' | 'gig';
    requires_skill_test: boolean;
    skill_test_id: string | null;
    skill_test_template_id: string | null;
    skill_test_difficulty: 'entry' | 'mid' | 'senior' | null;
    skill_test_passing_score: number;
    created_at: string;
    updated_at: string;
    urgent?: boolean;
    flagged?: boolean;
    duration_estimate?: string;
    required_certification_level?: string | null;
}

export interface CreateAssignmentInput {
    title: string;
    description: string;
    budget_min?: number;
    budget_max?: number;
    budget_type?: 'fixed' | 'hourly' | 'negotiable';
    deadline?: string;
    status?: 'draft' | 'open';
    required_skills: string[];
    experience_level?: 'entry' | 'intermediate' | 'expert' | 'any';
    job_type?: 'full_time' | 'part_time' | 'contract' | 'freelance';
    location?: string;
    remote_allowed?: boolean;
    category?: string;
    type?: 'job' | 'gig';
    requires_skill_test?: boolean;
    skill_test_id?: string;
    urgent?: boolean;
}

export interface UpdateAssignmentInput {
    title?: string;
    description?: string;
    budget_min?: number;
    budget_max?: number;
    budget_type?: 'fixed' | 'hourly' | 'negotiable';
    deadline?: string;
    status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
    required_skills?: string[];
    experience_level?: 'entry' | 'intermediate' | 'expert' | 'any';
    job_type?: 'full_time' | 'part_time' | 'contract' | 'freelance';
    location?: string;
    remote_allowed?: boolean;
    category?: string;
}

export interface AssignmentFilters {
    category?: string;
    experience_level?: string;
    job_type?: string;
    remote_allowed?: boolean;
    skills?: string[];
    budget_min?: number;
    budget_max?: number;
    status?: string;
    type?: 'job' | 'gig';
}

/**
 * Create a new assignment (job posting)
 */
export async function createAssignment(input: CreateAssignmentInput): Promise<Assignment> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('assignments')
        .insert({
            client_id: user.user.id,
            ...input,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create assignment: ${error.message}`);
    }

    return data as Assignment;
}

/**
 * Get all assignments with optional filters
 */
export async function getAssignments(
    filters: AssignmentFilters = {},
    limit = 50,
    offset = 0
): Promise<{ data: Assignment[]; count: number }> {
    let query = supabase
        .from('assignments')
        .select('*', { count: 'exact' });

    // Apply filters
    if (filters.type) {
        query = query.eq('type', filters.type);
    }
    if (filters.category) {
        query = query.eq('category', filters.category);
    }
    if (filters.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
    }
    if (filters.job_type) {
        query = query.eq('job_type', filters.job_type);
    }
    if (filters.remote_allowed !== undefined) {
        query = query.eq('remote_allowed', filters.remote_allowed);
    }
    if (filters.status) {
        query = query.eq('status', filters.status);
    } else {
        // Default to showing only open assignments
        query = query.eq('status', 'open');
    }
    if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('required_skills', filters.skills);
    }
    if (filters.budget_min !== undefined) {
        query = query.gte('budget_min', filters.budget_min);
    }
    if (filters.budget_max !== undefined) {
        query = query.lte('budget_max', filters.budget_max);
    }

    // Apply pagination and ordering
    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        throw new Error(`Failed to fetch assignments: ${error.message}`);
    }

    return {
        data: (data as Assignment[]) || [],
        count: count || 0,
    };
}

/**
 * Get a single assignment by ID
 */
export async function getAssignment(id: string): Promise<Assignment> {
    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(`Failed to fetch assignment: ${error.message}`);
    }

    // Increment view count (fire and forget)
    supabase
        .from('assignments')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id)
        .then(() => { });

    return data as Assignment;
}

/**
 * Get assignments created by the current user
 */
export async function getMyAssignments(): Promise<Assignment[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('client_id', user.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch your assignments: ${error.message}`);
    }

    return (data as Assignment[]) || [];
}

/**
 * Update an assignment
 */
export async function updateAssignment(
    id: string,
    input: UpdateAssignmentInput
): Promise<Assignment> {
    const { data, error } = await supabase
        .from('assignments')
        .update(input)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update assignment: ${error.message}`);
    }

    return data as Assignment;
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(id: string): Promise<void> {
    const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete assignment: ${error.message}`);
    }
}

/**
 * Close an assignment (change status to completed)
 */
export async function closeAssignment(id: string): Promise<Assignment> {
    return updateAssignment(id, { status: 'completed' });
}

/**
 * Cancel an assignment
 */
export async function cancelAssignment(id: string): Promise<Assignment> {
    return updateAssignment(id, { status: 'cancelled' });
}

/**
 * Publish a draft assignment (change status to open)
 */
export async function publishAssignment(id: string): Promise<Assignment> {
    return updateAssignment(id, { status: 'open' });
}

/**
 * Get only job postings (type='job')
 */
export async function getJobs(
    filters: Omit<AssignmentFilters, 'type'> = {},
    limit = 50,
    offset = 0
): Promise<{ data: Assignment[]; count: number }> {
    return getAssignments({ ...filters, type: 'job' }, limit, offset);
}
