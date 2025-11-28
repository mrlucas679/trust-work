/**
 * @fileoverview Milestone API for gig deliverables and progress tracking
 * TrustWork Platform - Milestone Management
 */

import { supabase } from '../supabaseClient';
import type { 
  IGigMilestone, 
  MilestoneStatus, 
  IDeliverableFile 
} from '@/types/gig';

// ============================================================
// MILESTONE CRUD OPERATIONS
// ============================================================

/**
 * Get all milestones for a gig
 */
export async function getMilestones(gigId: string): Promise<IGigMilestone[]> {
  const { data, error } = await supabase
    .from('gig_milestones')
    .select('*')
    .eq('gig_id', gigId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching milestones:', error);
    throw new Error(`Failed to fetch milestones: ${error.message}`);
  }

  return (data || []) as IGigMilestone[];
}

/**
 * Get a single milestone by ID
 */
export async function getMilestoneById(milestoneId: string): Promise<IGigMilestone | null> {
  const { data, error } = await supabase
    .from('gig_milestones')
    .select('*')
    .eq('id', milestoneId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching milestone:', error);
    throw new Error(`Failed to fetch milestone: ${error.message}`);
  }

  return data as IGigMilestone;
}

/**
 * Create milestones for a gig (batch operation)
 */
export async function createMilestones(
  gigId: string, 
  freelancerId: string,
  milestones: Array<{
    title: string;
    description?: string;
    percentage: number;
    amount: number;
    dueDate?: string;
  }>
): Promise<IGigMilestone[]> {
  const milestonesData = milestones.map((m, index) => ({
    gig_id: gigId,
    freelancer_id: freelancerId,
    title: m.title,
    description: m.description || null,
    percentage: m.percentage,
    amount: m.amount,
    due_date: m.dueDate || null,
    order_index: index,
    status: 'pending' as MilestoneStatus,
    deliverable_files: [],
    revision_requested: false,
    revision_count: 0,
    max_revisions: 3,
    payment_released: false,
  }));

  const { data, error } = await supabase
    .from('gig_milestones')
    .insert(milestonesData)
    .select();

  if (error) {
    console.error('Error creating milestones:', error);
    throw new Error(`Failed to create milestones: ${error.message}`);
  }

  return data as IGigMilestone[];
}

/**
 * Update milestone status
 */
export async function updateMilestoneStatus(
  milestoneId: string, 
  status: MilestoneStatus,
  additionalData?: Partial<IGigMilestone>
): Promise<IGigMilestone> {
  const updates: Record<string, unknown> = { status };

  // Add timestamps based on status change
  if (status === 'in_progress') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'submitted') {
    updates.submitted_at = new Date().toISOString();
  } else if (status === 'approved') {
    updates.approved_at = new Date().toISOString();
  }

  // Merge additional data
  if (additionalData) {
    Object.assign(updates, additionalData);
  }

  const { data, error } = await supabase
    .from('gig_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) {
    console.error('Error updating milestone status:', error);
    throw new Error(`Failed to update milestone: ${error.message}`);
  }

  return data as IGigMilestone;
}

// ============================================================
// MILESTONE SUBMISSION (Freelancer)
// ============================================================

/**
 * Submit a milestone for client review
 */
export async function submitMilestone(
  milestoneId: string,
  submission: {
    deliverableFiles?: IDeliverableFile[];
    deliverableLinks?: string[];
    submissionNotes?: string;
  }
): Promise<IGigMilestone> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to submit a milestone');
  }

  const updates = {
    status: 'submitted' as MilestoneStatus,
    submitted_at: new Date().toISOString(),
    deliverable_files: submission.deliverableFiles || [],
    deliverable_links: submission.deliverableLinks || [],
    submission_notes: submission.submissionNotes || null,
  };

  const { data, error } = await supabase
    .from('gig_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .eq('freelancer_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error submitting milestone:', error);
    throw new Error(`Failed to submit milestone: ${error.message}`);
  }

  return data as IGigMilestone;
}

// ============================================================
// MILESTONE REVIEW (Client)
// ============================================================

/**
 * Approve a milestone submission
 */
export async function approveMilestone(
  milestoneId: string,
  clientNotes?: string
): Promise<IGigMilestone> {
  const updates = {
    status: 'approved' as MilestoneStatus,
    approved_at: new Date().toISOString(),
    client_notes: clientNotes || null,
  };

  const { data, error } = await supabase
    .from('gig_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) {
    console.error('Error approving milestone:', error);
    throw new Error(`Failed to approve milestone: ${error.message}`);
  }

  return data as IGigMilestone;
}

/**
 * Reject a milestone submission
 */
export async function rejectMilestone(
  milestoneId: string,
  clientNotes: string
): Promise<IGigMilestone> {
  const updates = {
    status: 'rejected' as MilestoneStatus,
    client_notes: clientNotes,
  };

  const { data, error } = await supabase
    .from('gig_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting milestone:', error);
    throw new Error(`Failed to reject milestone: ${error.message}`);
  }

  return data as IGigMilestone;
}

/**
 * Request revision for a milestone
 */
export async function requestMilestoneRevision(
  milestoneId: string,
  revisionNotes: string
): Promise<IGigMilestone> {
  // First get current milestone to check revision count
  const milestone = await getMilestoneById(milestoneId);
  
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.revision_count >= milestone.max_revisions) {
    throw new Error(`Maximum revisions (${milestone.max_revisions}) reached for this milestone`);
  }

  const updates = {
    status: 'revision_requested' as MilestoneStatus,
    client_notes: revisionNotes,
    revision_requested: true,
    revision_count: milestone.revision_count + 1,
  };

  const { data, error } = await supabase
    .from('gig_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) {
    console.error('Error requesting revision:', error);
    throw new Error(`Failed to request revision: ${error.message}`);
  }

  return data as IGigMilestone;
}

// ============================================================
// MILESTONE PAYMENT
// ============================================================

/**
 * Mark milestone payment as released
 */
export async function releaseMilestonePayment(
  milestoneId: string,
  escrowPaymentId: string
): Promise<IGigMilestone> {
  const updates = {
    payment_released: true,
    payment_released_at: new Date().toISOString(),
    escrow_payment_id: escrowPaymentId,
  };

  const { data, error } = await supabase
    .from('gig_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) {
    console.error('Error releasing milestone payment:', error);
    throw new Error(`Failed to release payment: ${error.message}`);
  }

  return data as IGigMilestone;
}

// ============================================================
// MILESTONE STATS
// ============================================================

/**
 * Get milestone progress stats for a gig
 */
export async function getMilestoneStats(gigId: string): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentageComplete: number;
  totalAmount: number;
  releasedAmount: number;
}> {
  const milestones = await getMilestones(gigId);

  const stats = milestones.reduce(
    (acc, m) => {
      acc.total++;
      acc.totalAmount += m.amount;

      if (m.status === 'approved') {
        acc.completed++;
        if (m.payment_released) {
          acc.releasedAmount += m.amount;
        }
      } else if (m.status === 'in_progress' || m.status === 'submitted' || m.status === 'revision_requested') {
        acc.inProgress++;
      } else {
        acc.pending++;
      }

      return acc;
    },
    { total: 0, completed: 0, inProgress: 0, pending: 0, totalAmount: 0, releasedAmount: 0 }
  );

  return {
    ...stats,
    percentageComplete: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
  };
}
