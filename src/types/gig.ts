/**
 * @fileoverview Type definitions for the complete gig lifecycle
 * Includes PayFast integration, milestones, deliverables, escrow, and disputes
 */

// ============================================================
// ENUMS & CONSTANTS
// ============================================================

export type GigStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'disputed';

export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';

export type DeliverableStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export type DeliverableFileType = 'document' | 'image' | 'video' | 'code' | 'archive' | 'link' | 'other';

export type EscrowStatus = 'pending' | 'held' | 'released' | 'refunded' | 'disputed';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type PayFastPaymentStatus = 'COMPLETE' | 'FAILED' | 'PENDING' | 'CANCELLED';

export type DisputeReason = 
  | 'quality_issue'
  | 'non_delivery'
  | 'scope_change'
  | 'payment_issue'
  | 'communication_breakdown'
  | 'deadline_missed'
  | 'unauthorized_use'
  | 'other';

export type DisputeStatus = 'open' | 'under_review' | 'awaiting_response' | 'resolved' | 'escalated' | 'closed';

export type ResolutionDecision = 'favor_freelancer' | 'favor_client' | 'split_payment' | 'no_fault' | 'mutual_agreement';

export type ReviewType = 'client_to_freelancer' | 'freelancer_to_client';

export type BankAccountType = 'savings' | 'current' | 'transmission';

// South African bank list
export const SA_BANKS = [
  'ABSA Bank',
  'African Bank',
  'Bidvest Bank',
  'Capitec Bank',
  'Discovery Bank',
  'First National Bank (FNB)',
  'FirstRand Bank',
  'Grindrod Bank',
  'Investec Bank',
  'Mercantile Bank',
  'Nedbank',
  'Old Mutual',
  'Sasfin Bank',
  'Standard Bank',
  'TymeBank',
] as const;

export type SABank = typeof SA_BANKS[number];

// Platform constants
export const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee
export const PAYFAST_EFT_FEE_PERCENTAGE = 0.5; // 0.5% for Instant EFT
export const PAYFAST_CARD_FEE_PERCENTAGE = 2.9; // 2.9% for cards
export const DEFAULT_CURRENCY = 'ZAR';
export const MAX_REVISIONS_PER_MILESTONE = 3;

// ============================================================
// MILESTONE & DELIVERABLE TYPES
// ============================================================

export interface IMilestoneBase {
  description: string;
  percentage: number;
  dueDate?: string; // ISO date
}

export interface IGigMilestone extends IMilestoneBase {
  id: string;
  gig_id: string;
  freelancer_id?: string;
  title: string;
  amount: number;
  order_index: number;
  status: MilestoneStatus;
  started_at?: string;
  submitted_at?: string;
  approved_at?: string;
  deliverable_files: IDeliverableFile[];
  deliverable_links?: string[];
  submission_notes?: string;
  client_notes?: string;
  revision_requested: boolean;
  revision_count: number;
  max_revisions: number;
  payment_released: boolean;
  payment_released_at?: string;
  escrow_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface IDeliverableFile {
  name: string;
  url: string;
  type: DeliverableFileType;
  size: number;
  uploaded_at: string;
}

export interface IGigDeliverable {
  id: string;
  milestone_id?: string;
  gig_id: string;
  freelancer_id?: string;
  title: string;
  description?: string;
  file_type: DeliverableFileType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  storage_path?: string;
  external_link?: string;
  version: number;
  parent_deliverable_id?: string;
  status: DeliverableStatus;
  submitted_at: string;
  reviewed_at?: string;
  client_feedback?: string;
  revision_notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// GIG (ASSIGNMENT) TYPES
// ============================================================

export interface IGigForm {
  title: string;
  description: string;
  category: string;
  budget: number;
  currency?: string;
  deadline: string;
  milestones: IMilestoneBase[];
  requiredSkills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'senior' | 'expert';
  deliverables: string[];
  requiresSkillTest: boolean;
  skillTestId?: string;
  estimatedDuration: string;
  remote: boolean;
  urgent: boolean;
}

export interface IGig {
  id: string;
  client_id: string;
  type: 'gig';
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  budget_type: 'fixed' | 'range';
  currency: string;
  deadline?: string;
  status: GigStatus;
  payment_status: PaymentStatus;
  required_skills: string[];
  experience_level: string;
  estimated_duration?: string;
  remote_allowed: boolean;
  urgent: boolean;
  requires_skill_test: boolean;
  skill_test_id?: string;
  deliverables: string[];
  milestones: IMilestoneBase[];
  accepted_freelancer_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: IClientProfile;
  application_count?: number;
  milestone_records?: IGigMilestone[];
}

export interface IClientProfile {
  id: string;
  full_name?: string;
  company_name?: string;
  avatar_url?: string;
  overall_rating?: number;
  total_reviews?: number;
  total_gigs_completed?: number;
  is_verified?: boolean;
}

// ============================================================
// APPLICATION TYPES
// ============================================================

export interface IGigApplication {
  id: string;
  assignment_id: string;
  freelancer_id: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
  proposal: string;
  bid_amount: number;
  estimated_duration?: string;
  cover_letter?: string;
  portfolio_links?: string[];
  milestone_proposal?: IMilestoneBase[];
  skill_test_result_id?: string;
  skill_test_score?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  freelancer?: IFreelancerProfile;
  gig?: IGig;
}

export interface IFreelancerProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  headline?: string;
  overall_rating?: number;
  total_reviews?: number;
  total_gigs_completed?: number;
  success_rate?: number;
  skills?: string[];
  hourly_rate?: number;
}

// ============================================================
// PAYFAST TYPES
// ============================================================

export interface IPayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  sandbox: boolean;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface IPayFastPaymentRequest {
  // Merchant details
  merchant_id: string;
  merchant_key: string;
  
  // Buyer details
  name_first?: string;
  name_last?: string;
  email_address: string;
  cell_number?: string;
  
  // Transaction details
  m_payment_id: string; // Your unique payment ID
  amount: string; // Decimal format
  item_name: string;
  item_description?: string;
  
  // URLs
  return_url: string;
  cancel_url: string;
  notify_url: string;
  
  // Payment options
  payment_method?: 'eft' | 'cc' | 'dc' | 'mp' | 'mc' | 'sc' | 'ss' | 'zp' | 'mt' | 'rc';
  
  // Custom fields
  custom_str1?: string; // gig_id
  custom_str2?: string; // freelancer_id
  custom_str3?: string; // application_id
  custom_int1?: number;
  custom_int2?: number;
  
  // Security
  signature?: string;
}

export interface IPayFastTransaction {
  id: string;
  assignment_id?: string;
  application_id?: string;
  pf_payment_id?: string;
  payment_status: PayFastPaymentStatus;
  amount_gross: number;
  amount_fee: number;
  amount_net: number;
  payer_id?: string;
  recipient_id?: string;
  payment_method?: string;
  merchant_id?: string;
  item_name: string;
  item_description?: string;
  email_address?: string;
  raw_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IPayFastWebhookData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: PayFastPaymentStatus;
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_int1?: string;
  custom_int2?: string;
  signature: string;
}

// ============================================================
// ESCROW TYPES
// ============================================================

export interface IEscrowPayment {
  id: string;
  assignment_id: string;
  payer_id: string;
  recipient_id: string;
  amount: number;
  platform_fee: number;
  payment_method: 'stripe' | 'paypal' | 'payfast';
  status: EscrowStatus;
  payfast_transaction_id?: string;
  payout_status: PayoutStatus;
  payout_batch_id?: string;
  payout_initiated_at?: string;
  payout_completed_at?: string;
  payout_reference?: string;
  payout_error?: string;
  held_at?: string;
  released_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  gig?: IGig;
  payer?: IClientProfile;
  recipient?: IFreelancerProfile;
}

// ============================================================
// BANK ACCOUNT TYPES
// ============================================================

export interface IFreelancerBankAccount {
  id: string;
  user_id: string;
  account_holder_name: string;
  bank_name: SABank | string;
  account_number: string;
  branch_code: string;
  account_type: BankAccountType;
  is_verified: boolean;
  verified_at?: string;
  verification_method?: 'micro_deposit' | 'manual' | 'instant';
  swift_code?: string;
  created_at: string;
  updated_at: string;
}

export interface IBankAccountForm {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: BankAccountType;
}

// ============================================================
// PAYOUT TYPES
// ============================================================

export interface IPayoutBatch {
  id: string;
  batch_reference: string;
  total_amount: number;
  payout_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  successful_payouts: number;
  failed_payouts: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  error_details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// DISPUTE TYPES
// ============================================================

export interface IDispute {
  id: string;
  gig_id?: string;
  escrow_payment_id?: string;
  initiated_by: string;
  respondent_id: string;
  reason: DisputeReason;
  title: string;
  description: string;
  evidence_files: IDisputeEvidence[];
  initiator_evidence?: string;
  respondent_evidence?: string;
  status: DisputeStatus;
  assigned_admin_id?: string;
  admin_notes?: string;
  internal_notes?: string;
  resolution_decision?: ResolutionDecision;
  payment_adjustment?: number;
  resolution_summary?: string;
  response_deadline?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  resolved_at?: string;
  // Joined data
  gig?: IGig;
  initiator?: IClientProfile | IFreelancerProfile;
  respondent?: IClientProfile | IFreelancerProfile;
}

export interface IDisputeEvidence {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'screenshot' | 'video' | 'other';
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export interface IDisputeForm {
  reason: DisputeReason;
  title: string;
  description: string;
  evidence?: File[];
}

// ============================================================
// REVIEW TYPES
// ============================================================

export interface IReview {
  id: string;
  gig_id?: string;
  reviewer_id: string;
  reviewee_id: string;
  review_type: ReviewType;
  rating: number;
  quality_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  professionalism_rating?: number;
  clarity_rating?: number; // For client reviews
  payment_rating?: number; // For client reviews
  review_text?: string;
  would_work_again?: boolean;
  would_hire_again?: boolean;
  tags: string[];
  is_public: boolean;
  response_text?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  gig?: IGig;
  reviewer?: IClientProfile | IFreelancerProfile;
  reviewee?: IClientProfile | IFreelancerProfile;
}

export interface IReviewForm {
  rating: number;
  quality_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  professionalism_rating?: number;
  clarity_rating?: number;
  payment_rating?: number;
  review_text?: string;
  would_work_again?: boolean;
  would_hire_again?: boolean;
  tags?: string[];
  is_public?: boolean;
}

// ============================================================
// PROFILE STATS TYPES
// ============================================================

export interface IProfileStats {
  overall_rating: number;
  total_reviews: number;
  total_gigs_completed: number;
  total_gigs_in_progress: number;
  success_rate: number;
  total_earnings: number;
  available_balance: number;
  pending_balance: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface IGigListResponse {
  gigs: IGig[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IGigFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  duration?: string;
  remote?: boolean;
  urgent?: boolean;
  status?: GigStatus;
  search?: string;
}

export interface IPaymentSummary {
  grossAmount: number;
  paymentFee: number;
  platformFee: number;
  netAmount: number;
  currency: string;
}

// ============================================================
// NOTIFICATION TYPES (Extended)
// ============================================================

export type GigNotificationType = 
  | 'milestone_submitted'
  | 'milestone_approved'
  | 'milestone_rejected'
  | 'revision_requested'
  | 'gig_completed'
  | 'payment_received'
  | 'payment_released'
  | 'payout_sent'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'review_received';

// ============================================================
// FORM VALIDATION SCHEMAS (for use with Zod)
// ============================================================

export interface IGigPostFormData {
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  milestones: {
    description: string;
    percentage: number;
    dueDate?: string;
  }[];
  requiredSkills: string[];
  experienceLevel: string;
  deliverables: string[];
  estimatedDuration: string;
  remote: boolean;
  urgent: boolean;
  requiresSkillTest: boolean;
  skillTestId?: string;
}

export interface IGigApplicationFormData {
  proposal: string;
  bidAmount: number;
  estimatedDuration: string;
  coverLetter?: string;
  portfolioLinks?: string[];
  milestoneProposal?: IMilestoneBase[];
}
