/**
 * Daily Payout Processing Script
 * 
 * This script processes all pending payouts for freelancers.
 * It should be run as a daily cron job (e.g., via Supabase scheduled functions or external scheduler).
 * 
 * Usage:
 *   npx ts-node scripts/processDailyPayouts.ts
 * 
 * Environment Variables Required:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (not anon key - needs admin access)
 *   - PAYFAST_MERCHANT_ID
 *   - PAYFAST_MERCHANT_KEY
 *   - PAYFAST_PASSPHRASE
 */

import { createClient } from '@supabase/supabase-js';

// Types
interface PayoutItem {
  id: string;
  freelancer_id: string;
  gig_id: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface FreelancerBankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  branch_code: string;
  account_type: 'savings' | 'checking' | 'current';
  is_verified: boolean;
  is_primary: boolean;
}

interface PayoutBatch {
  id: string;
  batch_date: string;
  total_amount: number;
  total_fees: number;
  payout_count: number;
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';
  processed_at?: string;
  error_message?: string;
}

interface PayoutResult {
  payoutId: string;
  freelancerId: string;
  amount: number;
  success: boolean;
  error?: string;
  transactionRef?: string;
}

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
const PAYFAST_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.payfast.co.za'
  : 'https://sandbox.payfast.co.za';

// Validate environment
function validateEnvironment(): void {
  const required = [
    'SUPABASE_URL or VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PAYFAST_MERCHANT_ID',
    'PAYFAST_MERCHANT_KEY',
  ];
  
  const missing: string[] = [];
  
  if (!SUPABASE_URL) missing.push('SUPABASE_URL or VITE_SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!PAYFAST_MERCHANT_ID) missing.push('PAYFAST_MERCHANT_ID');
  if (!PAYFAST_MERCHANT_KEY) missing.push('PAYFAST_MERCHANT_KEY');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }
}

// Initialize Supabase client with service role key
function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Generate PayFast signature for API calls
function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const crypto = require('crypto');
  
  // Sort keys alphabetically and create query string
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .filter(key => data[key] !== '' && data[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');
  
  // Add passphrase if provided
  const stringToHash = passphrase 
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase)}`
    : queryString;
  
  return crypto.createHash('md5').update(stringToHash).digest('hex');
}

// Process a single payout via PayFast
async function processPayFastPayout(
  bankAccount: FreelancerBankAccount,
  amount: number,
  reference: string
): Promise<{ success: boolean; transactionRef?: string; error?: string }> {
  try {
    // PayFast payout API payload
    const payoutData: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID!,
      merchant_key: PAYFAST_MERCHANT_KEY!,
      timestamp: new Date().toISOString(),
      amount: amount.toFixed(2),
      bank_name: bankAccount.bank_name,
      account_number: bankAccount.account_number,
      branch_code: bankAccount.branch_code,
      account_holder: bankAccount.account_holder_name,
      reference: reference,
    };
    
    // Generate signature
    payoutData.signature = generateSignature(payoutData, PAYFAST_PASSPHRASE);
    
    // In sandbox mode, simulate success
    if (process.env.NODE_ENV !== 'production') {
      console.log(`  📤 [SANDBOX] Simulating payout of R${amount.toFixed(2)} to ${bankAccount.account_holder_name}`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        transactionRef: `SB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    }
    
    // Production: Make actual API call
    const response = await fetch(`${PAYFAST_API_URL}/eng/process/payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payoutData).toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayFast API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      return {
        success: true,
        transactionRef: result.transaction_id || result.reference,
      };
    } else {
      return {
        success: false,
        error: result.message || 'Unknown PayFast error',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Main payout processing function
async function processDailyPayouts(): Promise<void> {
  console.log('🚀 Starting daily payout processing...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  
  const supabase = getSupabaseClient();
  
  // Step 1: Get all pending payouts
  console.log('📋 Fetching pending payouts...');
  
  const { data: pendingPayouts, error: fetchError } = await supabase
    .from('payout_batches')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  
  if (fetchError) {
    console.error('❌ Failed to fetch pending payouts:', fetchError.message);
    process.exit(1);
  }
  
  if (!pendingPayouts || pendingPayouts.length === 0) {
    console.log('✅ No pending payouts to process.');
    return;
  }
  
  console.log(`📦 Found ${pendingPayouts.length} pending payout(s)`);
  console.log('');
  
  // Create batch record
  const batchId = `BATCH-${Date.now()}`;
  const totalAmount = pendingPayouts.reduce((sum, p) => sum + (p.net_amount || 0), 0);
  
  const { error: batchError } = await supabase
    .from('payout_batches')
    .insert({
      id: batchId,
      batch_date: new Date().toISOString().split('T')[0],
      total_amount: totalAmount,
      total_fees: pendingPayouts.reduce((sum, p) => sum + (p.platform_fee || 0), 0),
      payout_count: pendingPayouts.length,
      status: 'processing',
    });
  
  if (batchError) {
    console.warn('⚠️ Could not create batch record:', batchError.message);
  }
  
  // Step 2: Process each payout
  const results: PayoutResult[] = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const payout of pendingPayouts) {
    console.log(`\n💰 Processing payout ${payout.id}...`);
    console.log(`   Freelancer: ${payout.freelancer_id}`);
    console.log(`   Amount: R${(payout.net_amount || 0).toFixed(2)}`);
    
    // Get freelancer's bank account
    const { data: bankAccount, error: bankError } = await supabase
      .from('freelancer_bank_accounts')
      .select('*')
      .eq('user_id', payout.freelancer_id)
      .eq('is_primary', true)
      .eq('is_verified', true)
      .single();
    
    if (bankError || !bankAccount) {
      console.error(`   ❌ No verified bank account found for freelancer`);
      
      // Mark payout as failed
      await supabase
        .from('payout_batches')
        .update({ 
          status: 'failed',
          error_message: 'No verified bank account',
          processed_at: new Date().toISOString(),
        })
        .eq('id', payout.id);
      
      results.push({
        payoutId: payout.id,
        freelancerId: payout.freelancer_id,
        amount: payout.net_amount || 0,
        success: false,
        error: 'No verified bank account',
      });
      
      failCount++;
      continue;
    }
    
    console.log(`   Bank: ${bankAccount.bank_name} - ****${bankAccount.account_number.slice(-4)}`);
    
    // Update status to processing
    await supabase
      .from('payout_batches')
      .update({ status: 'processing' })
      .eq('id', payout.id);
    
    // Process via PayFast
    const payoutResult = await processPayFastPayout(
      bankAccount,
      payout.net_amount || 0,
      `TW-${payout.gig_id}-${payout.id}`
    );
    
    if (payoutResult.success) {
      console.log(`   ✅ Payout successful! Ref: ${payoutResult.transactionRef}`);
      
      // Update payout record
      await supabase
        .from('payout_batches')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', payout.id);
      
      // Record transaction
      await supabase
        .from('payfast_transactions')
        .insert({
          gig_id: payout.gig_id,
          user_id: payout.freelancer_id,
          amount: payout.net_amount,
          payment_method: 'eft',
          status: 'complete',
          payfast_payment_id: payoutResult.transactionRef,
          transaction_type: 'payout',
        });
      
      results.push({
        payoutId: payout.id,
        freelancerId: payout.freelancer_id,
        amount: payout.net_amount || 0,
        success: true,
        transactionRef: payoutResult.transactionRef,
      });
      
      successCount++;
    } else {
      console.error(`   ❌ Payout failed: ${payoutResult.error}`);
      
      // Update payout record
      await supabase
        .from('payout_batches')
        .update({
          status: 'failed',
          error_message: payoutResult.error,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payout.id);
      
      results.push({
        payoutId: payout.id,
        freelancerId: payout.freelancer_id,
        amount: payout.net_amount || 0,
        success: false,
        error: payoutResult.error,
      });
      
      failCount++;
    }
    
    // Rate limiting - wait between payouts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Step 3: Update batch status
  const batchStatus = failCount === 0 ? 'completed' : 
                      successCount === 0 ? 'failed' : 'partial';
  
  await supabase
    .from('payout_batches')
    .update({
      status: batchStatus,
      processed_at: new Date().toISOString(),
    })
    .eq('id', batchId);
  
  // Step 4: Print summary
  console.log('\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 PAYOUT PROCESSING SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`   Total Payouts: ${pendingPayouts.length}`);
  console.log(`   ✅ Successful:  ${successCount}`);
  console.log(`   ❌ Failed:      ${failCount}`);
  console.log(`   💰 Total Paid:  R${results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.amount, 0)
    .toFixed(2)}`);
  console.log('═══════════════════════════════════════════');
  
  // Exit with error code if any failures
  if (failCount > 0) {
    console.log('\n⚠️ Some payouts failed. Check logs for details.');
    process.exit(1);
  }
  
  console.log('\n✅ All payouts processed successfully!');
}

// Entry point
async function main(): Promise<void> {
  try {
    validateEnvironment();
    await processDailyPayouts();
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();

export { processDailyPayouts, processPayFastPayout };
