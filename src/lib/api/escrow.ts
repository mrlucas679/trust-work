/**
 * @fileoverview Escrow Payment API for secure payment handling
 * TrustWork Platform - Escrow System
 */

import { supabase } from '../supabaseClient';
import type { 
  IEscrowPayment, 
  EscrowStatus, 
  PayoutStatus,
  PLATFORM_FEE_PERCENTAGE 
} from '@/types/gig';

// Platform fee constant
const PLATFORM_FEE = 10; // 10%

// ============================================================
// ESCROW PAYMENT CRUD
// ============================================================

/**
 * Get all escrow payments for a gig
 */
export async function getEscrowPayments(gigId: string): Promise<IEscrowPayment[]> {
  const { data, error } = await supabase
    .from('escrow_payments')
    .select(`
      *,
      gig:assignments(id, title, status),
      payer:profiles!escrow_payments_payer_id_fkey(id, full_name, avatar_url),
      recipient:profiles!escrow_payments_recipient_id_fkey(id, full_name, avatar_url)
    `)
    .eq('assignment_id', gigId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching escrow payments:', error);
    throw new Error(`Failed to fetch escrow payments: ${error.message}`);
  }

  return (data || []) as IEscrowPayment[];
}

/**
 * Get a single escrow payment by ID
 */
export async function getEscrowPaymentById(paymentId: string): Promise<IEscrowPayment | null> {
  const { data, error } = await supabase
    .from('escrow_payments')
    .select(`
      *,
      gig:assignments(id, title, status),
      payer:profiles!escrow_payments_payer_id_fkey(id, full_name, avatar_url),
      recipient:profiles!escrow_payments_recipient_id_fkey(id, full_name, avatar_url)
    `)
    .eq('id', paymentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching escrow payment:', error);
    throw new Error(`Failed to fetch escrow payment: ${error.message}`);
  }

  return data as IEscrowPayment;
}

/**
 * Create a new escrow payment
 */
export async function createEscrowPayment(
  gigId: string,
  recipientId: string,
  amount: number,
  paymentMethod: 'stripe' | 'paypal' | 'payfast' = 'payfast'
): Promise<IEscrowPayment> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to create an escrow payment');
  }

  const platformFee = (amount * PLATFORM_FEE) / 100;

  const paymentData = {
    assignment_id: gigId,
    payer_id: user.id,
    recipient_id: recipientId,
    amount: amount,
    platform_fee: platformFee,
    payment_method: paymentMethod,
    status: 'pending' as EscrowStatus,
    payout_status: 'pending' as PayoutStatus,
  };

  const { data, error } = await supabase
    .from('escrow_payments')
    .insert(paymentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating escrow payment:', error);
    throw new Error(`Failed to create escrow payment: ${error.message}`);
  }

  return data as IEscrowPayment;
}

/**
 * Update escrow payment status
 */
export async function updateEscrowStatus(
  paymentId: string,
  status: EscrowStatus,
  additionalData?: Partial<IEscrowPayment>
): Promise<IEscrowPayment> {
  const updates: Record<string, unknown> = { status };

  // Add timestamps based on status change
  if (status === 'held') {
    updates.held_at = new Date().toISOString();
  } else if (status === 'released') {
    updates.released_at = new Date().toISOString();
  } else if (status === 'refunded') {
    updates.refunded_at = new Date().toISOString();
  }

  // Merge additional data
  if (additionalData) {
    Object.assign(updates, additionalData);
  }

  const { data, error } = await supabase
    .from('escrow_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating escrow status:', error);
    throw new Error(`Failed to update escrow payment: ${error.message}`);
  }

  return data as IEscrowPayment;
}

// ============================================================
// ESCROW WORKFLOW OPERATIONS
// ============================================================

/**
 * Hold payment in escrow (after successful PayFast payment)
 */
export async function holdPaymentInEscrow(
  paymentId: string,
  payfastTransactionId: string
): Promise<IEscrowPayment> {
  return updateEscrowStatus(paymentId, 'held', {
    payfast_transaction_id: payfastTransactionId,
  });
}

/**
 * Release payment from escrow to freelancer
 */
export async function releaseEscrowPayment(
  paymentId: string
): Promise<IEscrowPayment> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to release payment');
  }

  // Verify the escrow is in 'held' status
  const escrow = await getEscrowPaymentById(paymentId);
  
  if (!escrow) {
    throw new Error('Escrow payment not found');
  }

  if (escrow.status !== 'held') {
    throw new Error(`Cannot release payment in ${escrow.status} status`);
  }

  // Only payer (client) can release
  if (escrow.payer_id !== user.id) {
    throw new Error('Only the payer can release the payment');
  }

  return updateEscrowStatus(paymentId, 'released');
}

/**
 * Refund escrow payment to client
 */
export async function refundEscrowPayment(
  paymentId: string,
  reason?: string
): Promise<IEscrowPayment> {
  const escrow = await getEscrowPaymentById(paymentId);
  
  if (!escrow) {
    throw new Error('Escrow payment not found');
  }

  if (escrow.status !== 'held' && escrow.status !== 'pending') {
    throw new Error(`Cannot refund payment in ${escrow.status} status`);
  }

  return updateEscrowStatus(paymentId, 'refunded', {
    payout_error: reason,
  });
}

/**
 * Mark escrow as disputed
 */
export async function disputeEscrowPayment(
  paymentId: string
): Promise<IEscrowPayment> {
  return updateEscrowStatus(paymentId, 'disputed');
}

// ============================================================
// PAYOUT OPERATIONS
// ============================================================

/**
 * Initiate payout to freelancer's bank account
 */
export async function initiatePayout(
  paymentId: string
): Promise<IEscrowPayment> {
  const escrow = await getEscrowPaymentById(paymentId);
  
  if (!escrow) {
    throw new Error('Escrow payment not found');
  }

  if (escrow.status !== 'released') {
    throw new Error('Payment must be released before payout can be initiated');
  }

  const updates = {
    payout_status: 'processing' as PayoutStatus,
    payout_initiated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('escrow_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error initiating payout:', error);
    throw new Error(`Failed to initiate payout: ${error.message}`);
  }

  return data as IEscrowPayment;
}

/**
 * Complete payout (called after bank transfer success)
 */
export async function completePayout(
  paymentId: string,
  payoutReference: string
): Promise<IEscrowPayment> {
  const updates = {
    payout_status: 'completed' as PayoutStatus,
    payout_completed_at: new Date().toISOString(),
    payout_reference: payoutReference,
  };

  const { data, error } = await supabase
    .from('escrow_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error completing payout:', error);
    throw new Error(`Failed to complete payout: ${error.message}`);
  }

  return data as IEscrowPayment;
}

/**
 * Mark payout as failed
 */
export async function failPayout(
  paymentId: string,
  errorMessage: string
): Promise<IEscrowPayment> {
  const updates = {
    payout_status: 'failed' as PayoutStatus,
    payout_error: errorMessage,
  };

  const { data, error } = await supabase
    .from('escrow_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error marking payout as failed:', error);
    throw new Error(`Failed to update payout status: ${error.message}`);
  }

  return data as IEscrowPayment;
}

// ============================================================
// USER PAYMENT HISTORY
// ============================================================

/**
 * Get all payments for the current user (as payer or recipient)
 */
export async function getMyPayments(): Promise<{
  sent: IEscrowPayment[];
  received: IEscrowPayment[];
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to view your payments');
  }

  const [sentResult, receivedResult] = await Promise.all([
    supabase
      .from('escrow_payments')
      .select(`
        *,
        gig:assignments(id, title, status),
        recipient:profiles!escrow_payments_recipient_id_fkey(id, full_name, avatar_url)
      `)
      .eq('payer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('escrow_payments')
      .select(`
        *,
        gig:assignments(id, title, status),
        payer:profiles!escrow_payments_payer_id_fkey(id, full_name, avatar_url)
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  if (sentResult.error) {
    console.error('Error fetching sent payments:', sentResult.error);
    throw new Error(`Failed to fetch sent payments: ${sentResult.error.message}`);
  }

  if (receivedResult.error) {
    console.error('Error fetching received payments:', receivedResult.error);
    throw new Error(`Failed to fetch received payments: ${receivedResult.error.message}`);
  }

  return {
    sent: (sentResult.data || []) as IEscrowPayment[],
    received: (receivedResult.data || []) as IEscrowPayment[],
  };
}

/**
 * Get payment statistics for a user
 */
export async function getPaymentStats(userId?: string): Promise<{
  totalPaid: number;
  totalReceived: number;
  pendingPayments: number;
  heldInEscrow: number;
  pendingPayouts: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;

  if (!targetUserId) {
    throw new Error('User ID is required');
  }

  const { data: payments, error } = await supabase
    .from('escrow_payments')
    .select('*')
    .or(`payer_id.eq.${targetUserId},recipient_id.eq.${targetUserId}`);

  if (error) {
    console.error('Error fetching payment stats:', error);
    throw new Error(`Failed to fetch payment stats: ${error.message}`);
  }

  const stats = (payments || []).reduce(
    (acc, p) => {
      if (p.payer_id === targetUserId) {
        if (p.status === 'released' || p.status === 'held') {
          acc.totalPaid += p.amount;
        }
        if (p.status === 'pending') {
          acc.pendingPayments += p.amount;
        }
      }
      
      if (p.recipient_id === targetUserId) {
        if (p.payout_status === 'completed') {
          acc.totalReceived += p.amount - p.platform_fee;
        }
        if (p.status === 'held') {
          acc.heldInEscrow += p.amount - p.platform_fee;
        }
        if (p.status === 'released' && p.payout_status !== 'completed') {
          acc.pendingPayouts += p.amount - p.platform_fee;
        }
      }

      return acc;
    },
    { totalPaid: 0, totalReceived: 0, pendingPayments: 0, heldInEscrow: 0, pendingPayouts: 0 }
  );

  return stats;
}

// ============================================================
// PAYMENT CALCULATIONS
// ============================================================

/**
 * Calculate payment breakdown
 */
export function calculatePaymentBreakdown(grossAmount: number): {
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  freelancerReceives: number;
} {
  const platformFee = (grossAmount * PLATFORM_FEE) / 100;
  const netAmount = grossAmount - platformFee;

  return {
    grossAmount,
    platformFee,
    netAmount,
    freelancerReceives: netAmount,
  };
}
