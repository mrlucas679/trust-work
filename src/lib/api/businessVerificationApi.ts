/**
 * Business Verification API Service
 * 
 * Handles all interactions with the business_verifications table in Supabase
 */

import { supabase } from '../supabaseClient';
import type { BusinessInfo, VerificationResult } from '../businessVerification';

export interface BusinessVerificationRecord {
    id: string;
    user_id: string;
    business_name: string;
    ein?: string;
    business_number?: string;
    address_street: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    address_country: string;
    website?: string;
    email?: string;
    phone?: string;
    verification_result?: VerificationResult;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: string;
    reviewed_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface BusinessVerificationSubmission {
    business_name: string;
    ein?: string;
    business_number?: string;
    address_street: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    address_country: string;
    website?: string;
    email?: string;
    phone?: string;
    verification_result?: VerificationResult;
}

/**
 * Submit a new business verification request
 */
export async function submitBusinessVerification(
    userId: string,
    businessInfo: BusinessInfo,
    verificationResult: VerificationResult
): Promise<{ success: boolean; data?: BusinessVerificationRecord; error?: string }> {
    try {
        const submission: BusinessVerificationSubmission = {
            business_name: businessInfo.businessName,
            ein: businessInfo.ein,
            business_number: businessInfo.businessNumber,
            address_street: businessInfo.address?.street || '',
            address_city: businessInfo.address?.city || '',
            address_state: businessInfo.address?.state || '',
            address_zip: businessInfo.address?.zipCode || '',
            address_country: businessInfo.address?.country || 'US',
            website: businessInfo.website,
            email: businessInfo.email,
            phone: businessInfo.phone,
            verification_result: verificationResult,
        };

        const { data, error } = await supabase
            .from('business_verifications')
            .insert([{
                user_id: userId,
                ...submission,
                status: verificationResult.verified ? 'approved' : 'pending'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error submitting business verification:', error);
            return { success: false, error: error.message };
        }

        // Update user profile with verification status
        await updateProfileVerificationStatus(userId, {
            business_name: businessInfo.businessName,
            verified: verificationResult.verified,
            status: verificationResult.verified ? 'verified' : 'pending',
            badge_level: verificationResult.verified ? 'basic' : 'none'
        });

        return { success: true, data };
    } catch (error) {
        console.error('Exception in submitBusinessVerification:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Update profile with verification status
 */
export async function updateProfileVerificationStatus(
    userId: string,
    updates: {
        business_name: string;
        verified: boolean;
        status: 'not_started' | 'pending' | 'verified' | 'rejected';
        badge_level: 'none' | 'basic' | 'premium' | 'enterprise';
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                business_name: updates.business_name,
                business_verified: updates.verified,
                business_verification_status: updates.status,
                verification_badge_level: updates.badge_level,
                business_verification_submitted_at: new Date().toISOString(),
                ...(updates.verified && { business_verification_completed_at: new Date().toISOString() })
            })
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile verification:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Exception in updateProfileVerificationStatus:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Get user's business verification records
 */
export async function getUserVerifications(
    userId: string
): Promise<{ success: boolean; data?: BusinessVerificationRecord[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('business_verifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user verifications:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Exception in getUserVerifications:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Get latest verification for a user
 */
export async function getLatestVerification(
    userId: string
): Promise<{ success: boolean; data?: BusinessVerificationRecord; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('business_verifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching latest verification:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data || undefined };
    } catch (error) {
        console.error('Exception in getLatestVerification:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Get all pending verifications (admin only)
 */
export async function getPendingVerifications(): Promise<{
    success: boolean;
    data?: BusinessVerificationRecord[];
    error?: string;
}> {
    try {
        const { data, error } = await supabase
            .from('business_verifications')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching pending verifications:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Exception in getPendingVerifications:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Approve a business verification (admin only)
 */
export async function approveVerification(
    verificationId: string,
    adminId: string,
    badgeLevel: 'basic' | 'premium' | 'enterprise' = 'basic',
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update verification record
        const { data: verification, error: fetchError } = await supabase
            .from('business_verifications')
            .select('user_id')
            .eq('id', verificationId)
            .single();

        if (fetchError || !verification) {
            return { success: false, error: 'Verification not found' };
        }

        const { error: updateError } = await supabase
            .from('business_verifications')
            .update({
                status: 'approved',
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString(),
                notes: notes || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', verificationId);

        if (updateError) {
            console.error('Error approving verification:', updateError);
            return { success: false, error: updateError.message };
        }

        // Update user profile
        await supabase
            .from('profiles')
            .update({
                business_verified: true,
                business_verification_status: 'verified',
                verification_badge_level: badgeLevel,
                business_verification_completed_at: new Date().toISOString()
            })
            .eq('id', verification.user_id);

        return { success: true };
    } catch (error) {
        console.error('Exception in approveVerification:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Reject a business verification (admin only)
 */
export async function rejectVerification(
    verificationId: string,
    adminId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update verification record
        const { data: verification, error: fetchError } = await supabase
            .from('business_verifications')
            .select('user_id')
            .eq('id', verificationId)
            .single();

        if (fetchError || !verification) {
            return { success: false, error: 'Verification not found' };
        }

        const { error: updateError } = await supabase
            .from('business_verifications')
            .update({
                status: 'rejected',
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString(),
                notes: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', verificationId);

        if (updateError) {
            console.error('Error rejecting verification:', updateError);
            return { success: false, error: updateError.message };
        }

        // Update user profile
        await supabase
            .from('profiles')
            .update({
                business_verified: false,
                business_verification_status: 'rejected',
                verification_badge_level: 'none',
                business_verification_completed_at: new Date().toISOString()
            })
            .eq('id', verification.user_id);

        return { success: true };
    } catch (error) {
        console.error('Exception in rejectVerification:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Get verification statistics (admin only)
 */
export async function getVerificationStats(): Promise<{
    success: boolean;
    data?: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    error?: string;
}> {
    try {
        const { data, error } = await supabase
            .from('business_verifications')
            .select('status');

        if (error) {
            console.error('Error fetching verification stats:', error);
            return { success: false, error: error.message };
        }

        const stats = {
            total: data.length,
            pending: data.filter(v => v.status === 'pending').length,
            approved: data.filter(v => v.status === 'approved').length,
            rejected: data.filter(v => v.status === 'rejected').length,
        };

        return { success: true, data: stats };
    } catch (error) {
        console.error('Exception in getVerificationStats:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
