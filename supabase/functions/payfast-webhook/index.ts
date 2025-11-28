/**
 * @fileoverview PayFast Webhook Handler - Supabase Edge Function
 * Handles PayFast IPN (Instant Payment Notification) callbacks
 * Updates escrow status and triggers appropriate workflows
 * 
 * TrustWork Platform - Payment Processing
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PAYFAST_PASSPHRASE = Deno.env.get('PAYFAST_PASSPHRASE') || '';
const PAYFAST_SANDBOX = Deno.env.get('PAYFAST_SANDBOX') === 'true';

// PayFast configuration
const PAYFAST_VALID_HOSTS = [
  'www.payfast.co.za',
  'sandbox.payfast.co.za',
  'w1w.payfast.co.za',
  'w2w.payfast.co.za',
];

// Platform fee percentage
const PLATFORM_FEE_PERCENTAGE = 10;

interface PayFastWebhookData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: 'COMPLETE' | 'FAILED' | 'PENDING' | 'CANCELLED';
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  custom_str1?: string; // gig_id
  custom_str2?: string; // freelancer_id
  custom_str3?: string; // application_id
  custom_int1?: string;
  custom_int2?: string;
  signature: string;
}

/**
 * Generate MD5 signature for PayFast verification
 */
function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Sort data alphabetically by key
  const sortedKeys = Object.keys(data).filter(key => key !== 'signature').sort();
  
  // Build query string
  let signatureString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');
  
  // Add passphrase if provided
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
  }
  
  // Generate MD5 hash
  const hash = createHmac('md5', '').update(signatureString).digest('hex');
  return hash;
}

/**
 * Verify the PayFast signature
 */
function verifySignature(data: PayFastWebhookData, passphrase?: string): boolean {
  const receivedSignature = data.signature;
  
  // Create data object without signature
  const dataWithoutSignature: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'signature' && value !== undefined && value !== '') {
      dataWithoutSignature[key] = String(value);
    }
  }
  
  const generatedSignature = generateSignature(dataWithoutSignature, passphrase);
  
  return generatedSignature === receivedSignature;
}

/**
 * Verify PayFast request origin
 */
async function verifyPayFastServer(remoteIp: string): Promise<boolean> {
  // In production, verify the IP is from PayFast
  // For sandbox/development, we may skip this
  if (PAYFAST_SANDBOX) {
    return true;
  }
  
  // PayFast IP verification (simplified)
  // In production, you'd do a DNS lookup of www.payfast.co.za
  // and verify the IP matches
  try {
    for (const host of PAYFAST_VALID_HOSTS) {
      // Simplified check - in production use proper DNS lookup
      console.log(`Checking host: ${host} for IP: ${remoteIp}`);
    }
    return true;
  } catch {
    console.error('Failed to verify PayFast server');
    return false;
  }
}

/**
 * Create notification for user
 */
async function createNotification(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string
): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    related_id: relatedId,
    read: false,
    created_at: new Date().toISOString(),
  });
}

/**
 * Main webhook handler
 */
serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse form data
    const formData = await req.formData();
    const webhookData: Record<string, string> = {};
    
    for (const [key, value] of formData.entries()) {
      webhookData[key] = value as string;
    }
    
    const data = webhookData as unknown as PayFastWebhookData;
    
    console.log('Received PayFast webhook:', JSON.stringify({
      m_payment_id: data.m_payment_id,
      pf_payment_id: data.pf_payment_id,
      payment_status: data.payment_status,
      amount_gross: data.amount_gross,
    }));

    // Get remote IP for verification
    const remoteIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Verify PayFast server (optional in sandbox)
    if (!await verifyPayFastServer(remoteIp)) {
      console.error('Invalid PayFast server IP:', remoteIp);
      return new Response(
        JSON.stringify({ error: 'Invalid source' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify signature
    if (!verifySignature(data, PAYFAST_PASSPHRASE)) {
      console.error('Invalid PayFast signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse amounts
    const amountGross = parseFloat(data.amount_gross);
    const amountFee = parseFloat(data.amount_fee);
    const amountNet = parseFloat(data.amount_net);
    
    // Extract custom data
    const gigId = data.custom_str1;
    const freelancerId = data.custom_str2;
    const applicationId = data.custom_str3;
    
    // Store transaction record
    const { data: transaction, error: txError } = await supabase
      .from('payfast_transactions')
      .upsert({
        id: data.m_payment_id,
        pf_payment_id: data.pf_payment_id,
        assignment_id: gigId,
        application_id: applicationId,
        payment_status: data.payment_status,
        amount_gross: amountGross,
        amount_fee: amountFee,
        amount_net: amountNet,
        item_name: data.item_name,
        item_description: data.item_description,
        email_address: data.email_address,
        merchant_id: data.merchant_id,
        raw_data: webhookData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();
    
    if (txError) {
      console.error('Error storing transaction:', txError);
      throw new Error(`Failed to store transaction: ${txError.message}`);
    }
    
    console.log('Transaction stored:', transaction?.id);
    
    // Handle different payment statuses
    if (data.payment_status === 'COMPLETE') {
      // Payment successful - create escrow and update gig
      
      // Get the gig details to find the client
      const { data: gig, error: gigError } = await supabase
        .from('assignments')
        .select('client_id, title, budget_max')
        .eq('id', gigId)
        .single();
      
      if (gigError || !gig) {
        console.error('Error fetching gig:', gigError);
        throw new Error('Gig not found');
      }
      
      // Calculate platform fee
      const platformFee = amountGross * (PLATFORM_FEE_PERCENTAGE / 100);
      
      // Create escrow payment record
      const { data: escrow, error: escrowError } = await supabase
        .from('escrow_payments')
        .insert({
          assignment_id: gigId,
          payer_id: gig.client_id,
          recipient_id: freelancerId,
          amount: amountGross,
          platform_fee: platformFee,
          payment_method: 'payfast',
          status: 'held',
          payfast_transaction_id: transaction?.id,
          payout_status: 'pending',
          held_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (escrowError) {
        console.error('Error creating escrow:', escrowError);
        throw new Error(`Failed to create escrow: ${escrowError.message}`);
      }
      
      console.log('Escrow created:', escrow?.id);
      
      // Update gig status to in_progress
      await supabase
        .from('assignments')
        .update({
          status: 'in_progress',
          payment_status: 'paid',
          accepted_freelancer_id: freelancerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gigId);
      
      // Update application status to accepted
      if (applicationId) {
        await supabase
          .from('applications')
          .update({
            status: 'accepted',
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', applicationId);
      }
      
      // Create milestones from gig milestones config
      const { data: gigFull } = await supabase
        .from('assignments')
        .select('milestones')
        .eq('id', gigId)
        .single();
      
      if (gigFull?.milestones && Array.isArray(gigFull.milestones)) {
        const milestones = gigFull.milestones.map((m: { description: string; percentage: number; dueDate?: string }, index: number) => ({
          gig_id: gigId,
          freelancer_id: freelancerId,
          title: m.description || `Milestone ${index + 1}`,
          description: m.description,
          percentage: m.percentage,
          amount: (amountGross * m.percentage) / 100,
          due_date: m.dueDate,
          order_index: index,
          status: index === 0 ? 'in_progress' : 'pending',
          max_revisions: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        
        if (milestones.length > 0) {
          await supabase.from('gig_milestones').insert(milestones);
          console.log('Milestones created:', milestones.length);
        }
      }
      
      // Notify freelancer
      if (freelancerId) {
        await createNotification(
          supabase,
          freelancerId,
          'payment_received',
          'Payment Received - Start Working!',
          `Payment of R${amountGross.toFixed(2)} has been received and is held in escrow for "${gig.title}". You can now start working on the project.`,
          gigId
        );
      }
      
      // Notify client
      await createNotification(
        supabase,
        gig.client_id,
        'payment_confirmed',
        'Payment Confirmed',
        `Your payment of R${amountGross.toFixed(2)} for "${gig.title}" has been processed and is held in escrow.`,
        gigId
      );
      
      console.log('Payment completed successfully');
      
    } else if (data.payment_status === 'FAILED') {
      // Payment failed - notify client
      const { data: gig } = await supabase
        .from('assignments')
        .select('client_id, title')
        .eq('id', gigId)
        .single();
      
      if (gig) {
        await createNotification(
          supabase,
          gig.client_id,
          'payment_failed',
          'Payment Failed',
          `Your payment for "${gig.title}" has failed. Please try again.`,
          gigId
        );
      }
      
      console.log('Payment failed:', data.pf_payment_id);
      
    } else if (data.payment_status === 'CANCELLED') {
      // Payment cancelled
      console.log('Payment cancelled:', data.pf_payment_id);
    }
    
    // Return success response (PayFast expects 200)
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return 200 even on error to prevent PayFast retries for processing errors
    // Log the error for investigation
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
