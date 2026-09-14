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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["admin_role"]
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["admin_role"]
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          status?: string
          token?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          demo_data: boolean
          grade: string | null
          id: string
          name: string
          school_id: string | null
          school_year: number | null
          shift: Database["public"]["Enums"]["class_shift"] | null
          teacher_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          demo_data?: boolean
          grade?: string | null
          id?: string
          name: string
          school_id?: string | null
          school_year?: number | null
          shift?: Database["public"]["Enums"]["class_shift"] | null
          teacher_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          demo_data?: boolean
          grade?: string | null
          id?: string
          name?: string
          school_id?: string | null
          school_year?: number | null
          shift?: Database["public"]["Enums"]["class_shift"] | null
          teacher_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          abdominal_reps: number | null
          age_years: number | null
          ai_diagnosis: string | null
          ai_family: string | null
          ai_goals: Json | null
          ai_technical: string | null
          classifications: Json
          created_at: string
          demo_data: boolean
          evaluated_at: string
          evaluator_id: string | null
          height_cm: number | null
          hip_cm: number | null
          horizontal_jump_cm: number | null
          id: string
          imc: number | null
          medicine_ball_m: number | null
          notes: string | null
          rce: number | null
          run_6min_m: number | null
          sit_and_reach_cm: number | null
          sprint_20m_s: number | null
          square_test_s: number | null
          student_id: string
          tenant_id: string
          updated_at: string
          waist_cm: number | null
          weight_kg: number | null
          wingspan_cm: number | null
        }
        Insert: {
          abdominal_reps?: number | null
          age_years?: number | null
          ai_diagnosis?: string | null
          ai_family?: string | null
          ai_goals?: Json | null
          ai_technical?: string | null
          classifications?: Json
          created_at?: string
          demo_data?: boolean
          evaluated_at?: string
          evaluator_id?: string | null
          height_cm?: number | null
          hip_cm?: number | null
          horizontal_jump_cm?: number | null
          id?: string
          imc?: number | null
          medicine_ball_m?: number | null
          notes?: string | null
          rce?: number | null
          run_6min_m?: number | null
          sit_and_reach_cm?: number | null
          sprint_20m_s?: number | null
          square_test_s?: number | null
          student_id: string
          tenant_id: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
          wingspan_cm?: number | null
        }
        Update: {
          abdominal_reps?: number | null
          age_years?: number | null
          ai_diagnosis?: string | null
          ai_family?: string | null
          ai_goals?: Json | null
          ai_technical?: string | null
          classifications?: Json
          created_at?: string
          demo_data?: boolean
          evaluated_at?: string
          evaluator_id?: string | null
          height_cm?: number | null
          hip_cm?: number | null
          horizontal_jump_cm?: number | null
          id?: string
          imc?: number | null
          medicine_ball_m?: number | null
          notes?: string | null
          rce?: number | null
          run_6min_m?: number | null
          sit_and_reach_cm?: number | null
          sprint_20m_s?: number | null
          square_test_s?: number | null
          student_id?: string
          tenant_id?: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
          wingspan_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          color: string | null
          created_at: string
          demo_data: boolean
          description: string | null
          display_name: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          demo_data?: boolean
          description?: string | null
          display_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          demo_data?: boolean
          description?: string | null
          display_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          external_id: string | null
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          tenant_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          tenant_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          max_evaluations: number | null
          max_schools: number | null
          max_storage_mb: number | null
          max_students: number
          max_users: number
          name: string
          price_monthly: number
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_evaluations?: number | null
          max_schools?: number | null
          max_storage_mb?: number | null
          max_students: number
          max_users: number
          name: string
          price_monthly?: number
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_evaluations?: number | null
          max_schools?: number | null
          max_storage_mb?: number | null
          max_students?: number
          max_users?: number
          name?: string
          price_monthly?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      portal_access_logs: {
        Row: {
          accessed_at: string
          id: string
          ip: string | null
          student_id: string
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          id?: string
          ip?: string | null
          student_id: string
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          id?: string
          ip?: string | null
          student_id?: string
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_access_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_tenant_id: string | null
          email: string | null
          full_name: string | null
          id: string
          impersonating_tenant_id: string | null
          impersonation_original_tenant_id: string | null
          impersonation_started_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_tenant_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          impersonating_tenant_id?: string | null
          impersonation_original_tenant_id?: string | null
          impersonation_started_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_tenant_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          impersonating_tenant_id?: string | null
          impersonation_original_tenant_id?: string | null
          impersonation_started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_impersonating_tenant_id_fkey"
            columns: ["impersonating_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_impersonation_original_tenant_id_fkey"
            columns: ["impersonation_original_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          demo_data: boolean
          description: string | null
          display_name: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          network: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          state: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          demo_data?: boolean
          description?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          network?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          state?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          demo_data?: boolean
          description?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          network?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          state?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          birth_date: string
          class_id: string | null
          cpf: string | null
          created_at: string
          demo_data: boolean
          disability_type: string | null
          email: string | null
          father_name: string | null
          full_name: string
          group_id: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          has_disability: boolean
          id: string
          is_active: boolean
          medical_notes: string | null
          mother_name: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          portal_enabled: boolean
          portal_last_access: string | null
          portal_slug: string | null
          portal_token: string | null
          portal_token_created_at: string | null
          portal_views: number
          practice_time_months: number | null
          rg: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          sport_modality: string | null
          tenant_id: string
          updated_at: string
          weekly_frequency: number | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          birth_date: string
          class_id?: string | null
          cpf?: string | null
          created_at?: string
          demo_data?: boolean
          disability_type?: string | null
          email?: string | null
          father_name?: string | null
          full_name: string
          group_id?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          has_disability?: boolean
          id?: string
          is_active?: boolean
          medical_notes?: string | null
          mother_name?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_enabled?: boolean
          portal_last_access?: string | null
          portal_slug?: string | null
          portal_token?: string | null
          portal_token_created_at?: string | null
          portal_views?: number
          practice_time_months?: number | null
          rg?: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          sport_modality?: string | null
          tenant_id: string
          updated_at?: string
          weekly_frequency?: number | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          birth_date?: string
          class_id?: string | null
          cpf?: string | null
          created_at?: string
          demo_data?: boolean
          disability_type?: string | null
          email?: string | null
          father_name?: string | null
          full_name?: string
          group_id?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          has_disability?: boolean
          id?: string
          is_active?: boolean
          medical_notes?: string | null
          mother_name?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_enabled?: boolean
          portal_last_access?: string | null
          portal_slug?: string | null
          portal_token?: string | null
          portal_token_created_at?: string | null
          portal_views?: number
          practice_time_months?: number | null
          rg?: string | null
          sex?: Database["public"]["Enums"]["sex_type"]
          sport_modality?: string | null
          tenant_id?: string
          updated_at?: string
          weekly_frequency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number
          amount_yearly_cents: number
          billing_cycle: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          discount_cents: number
          id: string
          notes: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_status: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          amount_yearly_cents?: number
          billing_cycle?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          discount_cents?: number
          id?: string
          notes?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          amount_yearly_cents?: number
          billing_cycle?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          discount_cents?: number
          id?: string
          notes?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          id: string
          opened_by: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opened_by?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opened_by?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          active_tenants: number | null
          arr_cents: number | null
          created_at: string
          id: string
          metric_date: string
          mrr_cents: number | null
          payload: Json | null
          suspended_tenants: number | null
          total_evaluations: number | null
          total_students: number | null
          total_users: number | null
          trial_tenants: number | null
        }
        Insert: {
          active_tenants?: number | null
          arr_cents?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          mrr_cents?: number | null
          payload?: Json | null
          suspended_tenants?: number | null
          total_evaluations?: number | null
          total_students?: number | null
          total_users?: number | null
          trial_tenants?: number | null
        }
        Update: {
          active_tenants?: number | null
          arr_cents?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          mrr_cents?: number | null
          payload?: Json | null
          suspended_tenants?: number | null
          total_evaluations?: number | null
          total_students?: number | null
          total_users?: number | null
          trial_tenants?: number | null
        }
        Relationships: []
      }
      team_contacts: {
        Row: {
          created_at: string
          demo_data: boolean
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          demo_data?: boolean
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          demo_data?: boolean
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_ai_credentials: {
        Row: {
          api_key_ciphertext: string | null
          api_key_fingerprint: string | null
          api_key_iv: string | null
          api_key_tag: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_test_error: string | null
          last_test_latency_ms: number | null
          last_test_ok: boolean | null
          last_tested_at: string | null
          model: string
          prompt_version: string
          provider: Database["public"]["Enums"]["ai_provider"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          api_key_ciphertext?: string | null
          api_key_fingerprint?: string | null
          api_key_iv?: string | null
          api_key_tag?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_latency_ms?: number | null
          last_test_ok?: boolean | null
          last_tested_at?: string | null
          model: string
          prompt_version?: string
          provider: Database["public"]["Enums"]["ai_provider"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          api_key_ciphertext?: string | null
          api_key_fingerprint?: string | null
          api_key_iv?: string | null
          api_key_tag?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_latency_ms?: number | null
          last_test_ok?: boolean | null
          last_tested_at?: string | null
          model?: string
          prompt_version?: string
          provider?: Database["public"]["Enums"]["ai_provider"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_ai_credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["member_role"]
          status: string
          tenant_id: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          tenant_id: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          tenant_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          city: string | null
          cnpj: string | null
          contact_name: string | null
          created_at: string
          demo_data: boolean
          description: string | null
          display_name: string | null
          email: string | null
          id: string
          internal_notes: string | null
          is_active: boolean
          last_login_at: string | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          plan_id: string
          primary_color: string | null
          secondary_color: string | null
          state: string | null
          status: string
          type: Database["public"]["Enums"]["tenant_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          demo_data?: boolean
          description?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          last_login_at?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          plan_id: string
          primary_color?: string | null
          secondary_color?: string | null
          state?: string | null
          status?: string
          type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          demo_data?: boolean
          description?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          last_login_at?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          plan_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          state?: string | null
          status?: string
          type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _classify_higher: {
        Args: { cuts: number[]; val: number }
        Returns: string
      }
      _classify_lower: {
        Args: { cuts: number[]; val: number }
        Returns: string
      }
      _cuts: {
        Args: { age: number; kind: string; sex: string }
        Returns: number[]
      }
      _imc_zone: {
        Args: { age: number; imc: number; sex: string }
        Returns: string
      }
      _portal_unique_slug: { Args: { _name: string }; Returns: string }
      _rce_zone: { Args: { rce: number }; Returns: string }
      _slugify: { Args: { _input: string }; Returns: string }
      accept_admin_invitation: {
        Args: { _token: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      accept_invitation: { Args: { _token: string }; Returns: string }
      can_write_tenant: { Args: { _tenant: string }; Returns: boolean }
      class_stats: { Args: { _class: string }; Returns: Json }
      compute_eval_classifications: {
        Args: {
          _abdo: number
          _age: number
          _flex: number
          _height: number
          _imc: number
          _jump: number
          _mball: number
          _rce: number
          _run6: number
          _sex: string
          _sprint: number
          _square: number
          _waist: number
          _weight: number
        }
        Returns: Json
      }
      consolidated_classifications: {
        Args: { _student: string }
        Returns: Json
      }
      create_demo_environment: { Args: never; Returns: string }
      create_tenant_with_owner: {
        Args: {
          _name: string
          _type?: Database["public"]["Enums"]["tenant_type"]
        }
        Returns: string
      }
      delete_demo_environment: { Args: never; Returns: number }
      end_impersonation: { Args: never; Returns: string }
      get_demo_tenant: { Args: never; Returns: string }
      get_tenant_ai_config: { Args: { _tenant: string }; Returns: Json }
      group_stats: { Args: { _group: string }; Returns: Json }
      has_admin_role: {
        Args: {
          _role: Database["public"]["Enums"]["admin_role"]
          _user: string
        }
        Returns: boolean
      }
      has_tenant_role: {
        Args: {
          _role: Database["public"]["Enums"]["member_role"]
          _tenant: string
        }
        Returns: boolean
      }
      impersonate_tenant: { Args: { _tenant: string }; Returns: string }
      is_platform_admin: { Args: { _user: string }; Returns: boolean }
      is_super_admin: { Args: { _user: string }; Returns: boolean }
      is_tenant_admin: { Args: { _tenant: string }; Returns: boolean }
      is_tenant_member: { Args: { _tenant: string }; Returns: boolean }
      portal_get_data: { Args: { _token: string }; Returns: Json }
      portal_log_access: {
        Args: { _ip?: string; _token: string; _ua?: string }
        Returns: undefined
      }
      portal_regenerate_token: { Args: { _student: string }; Returns: string }
      portal_set_enabled: {
        Args: { _enabled: boolean; _student: string }
        Returns: undefined
      }
      restore_demo_environment: { Args: never; Returns: string }
      school_stats: { Args: { _school: string }; Returns: Json }
      tenant_can_add_student: { Args: { _tenant: string }; Returns: boolean }
      touch_tenant_last_login: { Args: { _tenant: string }; Returns: undefined }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "admin_financeiro"
        | "admin_suporte"
        | "admin_operacional"
      ai_provider: "openai" | "google" | "anthropic" | "xai"
      class_shift: "morning" | "afternoon" | "evening" | "full"
      member_role: "admin" | "evaluator" | "viewer"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      sex_type: "male" | "female"
      subscription_status:
        | "trial"
        | "active"
        | "canceled"
        | "suspended"
        | "past_due"
      tenant_type:
        | "professor"
        | "school"
        | "academy"
        | "club"
        | "personal_trainer"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status: "open" | "pending" | "resolved" | "closed"
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
    Enums: {
      admin_role: [
        "super_admin",
        "admin_financeiro",
        "admin_suporte",
        "admin_operacional",
      ],
      ai_provider: ["openai", "google", "anthropic", "xai"],
      class_shift: ["morning", "afternoon", "evening", "full"],
      member_role: ["admin", "evaluator", "viewer"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      sex_type: ["male", "female"],
      subscription_status: [
        "trial",
        "active",
        "canceled",
        "suspended",
        "past_due",
      ],
      tenant_type: [
        "professor",
        "school",
        "academy",
        "club",
        "personal_trainer",
      ],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: ["open", "pending", "resolved", "closed"],
    },
  },
} as const
