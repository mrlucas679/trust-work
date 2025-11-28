/**
 * @fileoverview PayFast Payment Gateway Integration
 * TrustWork Platform - South African Payment Processing
 */

import { supabase } from '../supabaseClient';
import type { 
  IPayFastTransaction, 
  IPayFastPaymentRequest,
  IPayFastWebhookData,
  PayFastPaymentStatus 
} from '@/types/gig';

// PayFast configuration - use environment variables in production
const PAYFAST_CONFIG = {
  merchantId: import.meta.env.VITE_PAYFAST_MERCHANT_ID || '',
  merchantKey: import.meta.env.VITE_PAYFAST_MERCHANT_KEY || '',
  passphrase: import.meta.env.VITE_PAYFAST_PASSPHRASE || '',
  sandbox: import.meta.env.VITE_PAYFAST_SANDBOX === 'true',
  baseUrl: import.meta.env.VITE_PAYFAST_SANDBOX === 'true' 
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process',
};

// ============================================================
// PAYFAST SIGNATURE GENERATION
// ============================================================

/**
 * Generate MD5 signature for PayFast request
 * Note: In production, this should be done server-side for security
 */
export function generatePayFastSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(data).sort();
  
  // Build parameter string
  let paramString = sortedKeys
    .filter(key => data[key] !== '' && key !== 'signature')
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  // Add passphrase if provided
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase)}`;
  }

  // Generate MD5 hash
  // Note: In browser, you'd use a library like crypto-js
  // For now, return empty - this should be done server-side
  console.warn('PayFast signature should be generated server-side');
  return '';
}

// ============================================================
// PAYFAST PAYMENT REQUEST
// ============================================================

/**
 * Create a PayFast payment request for escrow
 */
export async function createPayFastPayment(
  gigId: string,
  freelancerId: string,
  applicationId: string,
  amount: number,
  itemName: string,
  itemDescription: string,
  buyerEmail: string,
  buyerFirstName?: string,
  buyerLastName?: string
): Promise<{
  paymentUrl: string;
  paymentId: string;
  formData: IPayFastPaymentRequest;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to make a payment');
  }

  // Generate unique payment ID
  const paymentId = `TW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create the payment record first
  const { data: transaction, error } = await supabase
    .from('payfast_transactions')
    .insert({
      assignment_id: gigId,
      application_id: applicationId,
      payment_status: 'PENDING' as PayFastPaymentStatus,
      amount_gross: amount,
      amount_fee: 0,
      amount_net: amount,
      payer_id: user.id,
      recipient_id: freelancerId,
      item_name: itemName,
      item_description: itemDescription,
      email_address: buyerEmail,
      raw_data: { payment_id: paymentId },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating PayFast transaction:', error);
    throw new Error(`Failed to create payment: ${error.message}`);
  }

  // Build PayFast form data
  const formData: IPayFastPaymentRequest = {
    merchant_id: PAYFAST_CONFIG.merchantId,
    merchant_key: PAYFAST_CONFIG.merchantKey,
    return_url: `${window.location.origin}/payments/success?payment_id=${transaction.id}`,
    cancel_url: `${window.location.origin}/payments/cancel?payment_id=${transaction.id}`,
    notify_url: `${import.meta.env.VITE_API_URL || ''}/api/payfast/webhook`,
    m_payment_id: paymentId,
    amount: amount.toFixed(2),
    item_name: itemName.substring(0, 100), // Max 100 chars
    item_description: itemDescription?.substring(0, 255), // Max 255 chars
    email_address: buyerEmail,
    name_first: buyerFirstName,
    name_last: buyerLastName,
    custom_str1: gigId,
    custom_str2: freelancerId,
    custom_str3: applicationId,
  };

  // Generate signature (should be done server-side in production)
  // formData.signature = generatePayFastSignature(formData, PAYFAST_CONFIG.passphrase);

  return {
    paymentUrl: PAYFAST_CONFIG.baseUrl,
    paymentId: transaction.id,
    formData,
  };
}

// ============================================================
// PAYFAST TRANSACTION MANAGEMENT
// ============================================================

/**
 * Get PayFast transaction by ID
 */
export async function getPayFastTransaction(
  transactionId: string
): Promise<IPayFastTransaction | null> {
  const { data, error } = await supabase
    .from('payfast_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching PayFast transaction:', error);
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return data as IPayFastTransaction;
}

/**
 * Get PayFast transaction by PayFast payment ID
 */
export async function getPayFastTransactionByPfId(
  pfPaymentId: string
): Promise<IPayFastTransaction | null> {
  const { data, error } = await supabase
    .from('payfast_transactions')
    .select('*')
    .eq('pf_payment_id', pfPaymentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching PayFast transaction:', error);
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return data as IPayFastTransaction;
}

/**
 * Update PayFast transaction (typically from webhook)
 */
export async function updatePayFastTransaction(
  transactionId: string,
  updates: Partial<IPayFastTransaction>
): Promise<IPayFastTransaction> {
  const { data, error } = await supabase
    .from('payfast_transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating PayFast transaction:', error);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  return data as IPayFastTransaction;
}

/**
 * Get all PayFast transactions for a user
 */
export async function getMyPayFastTransactions(): Promise<IPayFastTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to view transactions');
  }

  const { data, error } = await supabase
    .from('payfast_transactions')
    .select('*')
    .or(`payer_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching PayFast transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return (data || []) as IPayFastTransaction[];
}

// ============================================================
// WEBHOOK PROCESSING (Server-side - placeholder)
// ============================================================

/**
 * Process PayFast webhook notification
 * Note: This should be implemented server-side for security
 */
export async function processPayFastWebhook(
  webhookData: IPayFastWebhookData
): Promise<{ success: boolean; message: string }> {
  // Verify signature (should be done server-side)
  // const isValid = verifyPayFastSignature(webhookData);
  
  // For now, just update the transaction
  const { m_payment_id, pf_payment_id, payment_status, amount_gross, amount_fee, amount_net } = webhookData;

  // Find the transaction by our payment ID stored in raw_data
  const { data: transactions, error: findError } = await supabase
    .from('payfast_transactions')
    .select('*')
    .contains('raw_data', { payment_id: m_payment_id });

  if (findError || !transactions || transactions.length === 0) {
    return { success: false, message: 'Transaction not found' };
  }

  const transaction = transactions[0];

  const updates = {
    pf_payment_id,
    payment_status: payment_status as PayFastPaymentStatus,
    amount_gross: parseFloat(amount_gross),
    amount_fee: parseFloat(amount_fee),
    amount_net: parseFloat(amount_net),
    payment_method: webhookData.payment_method || null,
    raw_data: webhookData,
  };

  const { error: updateError } = await supabase
    .from('payfast_transactions')
    .update(updates)
    .eq('id', transaction.id);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  return { success: true, message: 'Transaction updated successfully' };
}

// ============================================================
// PAYMENT FORM HELPER
// ============================================================

/**
 * Build PayFast form HTML for payment submission
 */
export function buildPayFastForm(
  formData: IPayFastPaymentRequest,
  autoSubmit: boolean = false
): string {
  const inputs = Object.entries(formData)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
    .join('\n');

  return `
    <form id="payfast-form" action="${PAYFAST_CONFIG.baseUrl}" method="POST">
      ${inputs}
      <button type="submit">Pay Now</button>
    </form>
    ${autoSubmit ? '<script>document.getElementById("payfast-form").submit();</script>' : ''}
  `;
}

// ============================================================
// PAYMENT STATUS HELPERS
// ============================================================

/**
 * Check if a payment was successful
 */
export function isPaymentComplete(status: PayFastPaymentStatus): boolean {
  return status === 'COMPLETE';
}

/**
 * Get human-readable payment status
 */
export function getPaymentStatusLabel(status: PayFastPaymentStatus): string {
  const labels: Record<PayFastPaymentStatus, string> = {
    COMPLETE: 'Payment Successful',
    FAILED: 'Payment Failed',
    PENDING: 'Payment Pending',
    CANCELLED: 'Payment Cancelled',
  };
  return labels[status] || 'Unknown Status';
}

/**
 * Get status color for UI
 */
export function getPaymentStatusColor(status: PayFastPaymentStatus): string {
  const colors: Record<PayFastPaymentStatus, string> = {
    COMPLETE: 'green',
    FAILED: 'red',
    PENDING: 'yellow',
    CANCELLED: 'gray',
  };
  return colors[status] || 'gray';
}
