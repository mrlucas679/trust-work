/**
 * @fileoverview Supabase Database Types
 * Auto-generated type definitions for database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          role: 'job_seeker' | 'employer'
          phone: string | null
          cv_url: string | null
          city: string | null
          province: string | null
          location: string | null
          experience_level: string | null
          employment_status: string | null
          current_job_title: string | null
          industry: string | null
          years_experience: string | null
          highest_qualification: string | null
          institution: string | null
          field_of_study: string | null
          year_completed: string | null
          skills: string[] | null
          languages: string[] | null
          desired_role: string | null
          desired_industry: string | null
          desired_location: string | null
          job_type_preference: string | null
          salary_expectation: string | null
          availability: string | null
          onboarding_completed: boolean
          business_name: string | null
          business_verified: boolean
          business_verification_status: 'not_started' | 'pending' | 'verified' | 'rejected'
          business_verification_submitted_at: string | null
          business_verification_completed_at: string | null
          verification_badge_level: 'none' | 'basic' | 'premium' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          role?: 'job_seeker' | 'employer'
          phone?: string | null
          cv_url?: string | null
          city?: string | null
          province?: string | null
          location?: string | null
          experience_level?: string | null
          employment_status?: string | null
          current_job_title?: string | null
          industry?: string | null
          years_experience?: string | null
          highest_qualification?: string | null
          institution?: string | null
          field_of_study?: string | null
          year_completed?: string | null
          skills?: string[] | null
          languages?: string[] | null
          desired_role?: string | null
          desired_industry?: string | null
          desired_location?: string | null
          job_type_preference?: string | null
          salary_expectation?: string | null
          availability?: string | null
          onboarding_completed?: boolean
          business_name?: string | null
          business_verified?: boolean
          business_verification_status?: 'not_started' | 'pending' | 'verified' | 'rejected'
          business_verification_submitted_at?: string | null
          business_verification_completed_at?: string | null
          verification_badge_level?: 'none' | 'basic' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          role?: 'job_seeker' | 'employer'
          phone?: string | null
          cv_url?: string | null
          city?: string | null
          province?: string | null
          location?: string | null
          experience_level?: string | null
          employment_status?: string | null
          current_job_title?: string | null
          industry?: string | null
          years_experience?: string | null
          highest_qualification?: string | null
          institution?: string | null
          field_of_study?: string | null
          year_completed?: string | null
          skills?: string[] | null
          languages?: string[] | null
          desired_role?: string | null
          desired_industry?: string | null
          desired_location?: string | null
          job_type_preference?: string | null
          salary_expectation?: string | null
          availability?: string | null
          onboarding_completed?: boolean
          business_name?: string | null
          business_verified?: boolean
          business_verification_status?: 'not_started' | 'pending' | 'verified' | 'rejected'
          business_verification_submitted_at?: string | null
          business_verification_completed_at?: string | null
          verification_badge_level?: 'none' | 'basic' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'job_match' | 'application' | 'message' | 'payment' | 'safety' | 'system'
          title: string
          message: string
          priority: 'low' | 'medium' | 'high'
          read: boolean
          action_url: string | null
          action_label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'job_match' | 'application' | 'message' | 'payment' | 'safety' | 'system'
          title: string
          message: string
          priority?: 'low' | 'medium' | 'high'
          read?: boolean
          action_url?: string | null
          action_label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'job_match' | 'application' | 'message' | 'payment' | 'safety' | 'system'
          title?: string
          message?: string
          priority?: 'low' | 'medium' | 'high'
          read?: boolean
          action_url?: string | null
          action_label?: string | null
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          budget_min: number | null
          budget_max: number | null
          budget_type: 'fixed' | 'hourly' | 'negotiable' | null
          deadline: string | null
          status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
          required_skills: string[]
          experience_level: 'entry' | 'intermediate' | 'expert' | 'any' | null
          job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | null
          location: string | null
          remote_allowed: boolean | null
          category: string | null
          applications_count: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description: string
          budget_min?: number | null
          budget_max?: number | null
          budget_type?: 'fixed' | 'hourly' | 'negotiable' | null
          deadline?: string | null
          status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
          required_skills?: string[]
          experience_level?: 'entry' | 'intermediate' | 'expert' | 'any' | null
          job_type?: 'full_time' | 'part_time' | 'contract' | 'freelance' | null
          location?: string | null
          remote_allowed?: boolean | null
          category?: string | null
          applications_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string
          budget_min?: number | null
          budget_max?: number | null
          budget_type?: 'fixed' | 'hourly' | 'negotiable' | null
          deadline?: string | null
          status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
          required_skills?: string[]
          experience_level?: 'entry' | 'intermediate' | 'expert' | 'any' | null
          job_type?: 'full_time' | 'part_time' | 'contract' | 'freelance' | null
          location?: string | null
          remote_allowed?: boolean | null
          category?: string | null
          applications_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          assignment_id: string
          freelancer_id: string
          proposal: string
          cover_letter: string | null
          bid_amount: number | null
          estimated_duration: string | null
          estimated_start_date: string | null
          status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          freelancer_id: string
          proposal: string
          cover_letter?: string | null
          bid_amount?: number | null
          estimated_duration?: string | null
          estimated_start_date?: string | null
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          freelancer_id?: string
          proposal?: string
          cover_letter?: string | null
          bid_amount?: number | null
          estimated_duration?: string | null
          estimated_start_date?: string | null
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_1_id: string
          participant_2_id: string
          assignment_id: string | null
          application_id: string | null
          last_message_at: string | null
          last_message_preview: string | null
          participant_1_unread_count: number
          participant_2_unread_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_1_id: string
          participant_2_id: string
          assignment_id?: string | null
          application_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_unread_count?: number
          participant_2_unread_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_1_id?: string
          participant_2_id?: string
          assignment_id?: string | null
          application_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_unread_count?: number
          participant_2_unread_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          attachment_url: string | null
          attachment_name: string | null
          attachment_size: number | null
          read: boolean
          read_at: string | null
          edited: boolean
          edited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          attachment_url?: string | null
          attachment_name?: string | null
          attachment_size?: number | null
          read?: boolean
          read_at?: string | null
          edited?: boolean
          edited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          attachment_url?: string | null
          attachment_name?: string | null
          attachment_size?: number | null
          read?: boolean
          read_at?: string | null
          edited?: boolean
          edited_at?: string | null
          created_at?: string
        }
      }
      business_verifications: {
        Row: {
          id: string
          user_id: string
          business_name: string
          ein: string | null
          business_number: string | null
          address_street: string
          address_city: string
          address_state: string
          address_zip: string
          address_country: string
          website: string | null
          email: string | null
          phone: string | null
          verification_result: Json | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          ein?: string | null
          business_number?: string | null
          address_street: string
          address_city: string
          address_state: string
          address_zip: string
          address_country?: string
          website?: string | null
          email?: string | null
          phone?: string | null
          verification_result?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          ein?: string | null
          business_number?: string | null
          address_street?: string
          address_city?: string
          address_state?: string
          address_zip?: string
          address_country?: string
          website?: string | null
          email?: string | null
          phone?: string | null
          verification_result?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      escrow_payments: {
        Row: {
          id: string
          assignment_id: string
          payer_id: string
          recipient_id: string
          amount: number
          platform_fee: number
          total_amount: number
          currency: string
          status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
          payment_method: 'stripe' | 'paypal'
          payment_intent_id: string | null
          paypal_order_id: string | null
          held_at: string | null
          released_at: string | null
          refunded_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          payer_id: string
          recipient_id: string
          amount: number
          platform_fee?: number
          total_amount: number
          currency?: string
          status?: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
          payment_method: 'stripe' | 'paypal'
          payment_intent_id?: string | null
          paypal_order_id?: string | null
          held_at?: string | null
          released_at?: string | null
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          payer_id?: string
          recipient_id?: string
          amount?: number
          platform_fee?: number
          total_amount?: number
          currency?: string
          status?: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
          payment_method?: 'stripe' | 'paypal'
          payment_intent_id?: string | null
          paypal_order_id?: string | null
          held_at?: string | null
          released_at?: string | null
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      safety_reports: {
        Row: {
          id: string
          reporter_id: string | null
          reported_user_id: string | null
          reported_assignment_id: string | null
          report_type: 'scam' | 'fraud' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'payment_issue' | 'safety_concern' | 'other'
          category: 'user' | 'assignment' | 'message' | 'payment' | 'other'
          title: string
          description: string
          evidence_urls: string[]
          status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated'
          priority: 'low' | 'medium' | 'high' | 'critical'
          assigned_to: string | null
          resolution_notes: string | null
          resolved_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          reported_user_id?: string | null
          reported_assignment_id?: string | null
          report_type: 'scam' | 'fraud' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'payment_issue' | 'safety_concern' | 'other'
          category: 'user' | 'assignment' | 'message' | 'payment' | 'other'
          title: string
          description: string
          evidence_urls?: string[]
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string | null
          reported_user_id?: string | null
          reported_assignment_id?: string | null
          report_type?: 'scam' | 'fraud' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'payment_issue' | 'safety_concern' | 'other'
          category?: 'user' | 'assignment' | 'message' | 'payment' | 'other'
          title?: string
          description?: string
          evidence_urls?: string[]
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
