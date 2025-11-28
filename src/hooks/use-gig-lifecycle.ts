/**
 * @fileoverview React Query hooks for gig lifecycle management
 * TrustWork Platform - Gig, Milestone, Escrow, and Payment hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Import API functions
import * as gigsApi from '@/lib/api/gigs';
import * as milestonesApi from '@/lib/api/milestones';
import * as escrowApi from '@/lib/api/escrow';
import * as payfastApi from '@/lib/api/payfast';
import * as disputesApi from '@/lib/api/disputes';
import * as bankAccountsApi from '@/lib/api/bank-accounts';

// Import types
import type { 
  IGig, 
  IGigMilestone, 
  IEscrowPayment,
  IPayFastTransaction,
  IDispute,
  IFreelancerBankAccount,
  MilestoneStatus,
  DisputeReason,
  ResolutionDecision,
  IDisputeEvidence,
  IDeliverableFile,
  BankAccountType,
} from '@/types/gig';

// ============================================================
// QUERY KEYS
// ============================================================

export const gigKeys = {
  all: ['gigs'] as const,
  lists: () => [...gigKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...gigKeys.lists(), filters] as const,
  details: () => [...gigKeys.all, 'detail'] as const,
  detail: (id: string) => [...gigKeys.details(), id] as const,
  myGigs: () => [...gigKeys.all, 'my'] as const,
};

export const milestoneKeys = {
  all: ['milestones'] as const,
  byGig: (gigId: string) => [...milestoneKeys.all, 'gig', gigId] as const,
  detail: (id: string) => [...milestoneKeys.all, 'detail', id] as const,
  stats: (gigId: string) => [...milestoneKeys.all, 'stats', gigId] as const,
};

export const escrowKeys = {
  all: ['escrow'] as const,
  byGig: (gigId: string) => [...escrowKeys.all, 'gig', gigId] as const,
  detail: (id: string) => [...escrowKeys.all, 'detail', id] as const,
  myPayments: () => [...escrowKeys.all, 'my'] as const,
  stats: (userId?: string) => [...escrowKeys.all, 'stats', userId] as const,
};

export const payfastKeys = {
  all: ['payfast'] as const,
  transaction: (id: string) => [...payfastKeys.all, 'transaction', id] as const,
  myTransactions: () => [...payfastKeys.all, 'my'] as const,
};

export const disputeKeys = {
  all: ['disputes'] as const,
  byGig: (gigId: string) => [...disputeKeys.all, 'gig', gigId] as const,
  detail: (id: string) => [...disputeKeys.all, 'detail', id] as const,
  myDisputes: () => [...disputeKeys.all, 'my'] as const,
};

export const bankAccountKeys = {
  all: ['bankAccount'] as const,
  my: () => [...bankAccountKeys.all, 'my'] as const,
};

// ============================================================
// GIG HOOKS
// ============================================================

export function useGigs(filters?: gigsApi.GigFilters) {
  return useQuery({
    queryKey: gigKeys.list(filters),
    queryFn: () => gigsApi.getGigs(filters),
  });
}

export function useGig(gigId: string) {
  return useQuery({
    queryKey: gigKeys.detail(gigId),
    queryFn: () => gigsApi.getGigById(gigId),
    enabled: !!gigId,
  });
}

export function useMyGigs() {
  return useQuery({
    queryKey: gigKeys.myGigs(),
    queryFn: () => gigsApi.getMyGigs(),
  });
}

export function useCreateGig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: gigsApi.CreateGigData) => gigsApi.createGig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gigKeys.all });
      toast({
        title: 'Gig Created',
        description: 'Your gig has been posted successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateGig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ gigId, updates }: { gigId: string; updates: Partial<gigsApi.CreateGigData> }) =>
      gigsApi.updateGig(gigId, updates),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: gigKeys.detail(gigId) });
      queryClient.invalidateQueries({ queryKey: gigKeys.myGigs() });
      toast({
        title: 'Gig Updated',
        description: 'Your gig has been updated successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateGigStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ gigId, status }: { gigId: string; status: 'open' | 'in_progress' | 'completed' | 'cancelled' }) =>
      gigsApi.updateGigStatus(gigId, status),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: gigKeys.detail(gigId) });
      queryClient.invalidateQueries({ queryKey: gigKeys.myGigs() });
      toast({
        title: 'Status Updated',
        description: 'Gig status has been updated successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// MILESTONE HOOKS
// ============================================================

export function useMilestones(gigId: string) {
  return useQuery({
    queryKey: milestoneKeys.byGig(gigId),
    queryFn: () => milestonesApi.getMilestones(gigId),
    enabled: !!gigId,
  });
}

export function useMilestone(milestoneId: string) {
  return useQuery({
    queryKey: milestoneKeys.detail(milestoneId),
    queryFn: () => milestonesApi.getMilestoneById(milestoneId),
    enabled: !!milestoneId,
  });
}

export function useMilestoneStats(gigId: string) {
  return useQuery({
    queryKey: milestoneKeys.stats(gigId),
    queryFn: () => milestonesApi.getMilestoneStats(gigId),
    enabled: !!gigId,
  });
}

export function useCreateMilestones() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      gigId, 
      freelancerId, 
      milestones 
    }: { 
      gigId: string; 
      freelancerId: string;
      milestones: Array<{
        title: string;
        description?: string;
        percentage: number;
        amount: number;
        dueDate?: string;
      }>;
    }) => milestonesApi.createMilestones(gigId, freelancerId, milestones),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.byGig(gigId) });
      toast({
        title: 'Milestones Created',
        description: 'Project milestones have been set up successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSubmitMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      milestoneId, 
      submission 
    }: { 
      milestoneId: string;
      gigId: string;
      submission: {
        deliverableFiles?: IDeliverableFile[];
        deliverableLinks?: string[];
        submissionNotes?: string;
      };
    }) => milestonesApi.submitMilestone(milestoneId, submission),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.byGig(gigId) });
      queryClient.invalidateQueries({ queryKey: milestoneKeys.stats(gigId) });
      toast({
        title: 'Milestone Submitted',
        description: 'Your deliverable has been submitted for review!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useApproveMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      milestoneId, 
      clientNotes 
    }: { 
      milestoneId: string;
      gigId: string;
      clientNotes?: string;
    }) => milestonesApi.approveMilestone(milestoneId, clientNotes),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.byGig(gigId) });
      queryClient.invalidateQueries({ queryKey: milestoneKeys.stats(gigId) });
      toast({
        title: 'Milestone Approved',
        description: 'The milestone has been approved. Payment can now be released.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRejectMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      milestoneId, 
      clientNotes 
    }: { 
      milestoneId: string;
      gigId: string;
      clientNotes: string;
    }) => milestonesApi.rejectMilestone(milestoneId, clientNotes),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.byGig(gigId) });
      toast({
        title: 'Milestone Rejected',
        description: 'The milestone has been rejected. The freelancer will be notified.',
        variant: 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRequestRevision() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      milestoneId, 
      revisionNotes 
    }: { 
      milestoneId: string;
      gigId: string;
      revisionNotes: string;
    }) => milestonesApi.requestMilestoneRevision(milestoneId, revisionNotes),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.byGig(gigId) });
      toast({
        title: 'Revision Requested',
        description: 'A revision has been requested from the freelancer.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// ESCROW HOOKS
// ============================================================

export function useEscrowPayments(gigId: string) {
  return useQuery({
    queryKey: escrowKeys.byGig(gigId),
    queryFn: () => escrowApi.getEscrowPayments(gigId),
    enabled: !!gigId,
  });
}

export function useEscrowPayment(paymentId: string) {
  return useQuery({
    queryKey: escrowKeys.detail(paymentId),
    queryFn: () => escrowApi.getEscrowPaymentById(paymentId),
    enabled: !!paymentId,
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: escrowKeys.myPayments(),
    queryFn: () => escrowApi.getMyPayments(),
  });
}

export function usePaymentStats(userId?: string) {
  return useQuery({
    queryKey: escrowKeys.stats(userId),
    queryFn: () => escrowApi.getPaymentStats(userId),
  });
}

export function useCreateEscrowPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      gigId, 
      recipientId, 
      amount,
      paymentMethod = 'payfast'
    }: { 
      gigId: string;
      recipientId: string;
      amount: number;
      paymentMethod?: 'stripe' | 'paypal' | 'payfast';
    }) => escrowApi.createEscrowPayment(gigId, recipientId, amount, paymentMethod),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.byGig(gigId) });
      toast({
        title: 'Escrow Created',
        description: 'Payment has been placed in escrow.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useReleasePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (paymentId: string) => escrowApi.releaseEscrowPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      toast({
        title: 'Payment Released',
        description: 'The payment has been released to the freelancer.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
      escrowApi.refundEscrowPayment(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      toast({
        title: 'Payment Refunded',
        description: 'The payment has been refunded.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// PAYFAST HOOKS
// ============================================================

export function usePayFastTransaction(transactionId: string) {
  return useQuery({
    queryKey: payfastKeys.transaction(transactionId),
    queryFn: () => payfastApi.getPayFastTransaction(transactionId),
    enabled: !!transactionId,
  });
}

export function useMyPayFastTransactions() {
  return useQuery({
    queryKey: payfastKeys.myTransactions(),
    queryFn: () => payfastApi.getMyPayFastTransactions(),
  });
}

export function useCreatePayFastPayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      gigId: string;
      freelancerId: string;
      applicationId: string;
      amount: number;
      itemName: string;
      itemDescription: string;
      buyerEmail: string;
      buyerFirstName?: string;
      buyerLastName?: string;
    }) => payfastApi.createPayFastPayment(
      params.gigId,
      params.freelancerId,
      params.applicationId,
      params.amount,
      params.itemName,
      params.itemDescription,
      params.buyerEmail,
      params.buyerFirstName,
      params.buyerLastName
    ),
    onSuccess: () => {
      toast({
        title: 'Redirecting to PayFast',
        description: 'You will be redirected to complete payment.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// DISPUTE HOOKS
// ============================================================

export function useMyDisputes() {
  return useQuery({
    queryKey: disputeKeys.myDisputes(),
    queryFn: () => disputesApi.getMyDisputes(),
  });
}

export function useDispute(disputeId: string) {
  return useQuery({
    queryKey: disputeKeys.detail(disputeId),
    queryFn: () => disputesApi.getDisputeById(disputeId),
    enabled: !!disputeId,
  });
}

export function useGigDisputes(gigId: string) {
  return useQuery({
    queryKey: disputeKeys.byGig(gigId),
    queryFn: () => disputesApi.getGigDisputes(gigId),
    enabled: !!gigId,
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      gigId: string;
      respondentId: string;
      reason: DisputeReason;
      title: string;
      description: string;
      escrowPaymentId?: string;
      evidence?: IDisputeEvidence[];
    }) => disputesApi.createDispute(
      params.gigId,
      params.respondentId,
      params.reason,
      params.title,
      params.description,
      params.escrowPaymentId,
      params.evidence
    ),
    onSuccess: (_, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.myDisputes() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.byGig(gigId) });
      toast({
        title: 'Dispute Filed',
        description: 'Your dispute has been submitted. The other party will be notified.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSubmitDisputeResponse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      disputeId: string;
      responseEvidence: string;
      additionalEvidence?: IDisputeEvidence[];
    }) => disputesApi.submitDisputeResponse(
      params.disputeId,
      params.responseEvidence,
      params.additionalEvidence
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      toast({
        title: 'Response Submitted',
        description: 'Your response has been submitted for review.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      disputeId: string;
      decision: ResolutionDecision;
      summary: string;
      paymentAdjustment?: number;
    }) => disputesApi.resolveDispute(params.disputeId, {
      decision: params.decision,
      summary: params.summary,
      paymentAdjustment: params.paymentAdjustment,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      toast({
        title: 'Dispute Resolved',
        description: 'The dispute has been resolved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// BANK ACCOUNT HOOKS
// ============================================================

export function useMyBankAccount() {
  return useQuery({
    queryKey: bankAccountKeys.my(),
    queryFn: () => bankAccountsApi.getMyBankAccount(),
  });
}

export function useSaveBankAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (accountData: {
      accountHolderName: string;
      bankName: string;
      accountNumber: string;
      branchCode: string;
      accountType: BankAccountType;
      swiftCode?: string;
    }) => bankAccountsApi.saveBankAccount(accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.my() });
      toast({
        title: 'Bank Account Saved',
        description: 'Your bank account details have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => bankAccountsApi.deleteBankAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.my() });
      toast({
        title: 'Bank Account Removed',
        description: 'Your bank account has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useVerifyBankAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ amount1, amount2 }: { amount1: number; amount2: number }) =>
      bankAccountsApi.verifyBankAccount(amount1, amount2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.my() });
      toast({
        title: 'Bank Account Verified',
        description: 'Your bank account has been verified successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
