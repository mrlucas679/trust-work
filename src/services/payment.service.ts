/**
 * @fileoverview Payment Service - Stripe and PayPal integration
 */

import { supabase } from '@/lib/supabaseClient';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface EscrowPayment {
  id: string;
  assignment_id: string;
  payer_id: string;
  recipient_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  payment_method: 'stripe' | 'paypal';
  payment_intent_id?: string;
  paypal_order_id?: string;
  held_at?: string;
  released_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a Stripe payment intent for escrow
 */
export async function createStripePaymentIntent(
  assignmentId: string,
  amount: number,
  currency: string = 'usd'
): Promise<PaymentIntent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Call your backend API to create payment intent
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({
      assignment_id: assignmentId,
      amount: Math.round(amount * 100), // Convert to cents
      currency,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
}

/**
 * Confirm a Stripe payment
 */
export async function confirmStripePayment(
  clientSecret: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe not initialized');

  const { error } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethodId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Create a PayPal order for escrow
 */
export async function createPayPalOrder(
  assignmentId: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ orderId: string; approvalUrl: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const response = await fetch('/api/payments/paypal/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({
      assignment_id: assignmentId,
      amount,
      currency,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create PayPal order');
  }

  return response.json();
}

/**
 * Capture a PayPal order
 */
export async function capturePayPalOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/payments/paypal/capture-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get escrow payment details
 */
export async function getEscrowPayment(paymentId: string): Promise<EscrowPayment> {
  const { data, error } = await supabase
    .from('escrow_payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) throw error;
  return data as EscrowPayment;
}

/**
 * Release escrow payment to recipient (after work completion)
 */
export async function releaseEscrowPayment(paymentId: string): Promise<void> {
  const response = await fetch('/api/payments/release-escrow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ payment_id: paymentId }),
  });

  if (!response.ok) {
    throw new Error('Failed to release escrow payment');
  }
}

/**
 * Refund escrow payment to payer (if work not completed)
 */
export async function refundEscrowPayment(paymentId: string, reason: string): Promise<void> {
  const response = await fetch('/api/payments/refund-escrow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ payment_id: paymentId, reason }),
  });

  if (!response.ok) {
    throw new Error('Failed to refund escrow payment');
  }
}

/**
 * Get payment history for user
 */
export async function getPaymentHistory(): Promise<EscrowPayment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('escrow_payments')
    .select('*')
    .or(`payer_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EscrowPayment[];
}

/**
 * Calculate platform fee (e.g., 10% of transaction)
 */
export function calculatePlatformFee(amount: number, feePercentage: number = 10): number {
  return Math.round(amount * (feePercentage / 100) * 100) / 100;
}

/**
 * Get total amount including fees
 */
export function getTotalWithFees(amount: number, feePercentage: number = 10): number {
  return amount + calculatePlatformFee(amount, feePercentage);
}
