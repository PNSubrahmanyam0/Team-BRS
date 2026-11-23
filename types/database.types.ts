export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      application_assignments: {
        Row: {
          application_id: string
          assigned_at: string
          assigned_by: string | null
          assignment_status: string
          company_id: string
          ended_at: string | null
          id: string
          reason: string | null
          recruiter_id: string | null
          supersedes_assignment_id: string | null
          vacancy_id: string
        }
        Insert: {
          application_id: string
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: string
          company_id: string
          ended_at?: string | null
          id?: string
          reason?: string | null
          recruiter_id?: string | null
          supersedes_assignment_id?: string | null
          vacancy_id: string
        }
        Update: {
          application_id?: string
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: string
          company_id?: string
          ended_at?: string | null
          id?: string
          reason?: string | null
          recruiter_id?: string | null
          supersedes_assignment_id?: string | null
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_assignments_supersedes_assignment_id_fkey"
            columns: ["supersedes_assignment_id"]
            isOneToOne: false
            referencedRelation: "application_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_assignments_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          reason: string | null
        }
        Insert: {
          application_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          reason?: string | null
        }
        Update: {
          application_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_status: string
          applied_at: string
          candidate_id: string
          id: string
          match_id: string | null
          organization_id: string
          updated_at: string
          vacancy_id: string
        }
        Insert: {
          application_status?: string
          applied_at?: string
          candidate_id: string
          id?: string
          match_id?: string | null
          organization_id: string
          updated_at?: string
          vacancy_id: string
        }
        Update: {
          application_status?: string
          applied_at?: string
          candidate_id?: string
          id?: string
          match_id?: string | null
          organization_id?: string
          updated_at?: string
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_match_fk"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          organization_id: string | null
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          organization_id?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          organization_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          application_id: string | null
          candidate_id: string
          document_type: string
          drive_file_id: string | null
          id: string
          inspection_status: string | null
          original_filename: string | null
          uploaded_at: string
          verification_status: string
        }
        Insert: {
          application_id?: string | null
          candidate_id: string
          document_type: string
          drive_file_id?: string | null
          id?: string
          inspection_status?: string | null
          original_filename?: string | null
          uploaded_at?: string
          verification_status?: string
        }
        Update: {
          application_id?: string | null
          candidate_id?: string
          document_type?: string
          drive_file_id?: string | null
          id?: string
          inspection_status?: string | null
          original_filename?: string | null
          uploaded_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string
          created_at: string
          graduation_year: number | null
          id: string
          institution: string | null
          qualification: string
          specialization: string | null
          verification_status: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          graduation_year?: number | null
          id?: string
          institution?: string | null
          qualification: string
          specialization?: string | null
          verification_status?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          graduation_year?: number | null
          id?: string
          institution?: string | null
          qualification?: string
          specialization?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_experience: {
        Row: {
          candidate_id: string
          company_name: string
          created_at: string
          description: string | null
          domain: string | null
          end_date: string | null
          id: string
          is_current: boolean
          job_role: string | null
          start_date: string | null
        }
        Insert: {
          candidate_id: string
          company_name: string
          created_at?: string
          description?: string | null
          domain?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_role?: string | null
          start_date?: string | null
        }
        Update: {
          candidate_id?: string
          company_name?: string
          created_at?: string
          description?: string | null
          domain?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_role?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_experience_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          candidate_code: string
          certifications: string | null
          college_name: string | null
          consent_status: string
          created_at: string
          current_company: string | null
          current_ctc: number | null
          current_job_role: string | null
          current_location: string | null
          email: string
          employee_id_encrypted: string | null
          employment_type: string
          expected_ctc: number | null
          full_name: string
          graduation_year: number | null
          highest_qualification: string | null
          id: string
          key_skills: string[]
          last_working_day: string | null
          mobile: string
          notice_period: string | null
          organization_id: string
          preferred_job_roles: string[]
          preferred_locations: string[]
          previous_company: string | null
          profile_completion: number
          profile_status: string
          projects: string | null
          recruitment_status: string
          registration_status: string
          relevant_experience_months: number | null
          specialization: string | null
          total_experience_months: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          candidate_code: string
          certifications?: string | null
          college_name?: string | null
          consent_status?: string
          created_at?: string
          current_company?: string | null
          current_ctc?: number | null
          current_job_role?: string | null
          current_location?: string | null
          email: string
          employee_id_encrypted?: string | null
          employment_type: string
          expected_ctc?: number | null
          full_name: string
          graduation_year?: number | null
          highest_qualification?: string | null
          id?: string
          key_skills?: string[]
          last_working_day?: string | null
          mobile: string
          notice_period?: string | null
          organization_id: string
          preferred_job_roles?: string[]
          preferred_locations?: string[]
          previous_company?: string | null
          profile_completion?: number
          profile_status?: string
          projects?: string | null
          recruitment_status?: string
          registration_status?: string
          relevant_experience_months?: number | null
          specialization?: string | null
          total_experience_months?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          candidate_code?: string
          certifications?: string | null
          college_name?: string | null
          consent_status?: string
          created_at?: string
          current_company?: string | null
          current_ctc?: number | null
          current_job_role?: string | null
          current_location?: string | null
          email?: string
          employee_id_encrypted?: string | null
          employment_type?: string
          expected_ctc?: number | null
          full_name?: string
          graduation_year?: number | null
          highest_qualification?: string | null
          id?: string
          key_skills?: string[]
          last_working_day?: string | null
          mobile?: string
          notice_period?: string | null
          organization_id?: string
          preferred_job_roles?: string[]
          preferred_locations?: string[]
          previous_company?: string | null
          profile_completion?: number
          profile_status?: string
          projects?: string | null
          recruitment_status?: string
          registration_status?: string
          relevant_experience_months?: number | null
          specialization?: string | null
          total_experience_months?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      charge_policies: {
        Row: {
          active: boolean
          amount: number | null
          charge_type: string
          created_at: string
          currency: string
          id: string
          milestone_configuration: Json
          organization_id: string
          percentage: number | null
          refund_policy: string | null
          tax_rule: string | null
          updated_at: string
          vacancy_id: string | null
        }
        Insert: {
          active?: boolean
          amount?: number | null
          charge_type: string
          created_at?: string
          currency?: string
          id?: string
          milestone_configuration?: Json
          organization_id: string
          percentage?: number | null
          refund_policy?: string | null
          tax_rule?: string | null
          updated_at?: string
          vacancy_id?: string | null
        }
        Update: {
          active?: boolean
          amount?: number | null
          charge_type?: string
          created_at?: string
          currency?: string
          id?: string
          milestone_configuration?: Json
          organization_id?: string
          percentage?: number | null
          refund_policy?: string | null
          tax_rule?: string | null
          updated_at?: string
          vacancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charge_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charge_policies_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      charge_snapshots: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          agreed_amount: number
          agreement_version: string | null
          application_id: string
          created_at: string
          id: string
          payment_milestones: Json
          policy_id: string | null
          refund_terms: string | null
          tax_details: Json
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          agreed_amount: number
          agreement_version?: string | null
          application_id: string
          created_at?: string
          id?: string
          payment_milestones?: Json
          policy_id?: string | null
          refund_terms?: string | null
          tax_details?: Json
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          agreed_amount?: number
          agreement_version?: string | null
          application_id?: string
          created_at?: string
          id?: string
          payment_milestones?: Json
          policy_id?: string | null
          refund_terms?: string | null
          tax_details?: Json
        }
        Relationships: [
          {
            foreignKeyName: "charge_snapshots_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charge_snapshots_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "charge_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          industry: string | null
          organization_id: string
          status: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          organization_id: string
          status?: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verification_logs: {
        Row: {
          action: string
          created_at: string
          document_id: string
          id: string
          notes: string | null
          originals_returned: boolean
          result: string | null
          reviewer_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          document_id: string
          id?: string
          notes?: string | null
          originals_returned?: boolean
          result?: string | null
          reviewer_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          document_id?: string
          id?: string
          notes?: string | null
          originals_returned?: boolean
          result?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verification_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "candidate_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_file_records: {
        Row: {
          created_at: string
          drive_file_id: string
          entity_id: string | null
          entity_type: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          organization_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          drive_file_id: string
          entity_id?: string | null
          entity_type: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          organization_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          drive_file_id?: string
          entity_id?: string | null
          entity_type?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          organization_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drive_file_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          application_id: string | null
          candidate_id: string
          created_at: string
          due_at: string | null
          id: string
          notes: string | null
          recruiter_id: string | null
          status: string
        }
        Insert: {
          application_id?: string | null
          candidate_id: string
          created_at?: string
          due_at?: string | null
          id?: string
          notes?: string | null
          recruiter_id?: string | null
          status?: string
        }
        Update: {
          application_id?: string | null
          candidate_id?: string
          created_at?: string
          due_at?: string | null
          id?: string
          notes?: string | null
          recruiter_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_attendance: {
        Row: {
          attendance_status: string
          id: string
          interview_id: string
          notes: string | null
          recorded_at: string
          recorded_by: string | null
          result: string | null
        }
        Insert: {
          attendance_status?: string
          id?: string
          interview_id: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          result?: string | null
        }
        Update: {
          attendance_status?: string
          id?: string
          interview_id?: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_attendance_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interview_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_schedules: {
        Row: {
          application_id: string
          created_at: string
          created_by: string | null
          id: string
          instructions: string | null
          interview_type: string | null
          location: string | null
          meeting_link: string | null
          mode: string | null
          scheduled_at: string
          status: string
          timezone: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          interview_type?: string | null
          location?: string | null
          meeting_link?: string | null
          mode?: string | null
          scheduled_at: string
          status?: string
          timezone?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          interview_type?: string | null
          location?: string | null
          meeting_link?: string | null
          mode?: string | null
          scheduled_at?: string
          status?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedules_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          candidate_id: string
          created_at: string
          explanation: string | null
          id: string
          mandatory_eligible: boolean
          match_score: number
          missing_requirements: string[]
          recommendation_status: string
          review_status: string
          score_breakdown: Json
          vacancy_id: string
          vacancy_version_id: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          explanation?: string | null
          id?: string
          mandatory_eligible?: boolean
          match_score?: number
          missing_requirements?: string[]
          recommendation_status?: string
          review_status?: string
          score_breakdown?: Json
          vacancy_id: string
          vacancy_version_id?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          explanation?: string | null
          id?: string
          mandatory_eligible?: boolean
          match_score?: number
          missing_requirements?: string[]
          recommendation_status?: string
          review_status?: string
          score_breakdown?: Json
          vacancy_id?: string
          vacancy_version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_vacancy_version_id_fkey"
            columns: ["vacancy_version_id"]
            isOneToOne: false
            referencedRelation: "vacancy_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          application_id: string | null
          candidate_id: string
          channel: string
          created_at: string
          id: string
          message: string
          notification_type: string
          read_at: string | null
          title: string
        }
        Insert: {
          application_id?: string | null
          candidate_id: string
          channel?: string
          created_at?: string
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          title: string
        }
        Update: {
          application_id?: string | null
          candidate_id?: string
          channel?: string
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: string
        }
        Relationships: []
      }
      payment_ledger: {
        Row: {
          amount: number
          application_id: string | null
          candidate_id: string
          created_at: string
          created_by: string | null
          description: string | null
          entry_type: string
          id: string
          reference: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          application_id?: string | null
          candidate_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_type: string
          id?: string
          reference?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          application_id?: string | null
          candidate_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_type?: string
          id?: string
          reference?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_ledger_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_ledger_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_ledger_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          application_id: string | null
          candidate_id: string
          created_at: string
          currency: string
          gateway: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          id: string
          transaction_status: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          application_id?: string | null
          candidate_id: string
          created_at?: string
          currency?: string
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          transaction_status?: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          application_id?: string | null
          candidate_id?: string
          created_at?: string
          currency?: string
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          transaction_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mobile: string | null
          organization_id: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          mobile?: string | null
          organization_id?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          organization_id?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          candidate_id: string
          drive_file_id: string | null
          extraction_status: string
          file_hash: string | null
          file_size: number | null
          id: string
          is_current: boolean
          mime_type: string | null
          original_filename: string
          parsed_data: Json
          uploaded_at: string
          version_number: number
        }
        Insert: {
          candidate_id: string
          drive_file_id?: string | null
          extraction_status?: string
          file_hash?: string | null
          file_size?: number | null
          id?: string
          is_current?: boolean
          mime_type?: string | null
          original_filename: string
          parsed_data?: Json
          uploaded_at?: string
          version_number?: number
        }
        Update: {
          candidate_id?: string
          drive_file_id?: string | null
          extraction_status?: string
          file_hash?: string | null
          file_size?: number | null
          id?: string
          is_current?: boolean
          mime_type?: string | null
          original_filename?: string
          parsed_data?: Json
          uploaded_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "resumes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      service_agreements: {
        Row: {
          accepted_at: string | null
          agreement_drive_file_id: string | null
          agreement_status: string
          application_id: string
          charge_snapshot_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          accepted_at?: string | null
          agreement_drive_file_id?: string | null
          agreement_status?: string
          application_id: string
          charge_snapshot_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          accepted_at?: string | null
          agreement_drive_file_id?: string | null
          agreement_status?: string
          application_id?: string
          charge_snapshot_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_agreements_charge_snapshot_id_fkey"
            columns: ["charge_snapshot_id"]
            isOneToOne: false
            referencedRelation: "charge_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancies: {
        Row: {
          activated_at: string | null
          application_deadline: string | null
          company_id: string
          created_at: string
          created_by: string | null
          domain: string | null
          employer_verification_status: string
          experience_max_months: number | null
          experience_min_months: number | null
          graduation_year_requirements: number[]
          id: string
          interview_details: string | null
          job_description: string | null
          job_title: string
          location: string | null
          mandatory_skills: string[]
          openings: number | null
          organization_id: string
          package_max: number | null
          package_min: number | null
          preferred_skills: string[]
          qualification_requirements: string[]
          shift: string | null
          status: string
          updated_at: string
          work_mode: string | null
        }
        Insert: {
          activated_at?: string | null
          application_deadline?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          domain?: string | null
          employer_verification_status?: string
          experience_max_months?: number | null
          experience_min_months?: number | null
          graduation_year_requirements?: number[]
          id?: string
          interview_details?: string | null
          job_description?: string | null
          job_title: string
          location?: string | null
          mandatory_skills?: string[]
          openings?: number | null
          organization_id: string
          package_max?: number | null
          package_min?: number | null
          preferred_skills?: string[]
          qualification_requirements?: string[]
          shift?: string | null
          status?: string
          updated_at?: string
          work_mode?: string | null
        }
        Update: {
          activated_at?: string | null
          application_deadline?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          domain?: string | null
          employer_verification_status?: string
          experience_max_months?: number | null
          experience_min_months?: number | null
          graduation_year_requirements?: number[]
          id?: string
          interview_details?: string | null
          job_description?: string | null
          job_title?: string
          location?: string | null
          mandatory_skills?: string[]
          openings?: number | null
          organization_id?: string
          package_max?: number | null
          package_min?: number | null
          preferred_skills?: string[]
          qualification_requirements?: string[]
          shift?: string | null
          status?: string
          updated_at?: string
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacancies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancy_posters: {
        Row: {
          drive_file_id: string | null
          id: string
          original_filename: string
          uploaded_at: string
          uploaded_by: string | null
          vacancy_id: string
        }
        Insert: {
          drive_file_id?: string | null
          id?: string
          original_filename: string
          uploaded_at?: string
          uploaded_by?: string | null
          vacancy_id: string
        }
        Update: {
          drive_file_id?: string | null
          id?: string
          original_filename?: string
          uploaded_at?: string
          uploaded_by?: string | null
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacancy_posters_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancy_versions: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          snapshot: Json
          vacancy_id: string
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          snapshot: Json
          vacancy_id: string
          version_number: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          snapshot?: Json
          vacancy_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "vacancy_versions_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
