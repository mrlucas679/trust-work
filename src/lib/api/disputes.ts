/**
 * @fileoverview Dispute Management API
 * TrustWork Platform - Dispute Resolution System
 */

import { supabase } from '../supabaseClient';
import type { 
  IDispute, 
  DisputeStatus, 
  DisputeReason,
  ResolutionDecision,
  IDisputeEvidence 
} from '@/types/gig';

// ============================================================
// DISPUTE CRUD OPERATIONS
// ============================================================

/**
 * Get all disputes for a user
 */
export async function getMyDisputes(): Promise<IDispute[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to view disputes');
  }

  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      gig:assignments(id, title, status, budget_min, budget_max),
      initiator:profiles!disputes_initiated_by_fkey(id, full_name, avatar_url),
      respondent:profiles!disputes_respondent_id_fkey(id, full_name, avatar_url)
    `)
    .or(`initiated_by.eq.${user.id},respondent_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching disputes:', error);
    throw new Error(`Failed to fetch disputes: ${error.message}`);
  }

  return (data || []) as IDispute[];
}

/**
 * Get a single dispute by ID
 */
export async function getDisputeById(disputeId: string): Promise<IDispute | null> {
  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      gig:assignments(id, title, status, budget_min, budget_max),
      initiator:profiles!disputes_initiated_by_fkey(id, full_name, avatar_url),
      respondent:profiles!disputes_respondent_id_fkey(id, full_name, avatar_url)
    `)
    .eq('id', disputeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching dispute:', error);
    throw new Error(`Failed to fetch dispute: ${error.message}`);
  }

  return data as IDispute;
}

/**
 * Get disputes for a specific gig
 */
export async function getGigDisputes(gigId: string): Promise<IDispute[]> {
  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      initiator:profiles!disputes_initiated_by_fkey(id, full_name, avatar_url),
      respondent:profiles!disputes_respondent_id_fkey(id, full_name, avatar_url)
    `)
    .eq('gig_id', gigId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gig disputes:', error);
    throw new Error(`Failed to fetch disputes: ${error.message}`);
  }

  return (data || []) as IDispute[];
}

// ============================================================
// CREATE DISPUTE
// ============================================================

/**
 * Create a new dispute
 */
export async function createDispute(
  gigId: string,
  respondentId: string,
  reason: DisputeReason,
  title: string,
  description: string,
  escrowPaymentId?: string,
  evidence?: IDisputeEvidence[]
): Promise<IDispute> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to create a dispute');
  }

  // Calculate response deadline (7 days from now)
  const responseDeadline = new Date();
  responseDeadline.setDate(responseDeadline.getDate() + 7);

  const disputeData = {
    gig_id: gigId,
    escrow_payment_id: escrowPaymentId || null,
    initiated_by: user.id,
    respondent_id: respondentId,
    reason,
    title,
    description,
    evidence_files: evidence || [],
    status: 'open' as DisputeStatus,
    response_deadline: responseDeadline.toISOString(),
  };

  const { data, error } = await supabase
    .from('disputes')
    .insert(disputeData)
    .select(`
      *,
      gig:assignments(id, title, status),
      initiator:profiles!disputes_initiated_by_fkey(id, full_name, avatar_url),
      respondent:profiles!disputes_respondent_id_fkey(id, full_name, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Error creating dispute:', error);
    throw new Error(`Failed to create dispute: ${error.message}`);
  }

  return data as IDispute;
}

// ============================================================
// DISPUTE RESPONSES
// ============================================================

/**
 * Submit response to a dispute (respondent)
 */
export async function submitDisputeResponse(
  disputeId: string,
  responseEvidence: string,
  additionalEvidence?: IDisputeEvidence[]
): Promise<IDispute> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to respond to a dispute');
  }

  // Verify user is the respondent
  const dispute = await getDisputeById(disputeId);
  
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  if (dispute.respondent_id !== user.id) {
    throw new Error('Only the respondent can submit a response');
  }

  const updates: Partial<IDispute> = {
    respondent_evidence: responseEvidence,
    status: 'under_review' as DisputeStatus,
  };

  // Add any additional evidence files
  if (additionalEvidence && additionalEvidence.length > 0) {
    updates.evidence_files = [...(dispute.evidence_files || []), ...additionalEvidence];
  }

  const { data, error } = await supabase
    .from('disputes')
    .update(updates)
    .eq('id', disputeId)
    .select()
    .single();

  if (error) {
    console.error('Error submitting dispute response:', error);
    throw new Error(`Failed to submit response: ${error.message}`);
  }

  return data as IDispute;
}

/**
 * Add evidence to a dispute
 */
export async function addDisputeEvidence(
  disputeId: string,
  evidence: IDisputeEvidence
): Promise<IDispute> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to add evidence');
  }

  const dispute = await getDisputeById(disputeId);
  
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Verify user is a party to the dispute
  if (dispute.initiated_by !== user.id && dispute.respondent_id !== user.id) {
    throw new Error('You are not authorized to add evidence to this dispute');
  }

  const updatedEvidence = [...(dispute.evidence_files || []), evidence];

  const { data, error } = await supabase
    .from('disputes')
    .update({ evidence_files: updatedEvidence })
    .eq('id', disputeId)
    .select()
    .single();

  if (error) {
    console.error('Error adding evidence:', error);
    throw new Error(`Failed to add evidence: ${error.message}`);
  }

  return data as IDispute;
}

// ============================================================
// DISPUTE STATUS UPDATES
// ============================================================

/**
 * Update dispute status
 */
export async function updateDisputeStatus(
  disputeId: string,
  status: DisputeStatus
): Promise<IDispute> {
  const updates: Record<string, unknown> = { status };

  if (status === 'under_review') {
    updates.reviewed_at = new Date().toISOString();
  } else if (status === 'resolved' || status === 'closed') {
    updates.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('disputes')
    .update(updates)
    .eq('id', disputeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating dispute status:', error);
    throw new Error(`Failed to update dispute: ${error.message}`);
  }

  return data as IDispute;
}

// ============================================================
// DISPUTE RESOLUTION (Admin/Mutual)
// ============================================================

/**
 * Resolve a dispute
 */
export async function resolveDispute(
  disputeId: string,
  resolution: {
    decision: ResolutionDecision;
    summary: string;
    paymentAdjustment?: number;
  }
): Promise<IDispute> {
  const updates = {
    status: 'resolved' as DisputeStatus,
    resolution_decision: resolution.decision,
    resolution_summary: resolution.summary,
    payment_adjustment: resolution.paymentAdjustment || null,
    resolved_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('disputes')
    .update(updates)
    .eq('id', disputeId)
    .select()
    .single();

  if (error) {
    console.error('Error resolving dispute:', error);
    throw new Error(`Failed to resolve dispute: ${error.message}`);
  }

  return data as IDispute;
}

/**
 * Propose mutual resolution
 */
export async function proposeMutualResolution(
  disputeId: string,
  proposal: string
): Promise<IDispute> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to propose resolution');
  }

  const dispute = await getDisputeById(disputeId);
  
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Determine which party is proposing
  const isInitiator = dispute.initiated_by === user.id;
  const evidenceField = isInitiator ? 'initiator_evidence' : 'respondent_evidence';

  const { data, error } = await supabase
    .from('disputes')
    .update({ 
      [evidenceField]: proposal,
      status: 'awaiting_response' as DisputeStatus,
    })
    .eq('id', disputeId)
    .select()
    .single();

  if (error) {
    console.error('Error proposing resolution:', error);
    throw new Error(`Failed to propose resolution: ${error.message}`);
  }

  return data as IDispute;
}

// ============================================================
// DISPUTE HELPERS
// ============================================================

/**
 * Get dispute reason label
 */
export function getDisputeReasonLabel(reason: DisputeReason): string {
  const labels: Record<DisputeReason, string> = {
    quality_issue: 'Quality Issue',
    non_delivery: 'Non-Delivery',
    scope_change: 'Scope Change',
    payment_issue: 'Payment Issue',
    communication_breakdown: 'Communication Breakdown',
    deadline_missed: 'Deadline Missed',
    unauthorized_use: 'Unauthorized Use',
    other: 'Other',
  };
  return labels[reason] || reason;
}

/**
 * Get dispute status label
 */
export function getDisputeStatusLabel(status: DisputeStatus): string {
  const labels: Record<DisputeStatus, string> = {
    open: 'Open',
    under_review: 'Under Review',
    awaiting_response: 'Awaiting Response',
    resolved: 'Resolved',
    escalated: 'Escalated',
    closed: 'Closed',
  };
  return labels[status] || status;
}

/**
 * Get resolution decision label
 */
export function getResolutionLabel(decision: ResolutionDecision): string {
  const labels: Record<ResolutionDecision, string> = {
    favor_freelancer: 'In Favor of Freelancer',
    favor_client: 'In Favor of Client',
    split_payment: 'Split Payment',
    no_fault: 'No Fault Found',
    mutual_agreement: 'Mutual Agreement',
  };
  return labels[decision] || decision;
}

/**
 * Check if dispute can be responded to
 */
export function canRespondToDispute(dispute: IDispute, userId: string): boolean {
  return (
    dispute.respondent_id === userId &&
    dispute.status === 'open' &&
    (!dispute.response_deadline || new Date(dispute.response_deadline) > new Date())
  );
}

/**
 * Check if dispute is past response deadline
 */
export function isDisputeOverdue(dispute: IDispute): boolean {
  if (!dispute.response_deadline) return false;
  return new Date(dispute.response_deadline) < new Date();
}
