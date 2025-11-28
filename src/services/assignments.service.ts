/**
 * @fileoverview Assignments Service - Real Supabase backend integration
 * Replaces mock data with actual database queries
 */

import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/database';

export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type AssignmentInsert = Database['public']['Tables']['assignments']['Insert'];
export type AssignmentUpdate = Database['public']['Tables']['assignments']['Update'];

export interface AssignmentFilters {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string;
  jobType?: string;
  location?: string;
  remoteAllowed?: boolean;
  skills?: string[];
  searchQuery?: string;
  status?: string;
}

/**
 * Fetch assignments with optional filters
 */
export async function getAssignments(filters?: AssignmentFilters) {
  let query = supabase
    .from('assignments')
    .select('*, profiles!assignments_client_id_fkey(display_name, business_name, business_verified, verification_badge_level)')
    .eq('status', filters?.status || 'open')
    .order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.minBudget) {
    query = query.gte('budget_min', filters.minBudget);
  }

  if (filters?.maxBudget) {
    query = query.lte('budget_max', filters.maxBudget);
  }

  if (filters?.experienceLevel && filters.experienceLevel !== 'any') {
    query = query.eq('experience_level', filters.experienceLevel);
  }

  if (filters?.jobType) {
    query = query.eq('job_type', filters.jobType);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.remoteAllowed !== undefined) {
    query = query.eq('remote_allowed', filters.remoteAllowed);
  }

  if (filters?.skills && filters.skills.length > 0) {
    query = query.contains('required_skills', filters.skills);
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Get a single assignment by ID
 */
export async function getAssignment(id: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*, profiles!assignments_client_id_fkey(display_name, business_name, business_verified, verification_badge_level)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new assignment (employers only)
 */
export async function createAssignment(assignment: AssignmentInsert) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('assignments')
    .insert({ ...assignment, client_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing assignment (owner only)
 */
export async function updateAssignment(id: string, updates: AssignmentUpdate) {
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an assignment (owner only)
 */
export async function deleteAssignment(id: string) {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get assignments created by the current user
 */
export async function getMyAssignments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Increment view count for an assignment
 */
export async function incrementAssignmentViews(id: string) {
  const { error } = await supabase.rpc('increment_assignment_views', { assignment_id: id });
  if (error) console.error('Failed to increment views:', error);
}
