/**
 * @fileoverview useEmailNotifications Hook
 * React hook for sending email notifications throughout the app
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  sendWelcomeEmail,
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
  sendNewMessageEmail,
  sendPaymentReceivedEmail,
  sendPaymentReleasedEmail,
  sendAssignmentMatchEmail,
  sendVerificationStatusEmail,
} from '@/services/email.service';

interface UseEmailNotificationsReturn {
  sendWelcome: (userEmail: string, userName: string, role: 'job_seeker' | 'employer') => Promise<boolean>;
  sendApplicationReceived: (params: {
    employerEmail: string;
    employerName: string;
    applicantName: string;
    jobTitle: string;
    bidAmount: number;
    estimatedDuration: string;
    applicationId: string;
  }) => Promise<boolean>;
  sendApplicationStatus: (params: {
    applicantEmail: string;
    applicantName: string;
    jobTitle: string;
    status: string;
    assignmentId: string;
    message?: string;
  }) => Promise<boolean>;
  sendNewMessage: (params: {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    messagePreview: string;
    conversationId: string;
  }) => Promise<boolean>;
  sendPaymentReceived: (params: {
    freelancerEmail: string;
    freelancerName: string;
    clientName: string;
    amount: number;
    gigTitle: string;
    milestoneName: string;
  }) => Promise<boolean>;
  sendPaymentReleased: (params: {
    freelancerEmail: string;
    freelancerName: string;
    amount: number;
    gigTitle: string;
    payoutId: string;
  }) => Promise<boolean>;
  sendJobMatch: (params: {
    userEmail: string;
    userName: string;
    jobTitle: string;
    budgetMin: number;
    budgetMax: number;
    location: string;
    description: string;
    matchScore: number;
    jobId: string;
  }) => Promise<boolean>;
  sendVerificationStatus: (params: {
    businessEmail: string;
    businessName: string;
    status: 'verified' | 'rejected' | 'pending';
    message?: string;
  }) => Promise<boolean>;
  isEmailConfigured: boolean;
}

/**
 * Hook for sending email notifications with error handling
 */
export function useEmailNotifications(): UseEmailNotificationsReturn {
  const { toast } = useToast();
  
  // Check if email is configured
  const isEmailConfigured = Boolean(import.meta.env.VITE_EMAIL_API_KEY);
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://trustwork.com';

  const handleEmailError = useCallback((error: unknown, context: string) => {
    console.error(`Email notification failed (${context}):`, error);
    // Don't show error toast to users - email failures shouldn't block UX
    // Just log for monitoring
  }, []);

  const sendWelcome = useCallback(async (
    userEmail: string,
    userName: string,
    role: 'job_seeker' | 'employer'
  ): Promise<boolean> => {
    if (!isEmailConfigured) {
      console.warn('Email not configured - skipping welcome email');
      return false;
    }

    try {
      const dashboardUrl = `${baseUrl}/dashboard/${role === 'job_seeker' ? 'job-seeker' : 'employer'}`;
      await sendWelcomeEmail(userEmail, userName, role, dashboardUrl);
      return true;
    } catch (error) {
      handleEmailError(error, 'welcome');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  const sendApplicationReceived = useCallback(async (params: {
    employerEmail: string;
    employerName: string;
    applicantName: string;
    jobTitle: string;
    bidAmount: number;
    estimatedDuration: string;
    applicationId: string;
  }): Promise<boolean> => {
    if (!isEmailConfigured) return false;

    try {
      const applicationUrl = `${baseUrl}/applications/${params.applicationId}`;
      await sendApplicationReceivedEmail(
        params.employerEmail,
        params.employerName,
        params.applicantName,
        params.jobTitle,
        params.bidAmount,
        params.estimatedDuration,
        applicationUrl
      );
      return true;
    } catch (error) {
      handleEmailError(error, 'application_received');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  const sendApplicationStatus = useCallback(async (params: {
    applicantEmail: string;
    applicantName: string;
    jobTitle: string;
    status: string;
    assignmentId: string;
    message?: string;
  }): Promise<boolean> => {
    if (!isEmailConfigured) return false;

    try {
      const assignmentUrl = `${baseUrl}/job/${params.assignmentId}`;
      await sendApplicationStatusEmail(
        params.applicantEmail,
        params.applicantName,
        params.jobTitle,
        params.status,
        assignmentUrl,
        params.message
      );
      return true;
    } catch (error) {
      handleEmailError(error, 'application_status');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  const sendNewMessage = useCallback(async (params: {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    messagePreview: string;
    conversationId: string;
  }): Promise<boolean> => {
    if (!isEmailConfigured) return false;

    try {
      const conversationUrl = `${baseUrl}/chat/${params.conversationId}`;
      await sendNewMessageEmail(
        params.recipientEmail,
        params.recipientName,
        params.senderName,
        params.messagePreview,
        conversationUrl
      );
      return true;
    } catch (error) {
      handleEmailError(error, 'new_message');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  const sendPaymentReceived = useCallback(async (params: {
    freelancerEmail: string;
    freelancerName: string;
    clientName: string;
    amount: number;
    gigTitle: string;
    milestoneName: string;
  }): Promise<boolean> => {
    if (!isEmailConfigured) return false;

    try {
      const earningsUrl = `${baseUrl}/freelancer/earnings`;
      await sendPaymentReceivedEmail(
        params.freelancerEmail,
        params.freelancerName,
        params.clientName,
        params.amount,
        params.gigTitle,
        params.milestoneName,
        earningsUrl
      );
      return true;
    } catch (error) {
      handleEmailError(error, 'payment_received');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  const sendPaymentReleased = useCallback(async (params: {
    freelancerEmail: string;
    freelancerName: string;
    amount: number;
    gigTitle: string;
    payoutId: string;
  }): Promise<boolean> => {
    if (!isEmailConfigured) return false;

    try {
      const payoutUrl = `${baseUrl}/freelancer/earnings?payout=${params.payoutId}`;
      await sendPaymentReleasedEmail(
        params.freelancerEmail,
        params.freelancerName,
        params.amount,
        params.gigTitle,
        payoutUrl
      );
      return true;
    } catch (error) {
      handleEmailError(error, 'payment_released');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  const sendJobMatch = useCallback(async (params: {
    userEmail: string;
    userName: string;
    jobTitle: string;
    budgetMin: number;
    budgetMax: number;
    location: string;
    description: string;
    matchScore: number;
    jobId: string;
  }): Promise<boolean> => {
    if (!isEmailConfigured) return false;

    try {
      const jobUrl = `${baseUrl}/job/${params.jobId}`;
      await sendAssignmentMatchEmail(
        params.userEmail,
        params.userName,
        params.jobTitle,
        params.budgetMin,
        params.budgetMax,
        params.location,
        params.description,
        params.matchScore,
        jobUrl
      );
      return true;
    } catch (error) {
      handleEmailError(error, 'job_match');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  const sendVerificationStatus = useCallback(async (params: {
    businessEmail: string;
    businessName: string;
    status: 'verified' | 'rejected' | 'pending';
    message?: string;
  }): Promise<boolean> => {
    if (!isEmailConfigured) return false;

    try {
      const profileUrl = `${baseUrl}/profile`;
      await sendVerificationStatusEmail(
        params.businessEmail,
        params.businessName,
        params.status,
        profileUrl,
        params.message
      );
      return true;
    } catch (error) {
      handleEmailError(error, 'verification_status');
      return false;
    }
  }, [baseUrl, isEmailConfigured, handleEmailError]);

  return {
    sendWelcome,
    sendApplicationReceived,
    sendApplicationStatus,
    sendNewMessage,
    sendPaymentReceived,
    sendPaymentReleased,
    sendJobMatch,
    sendVerificationStatus,
    isEmailConfigured,
  };
}

export default useEmailNotifications;
