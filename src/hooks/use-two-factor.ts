/**
 * @fileoverview Two-Factor Authentication Hook
 * 
 * Provides React hook for managing 2FA setup and verification
 * using Supabase MFA (Multi-Factor Authentication) APIs.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { AuthMFAEnrollResponse, AuthMFAVerifyResponse } from '@supabase/supabase-js';

export interface TwoFactorStatus {
  enabled: boolean;
  verified: boolean;
  factorId: string | null;
}

export interface EnrollmentData {
  id: string;
  type: 'totp';
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export function useTwoFactor() {
  const { supabase, user } = useSupabase();
  const [status, setStatus] = useState<TwoFactorStatus>({
    enabled: false,
    verified: false,
    factorId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check current 2FA status for the user
   */
  const checkStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get all enrolled factors
      const { data, error: factorError } = await supabase.auth.mfa.listFactors();

      if (factorError) {
        throw factorError;
      }

      // Check for verified TOTP factor
      const totpFactor = data?.totp?.find(factor => factor.status === 'verified');
      
      setStatus({
        enabled: !!totpFactor,
        verified: !!totpFactor,
        factorId: totpFactor?.id || null,
      });
    } catch (err) {
      console.error('Error checking 2FA status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check 2FA status');
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  /**
   * Start 2FA enrollment process
   * Returns QR code and secret for authenticator app setup
   */
  const enroll = async (): Promise<EnrollmentData | null> => {
    try {
      setError(null);

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'TrustWork Authenticator',
      }) as AuthMFAEnrollResponse;

      if (enrollError) {
        throw enrollError;
      }

      if (!data) {
        throw new Error('No enrollment data received');
      }

      return data as EnrollmentData;
    } catch (err) {
      console.error('Error enrolling 2FA:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll 2FA');
      return null;
    }
  };

  /**
   * Verify 2FA setup with code from authenticator app
   */
  const verify = async (factorId: string, code: string): Promise<boolean> => {
    try {
      setError(null);

      // First, create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        throw challengeError;
      }

      // Then verify with the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      }) as AuthMFAVerifyResponse;

      if (verifyError) {
        throw verifyError;
      }

      // Refresh status
      await checkStatus();
      return true;
    } catch (err) {
      console.error('Error verifying 2FA:', err);
      setError(err instanceof Error ? err.message : 'Invalid verification code');
      return false;
    }
  };

  /**
   * Disable 2FA by unenrolling the factor
   */
  const disable = async (): Promise<boolean> => {
    if (!status.factorId) {
      setError('No 2FA factor found to disable');
      return false;
    }

    try {
      setError(null);

      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: status.factorId,
      });

      if (unenrollError) {
        throw unenrollError;
      }

      // Refresh status
      await checkStatus();
      return true;
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
      return false;
    }
  };

  /**
   * Get current Authenticator Assurance Level
   */
  const getAssuranceLevel = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (error) {
      console.error('Error getting assurance level:', error);
      return null;
    }

    return data;
  };

  return {
    status,
    loading,
    error,
    enroll,
    verify,
    disable,
    checkStatus,
    getAssuranceLevel,
  };
}
