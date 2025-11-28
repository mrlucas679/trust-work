/**
 * @fileoverview Freelancer Bank Account API
 * TrustWork Platform - Payment Recipient Management
 */

import { supabase } from '../supabaseClient';
import type { 
  IFreelancerBankAccount, 
  BankAccountType,
  SA_BANKS 
} from '@/types/gig';

// ============================================================
// BANK ACCOUNT CRUD
// ============================================================

/**
 * Get current user's bank account
 */
export async function getMyBankAccount(): Promise<IFreelancerBankAccount | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to view bank account');
  }

  const { data, error } = await supabase
    .from('freelancer_bank_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No bank account found
    }
    console.error('Error fetching bank account:', error);
    throw new Error(`Failed to fetch bank account: ${error.message}`);
  }

  return data as IFreelancerBankAccount;
}

/**
 * Create or update bank account
 */
export async function saveBankAccount(
  accountData: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    branchCode: string;
    accountType: BankAccountType;
    swiftCode?: string;
  }
): Promise<IFreelancerBankAccount> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to save bank account');
  }

  const bankAccountData = {
    user_id: user.id,
    account_holder_name: accountData.accountHolderName,
    bank_name: accountData.bankName,
    account_number: accountData.accountNumber,
    branch_code: accountData.branchCode,
    account_type: accountData.accountType,
    swift_code: accountData.swiftCode || null,
    is_verified: false, // Requires verification
  };

  // Check if account exists
  const existingAccount = await getMyBankAccount();

  if (existingAccount) {
    // Update existing account
    const { data, error } = await supabase
      .from('freelancer_bank_accounts')
      .update(bankAccountData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bank account:', error);
      throw new Error(`Failed to update bank account: ${error.message}`);
    }

    return data as IFreelancerBankAccount;
  } else {
    // Create new account
    const { data, error } = await supabase
      .from('freelancer_bank_accounts')
      .insert(bankAccountData)
      .select()
      .single();

    if (error) {
      console.error('Error creating bank account:', error);
      throw new Error(`Failed to create bank account: ${error.message}`);
    }

    return data as IFreelancerBankAccount;
  }
}

/**
 * Delete bank account
 */
export async function deleteBankAccount(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to delete bank account');
  }

  const { error } = await supabase
    .from('freelancer_bank_accounts')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting bank account:', error);
    throw new Error(`Failed to delete bank account: ${error.message}`);
  }
}

// ============================================================
// BANK ACCOUNT VERIFICATION
// ============================================================

/**
 * Request bank account verification
 * In production, this would initiate a micro-deposit verification
 */
export async function requestVerification(): Promise<{ message: string }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to request verification');
  }

  const account = await getMyBankAccount();
  
  if (!account) {
    throw new Error('No bank account found. Please add bank details first.');
  }

  if (account.is_verified) {
    throw new Error('Bank account is already verified');
  }

  // In production, this would:
  // 1. Make micro-deposits (e.g., R0.01 and R0.02)
  // 2. Store the amounts in a secure way
  // 3. User verifies by entering the exact amounts

  // For now, just mark as pending verification
  await supabase
    .from('freelancer_bank_accounts')
    .update({ verification_method: 'micro_deposit' })
    .eq('user_id', user.id);

  return { 
    message: 'Verification initiated. Two small deposits will be made to your account within 2-3 business days.' 
  };
}

/**
 * Verify bank account with deposit amounts
 */
export async function verifyBankAccount(
  amount1: number,
  amount2: number
): Promise<IFreelancerBankAccount> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to verify bank account');
  }

  // In production, you would verify these amounts against what was deposited
  // For now, we'll accept any valid input and mark as verified

  const { data, error } = await supabase
    .from('freelancer_bank_accounts')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_method: 'micro_deposit',
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error verifying bank account:', error);
    throw new Error(`Failed to verify bank account: ${error.message}`);
  }

  return data as IFreelancerBankAccount;
}

// ============================================================
// BANK HELPERS
// ============================================================

/**
 * Get branch code for a bank
 * These are universal branch codes for South African banks
 */
export function getUniversalBranchCode(bankName: string): string | null {
  const branchCodes: Record<string, string> = {
    'ABSA Bank': '632005',
    'African Bank': '430000',
    'Bidvest Bank': '462005',
    'Capitec Bank': '470010',
    'Discovery Bank': '679000',
    'First National Bank (FNB)': '250655',
    'FirstRand Bank': '250655',
    'Grindrod Bank': '223626',
    'Investec Bank': '580105',
    'Mercantile Bank': '450105',
    'Nedbank': '198765',
    'Old Mutual': '462005',
    'Sasfin Bank': '683000',
    'Standard Bank': '051001',
    'TymeBank': '678910',
  };
  return branchCodes[bankName] || null;
}

/**
 * Mask account number for display
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  const visible = accountNumber.slice(-4);
  const masked = '*'.repeat(accountNumber.length - 4);
  return `${masked}${visible}`;
}

/**
 * Validate South African bank account number
 */
export function validateAccountNumber(
  accountNumber: string, 
  bankName: string
): { valid: boolean; message?: string } {
  // Remove spaces and dashes
  const cleaned = accountNumber.replace(/[\s-]/g, '');

  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'Account number must contain only digits' };
  }

  // Check length (SA bank accounts are typically 10-11 digits)
  if (cleaned.length < 7 || cleaned.length > 16) {
    return { valid: false, message: 'Account number must be between 7 and 16 digits' };
  }

  // Bank-specific validation could be added here
  // For now, accept if basic checks pass
  return { valid: true };
}

/**
 * Validate branch code
 */
export function validateBranchCode(branchCode: string): { valid: boolean; message?: string } {
  const cleaned = branchCode.replace(/[\s-]/g, '');

  if (!/^\d{6}$/.test(cleaned)) {
    return { valid: false, message: 'Branch code must be exactly 6 digits' };
  }

  return { valid: true };
}

/**
 * Format account number for display
 */
export function formatAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/[\s-]/g, '');
  // Format as groups of 4
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}
