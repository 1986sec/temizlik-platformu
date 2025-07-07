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
          user_type: 'job_seeker' | 'employer' | 'admin'
          first_name: string
          last_name: string
          phone: string | null
          city: string | null
          avatar_url: string | null
          bio: string | null
          experience_years: number | null
          hourly_rate: number | null
          is_premium: boolean | null
          premium_expires_at: string | null
          is_verified: boolean | null
          is_active: boolean | null
          last_seen_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_type?: 'job_seeker' | 'employer' | 'admin'
          first_name: string
          last_name: string
          phone?: string | null
          city?: string | null
          avatar_url?: string | null
          bio?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          is_premium?: boolean | null
          premium_expires_at?: string | null
          is_verified?: boolean | null
          is_active?: boolean | null
          last_seen_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_type?: 'job_seeker' | 'employer' | 'admin'
          first_name?: string
          last_name?: string
          phone?: string | null
          city?: string | null
          avatar_url?: string | null
          bio?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          is_premium?: boolean | null
          premium_expires_at?: string | null
          is_verified?: boolean | null
          is_active?: boolean | null
          last_seen_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          description: string | null
          website: string | null
          logo_url: string | null
          address: string | null
          city: string
          phone: string | null
          email: string | null
          tax_number: string | null
          employee_count: string | null
          is_verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          address?: string | null
          city: string
          phone?: string | null
          email?: string | null
          tax_number?: string | null
          employee_count?: string | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          address?: string | null
          city?: string
          phone?: string | null
          email?: string | null
          tax_number?: string | null
          employee_count?: string | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      job_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      job_postings: {
        Row: {
          id: string
          employer_id: string | null
          company_id: string | null
          category_id: string | null
          title: string
          description: string
          requirements: string[] | null
          benefits: string[] | null
          job_type: 'full_time' | 'part_time' | 'contract' | 'temporary'
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          city: string
          address: string | null
          location: unknown | null
          is_remote: boolean | null
          is_urgent: boolean | null
          is_premium: boolean | null
          status: 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'filled'
          expires_at: string | null
          view_count: number | null
          application_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employer_id?: string | null
          company_id?: string | null
          category_id?: string | null
          title: string
          description: string
          requirements?: string[] | null
          benefits?: string[] | null
          job_type?: 'full_time' | 'part_time' | 'contract' | 'temporary'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          city: string
          address?: string | null
          location?: unknown | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          is_premium?: boolean | null
          status?: 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'filled'
          expires_at?: string | null
          view_count?: number | null
          application_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employer_id?: string | null
          company_id?: string | null
          category_id?: string | null
          title?: string
          description?: string
          requirements?: string[] | null
          benefits?: string[] | null
          job_type?: 'full_time' | 'part_time' | 'contract' | 'temporary'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          city?: string
          address?: string | null
          location?: unknown | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          is_premium?: boolean | null
          status?: 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'filled'
          expires_at?: string | null
          view_count?: number | null
          application_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string | null
          applicant_id: string | null
          cover_letter: string | null
          resume_url: string | null
          status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
          employer_notes: string | null
          applied_at: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          applicant_id?: string | null
          cover_letter?: string | null
          resume_url?: string | null
          status?: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
          employer_notes?: string | null
          applied_at?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          applicant_id?: string | null
          cover_letter?: string | null
          resume_url?: string | null
          status?: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
          employer_notes?: string | null
          applied_at?: string | null
          reviewed_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string | null
          reviewee_id: string | null
          job_id: string | null
          rating: number | null
          comment: string | null
          is_public: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          reviewer_id?: string | null
          reviewee_id?: string | null
          job_id?: string | null
          rating?: number | null
          comment?: string | null
          is_public?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          reviewer_id?: string | null
          reviewee_id?: string | null
          job_id?: string | null
          rating?: number | null
          comment?: string | null
          is_public?: boolean | null
          created_at?: string | null
        }
      }
      saved_jobs: {
        Row: {
          id: string
          user_id: string | null
          job_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          job_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          job_id?: string | null
          created_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: 'application' | 'job_match' | 'message' | 'system'
          title: string
          message: string
          data: Json | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'application' | 'job_match' | 'message' | 'system'
          title: string
          message: string
          data?: Json | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'application' | 'job_match' | 'message' | 'system'
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean | null
          created_at?: string | null
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string | null
          reported_user_id: string | null
          reported_job_id: string | null
          reason: string
          description: string | null
          status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
          admin_notes: string | null
          created_at: string | null
          resolved_at: string | null
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          reported_user_id?: string | null
          reported_job_id?: string | null
          reason: string
          description?: string | null
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string | null
          resolved_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string | null
          reported_user_id?: string | null
          reported_job_id?: string | null
          reason?: string
          description?: string | null
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string | null
          resolved_at?: string | null
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
      user_type: 'job_seeker' | 'employer' | 'admin'
      job_type: 'full_time' | 'part_time' | 'contract' | 'temporary'
      application_status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
      job_status: 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'filled'
      report_status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
      notification_type: 'application' | 'job_match' | 'message' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for better type safety
export type UserType = Database['public']['Enums']['user_type'];
export type JobType = Database['public']['Enums']['job_type'];
export type ApplicationStatus = Database['public']['Enums']['application_status'];
export type JobStatus = Database['public']['Enums']['job_status'];
export type ReportStatus = Database['public']['Enums']['report_status'];
export type NotificationType = Database['public']['Enums']['notification_type'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export type JobCategory = Database['public']['Tables']['job_categories']['Row'];
export type JobCategoryInsert = Database['public']['Tables']['job_categories']['Insert'];
export type JobCategoryUpdate = Database['public']['Tables']['job_categories']['Update'];

export type JobPosting = Database['public']['Tables']['job_postings']['Row'];
export type JobPostingInsert = Database['public']['Tables']['job_postings']['Insert'];
export type JobPostingUpdate = Database['public']['Tables']['job_postings']['Update'];

export type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export type SavedJob = Database['public']['Tables']['saved_jobs']['Row'];
export type SavedJobInsert = Database['public']['Tables']['saved_jobs']['Insert'];
export type SavedJobUpdate = Database['public']['Tables']['saved_jobs']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];