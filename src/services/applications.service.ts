/**
 * @fileoverview Applications Service - Real Supabase backend integration
 */

import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/database';

export type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];

/**
 * Get applications for a specific assignment (employer view)
 */
export async function getAssignmentApplications(assignmentId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, profiles!applications_freelancer_id_fkey(display_name, location, experience_level, skills)')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get applications submitted by the current user (freelancer view)
 */
export async function getMyApplications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('applications')
    .select('*, assignments!applications_assignment_id_fkey(title, budget_min, budget_max, deadline, status)')
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false});

  if (error) throw error;
  return data;
}

/**
 * Get a single application by ID
 */
export async function getApplication(id: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, profiles!applications_freelancer_id_fkey(*), assignments!applications_assignment_id_fkey(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Submit a new application
 */
export async function submitApplication(application: ApplicationInsert) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('applications')
    .insert({ ...application, freelancer_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an application (freelancer or employer)
 */
export async function updateApplication(id: string, updates: ApplicationUpdate) {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Withdraw an application (freelancer only)
 */
export async function withdrawApplication(id: string) {
  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept an application (employer only)
 */
export async function acceptApplication(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('applications')
    .update({ 
      status: 'accepted',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject an application (employer only)
 */
export async function rejectApplication(id: string, reason?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('applications')
    .update({ 
      status: 'rejected',
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if user has already applied to an assignment
 */
export async function hasApplied(assignmentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('assignment_id', assignmentId)
    .eq('freelancer_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error checking application:', error);
    return false;
  }

  return !!data;
}
