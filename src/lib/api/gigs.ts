import { supabase } from '../supabaseClient';

export interface Gig {
    id: string;
    client_id: string;
    title: string;
    description: string;
    budget_min: number | null;
    budget_max: number | null;
    budget_type: 'fixed' | 'hourly' | 'negotiable';
    deadline: string | null;
    status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
    required_skills: string[];
    experience_level: 'entry' | 'intermediate' | 'expert' | 'any';
    job_type: 'full_time' | 'part_time' | 'contract' | 'freelance';
    location: string | null;
    remote_allowed: boolean;
    category: string | null;
    type: 'gig';
    requires_skill_test: boolean;
    skill_test_id: string | null;
    skill_test_template_id: string | null;
    skill_test_difficulty: 'entry' | 'mid' | 'senior' | null;
    skill_test_passing_score: number;
    applications_count: number;
    views_count: number;
    created_at: string;
    updated_at: string;
}

export interface GigFilters {
    status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    skills?: string[];
    location?: string;
    remoteAllowed?: boolean;
}

export interface CreateGigData {
    title: string;
    description: string;
    budget_min?: number;
    budget_max?: number;
    budget_type: 'fixed' | 'hourly' | 'negotiable';
    deadline?: string;
    required_skills: string[];
    experience_level?: 'entry' | 'intermediate' | 'expert' | 'any';
    location?: string;
    remote_allowed?: boolean;
    category?: string;
}

export interface GigApplication {
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

export interface ApplyToGigData {
    proposal: string;
    cover_letter?: string;
    bid_amount: number;
    estimated_duration: string;
    estimated_start_date?: string;
}

/**
 * Fetch all gigs with optional filters
 */
export async function getGigs(filters?: GigFilters): Promise<Gig[]> {
    let query = supabase
        .from('assignments')
        .select('*')
        .eq('type', 'gig');

    // Apply filters
    if (filters?.status) {
        query = query.eq('status', filters.status);
    } else {
        query = query.eq('status', 'open'); // Default to open gigs
    }

    if (filters?.category) {
        query = query.eq('category', filters.category);
    }

    if (filters?.minBudget) {
        query = query.gte('budget_min', filters.minBudget);
    }

    if (filters?.maxBudget) {
        query = query.lte('budget_max', filters.maxBudget);
    }

    if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.remoteAllowed !== undefined) {
        query = query.eq('remote_allowed', filters.remoteAllowed);
    }

    if (filters?.skills && filters.skills.length > 0) {
        query = query.overlaps('required_skills', filters.skills);
    }

    // Order by created date descending
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching gigs:', error);
        throw new Error(`Failed to fetch gigs: ${error.message}`);
    }

    return (data || []) as Gig[];
}

/**
 * Fetch a single gig by ID
 */
export async function getGigById(gigId: string): Promise<Gig | null> {
    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', gigId)
        .eq('type', 'gig')
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching gig:', error);
        throw new Error(`Failed to fetch gig: ${error.message}`);
    }

    return data as Gig;
}

/**
 * Create a new gig
 */
export async function createGig(gigData: CreateGigData): Promise<Gig> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to create a gig');
    }

    const { data, error } = await supabase
        .from('assignments')
        .insert({
            ...gigData,
            client_id: user.id,
            type: 'gig',
            requires_skill_test: false,
            status: 'open',
            job_type: gigData.experience_level ? 'freelance' : 'freelance',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating gig:', error);
        throw new Error(`Failed to create gig: ${error.message}`);
    }

    return data as Gig;
}

/**
 * Update an existing gig
 */
export async function updateGig(gigId: string, updates: Partial<CreateGigData>): Promise<Gig> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to update a gig');
    }

    const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', gigId)
        .eq('client_id', user.id) // Ensure user owns the gig
        .eq('type', 'gig')
        .select()
        .single();

    if (error) {
        console.error('Error updating gig:', error);
        throw new Error(`Failed to update gig: ${error.message}`);
    }

    return data as Gig;
}

/**
 * Delete a gig
 */
export async function deleteGig(gigId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to delete a gig');
    }

    const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', gigId)
        .eq('client_id', user.id) // Ensure user owns the gig
        .eq('type', 'gig');

    if (error) {
        console.error('Error deleting gig:', error);
        throw new Error(`Failed to delete gig: ${error.message}`);
    }
}

/**
 * Apply to a gig
 */
export async function applyToGig(gigId: string, applicationData: ApplyToGigData): Promise<GigApplication> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to apply to a gig');
    }

    const { data, error } = await supabase
        .from('applications')
        .insert({
            assignment_id: gigId,
            freelancer_id: user.id,
            ...applicationData,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error applying to gig:', error);
        throw new Error(`Failed to apply to gig: ${error.message}`);
    }

    return data as GigApplication;
}

/**
 * Get all applications for a gig (gig owner only)
 */
export async function getGigApplications(gigId: string): Promise<GigApplication[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to view applications');
    }

    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('assignment_id', gigId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching gig applications:', error);
        throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return (data || []) as GigApplication[];
}

/**
 * Get gigs posted by the current user
 */
export async function getMyGigs(): Promise<Gig[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to view your gigs');
    }

    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('client_id', user.id)
        .eq('type', 'gig')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching my gigs:', error);
        throw new Error(`Failed to fetch your gigs: ${error.message}`);
    }

    return (data || []) as Gig[];
}

/**
 * Update gig status (gig owner only)
 */
export async function updateGigStatus(
    gigId: string,
    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
): Promise<Gig> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to update gig status');
    }

    const { data, error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', gigId)
        .eq('client_id', user.id)
        .eq('type', 'gig')
        .select()
        .single();

    if (error) {
        console.error('Error updating gig status:', error);
        throw new Error(`Failed to update gig status: ${error.message}`);
    }

    return data as Gig;
}
