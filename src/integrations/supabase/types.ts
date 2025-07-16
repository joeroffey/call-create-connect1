export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          target_id: string
          target_type: string
          team_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          target_id: string
          target_type: string
          team_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          target_id?: string
          target_type?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_document_folders: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          parent_folder_id: string | null
          project_id: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          parent_folder_id?: string | null
          project_id: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          project_id?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "completion_document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_document_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_document_folders_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      content_gap_analysis: {
        Row: {
          avg_pinecone_confidence: number | null
          created_at: string
          flagged_for_review: boolean | null
          frequency: number | null
          id: string
          question_theme: string
          review_status: string | null
          sample_questions: string[] | null
          updated_at: string
        }
        Insert: {
          avg_pinecone_confidence?: number | null
          created_at?: string
          flagged_for_review?: boolean | null
          frequency?: number | null
          id?: string
          question_theme: string
          review_status?: string | null
          sample_questions?: string[] | null
          updated_at?: string
        }
        Update: {
          avg_pinecone_confidence?: number | null
          created_at?: string
          flagged_for_review?: boolean | null
          frequency?: number | null
          id?: string
          question_theme?: string
          review_status?: string | null
          sample_questions?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_analytics: {
        Row: {
          ai_messages: number | null
          avg_pinecone_confidence: number | null
          conversation_id: string
          created_at: string
          follow_up_questions: number | null
          id: string
          pinecone_matches_used: number | null
          project_id: string | null
          resolved: boolean | null
          satisfaction_score: number | null
          time_to_resolution: number | null
          total_messages: number | null
          updated_at: string
          user_id: string
          user_messages: number | null
        }
        Insert: {
          ai_messages?: number | null
          avg_pinecone_confidence?: number | null
          conversation_id: string
          created_at?: string
          follow_up_questions?: number | null
          id?: string
          pinecone_matches_used?: number | null
          project_id?: string | null
          resolved?: boolean | null
          satisfaction_score?: number | null
          time_to_resolution?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
          user_messages?: number | null
        }
        Update: {
          ai_messages?: number | null
          avg_pinecone_confidence?: number | null
          conversation_id?: string
          created_at?: string
          follow_up_questions?: number | null
          id?: string
          pinecone_matches_used?: number | null
          project_id?: string | null
          resolved?: boolean | null
          satisfaction_score?: number | null
          time_to_resolution?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
          user_messages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation_analytics_conversation"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversation_analytics_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_permissions: {
        Row: {
          created_at: string
          folder_id: string
          granted_at: string
          granted_by: string
          id: string
          permission_level: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          granted_at?: string
          granted_by: string
          id?: string
          permission_level: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          granted_at?: string
          granted_by?: string
          id?: string
          permission_level?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_permissions_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "completion_document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_permissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      message_feedback: {
        Row: {
          conversation_id: string
          created_at: string
          feedback_text: string | null
          feedback_type: string
          id: string
          message_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          feedback_text?: string | null
          feedback_type: string
          id?: string
          message_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          message_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_message_feedback_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_message_feedback_message"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          project_id: string
          read: boolean
          target_id: string | null
          target_type: string | null
          team_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          project_id: string
          read?: boolean
          target_id?: string | null
          target_type?: string | null
          team_id: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          project_id?: string
          read?: boolean
          target_id?: string | null
          target_type?: string | null
          team_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      pinecone_query_analytics: {
        Row: {
          avg_confidence_score: number | null
          conversation_id: string
          created_at: string
          id: string
          message_id: string
          pinecone_matches: number | null
          query_text: string
          top_match_confidence: number | null
          user_found_helpful: boolean | null
        }
        Insert: {
          avg_confidence_score?: number | null
          conversation_id: string
          created_at?: string
          id?: string
          message_id: string
          pinecone_matches?: number | null
          query_text: string
          top_match_confidence?: number | null
          user_found_helpful?: boolean | null
        }
        Update: {
          avg_confidence_score?: number | null
          conversation_id?: string
          created_at?: string
          id?: string
          message_id?: string
          pinecone_matches?: number | null
          query_text?: string
          top_match_confidence?: number | null
          user_found_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pinecone_query_analytics_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pinecone_query_analytics_message"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          id: string
          mobile_number: string | null
          mobile_verification_code: string | null
          mobile_verification_expires_at: string | null
          mobile_verified: boolean | null
          occupation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          mobile_verification_code?: string | null
          mobile_verification_expires_at?: string | null
          mobile_verified?: boolean | null
          occupation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          mobile_verification_code?: string | null
          mobile_verification_expires_at?: string | null
          mobile_verified?: boolean | null
          occupation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_completion_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_id: string | null
          id: string
          project_id: string
          team_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_id?: string | null
          id?: string
          project_id: string
          team_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          project_id?: string
          team_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_completion_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "completion_document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_completion_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_completion_documents_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_permissions: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string
          id: string
          permission_level: string
          project_id: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by: string
          id?: string
          permission_level: string
          project_id: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string
          id?: string
          permission_level?: string
          project_id?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_permissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_permissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      project_plan_phases: {
        Row: {
          color: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          order_index: number
          phase_name: string
          project_id: string
          start_date: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          order_index?: number
          phase_name: string
          project_id: string
          start_date: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          order_index?: number
          phase_name?: string
          project_id?: string
          start_date?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_plan_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_plan_phases_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      project_schedule_of_works: {
        Row: {
          assigned_to: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          phase_id: string | null
          project_id: string
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          phase_id?: string | null
          project_id: string
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          phase_id?: string | null
          project_id?: string
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_schedule_of_works_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_plan_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          id: string
          label: string | null
          name: string
          pinned: boolean
          status: string
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          label?: string | null
          name: string
          pinned?: boolean
          status?: string
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          label?: string | null
          name?: string
          pinned?: boolean
          status?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          has_used_trial: boolean | null
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          has_used_trial?: boolean | null
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          has_used_trial?: boolean | null
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          id: string
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          id?: string
          plan_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          id?: string
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          assigned_to: string
          id: string
          task_id: string
          team_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          assigned_to: string
          id?: string
          task_id: string
          team_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          assigned_to?: string
          id?: string
          task_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule_of_works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activity: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          team_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: string
          team_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_projects: {
        Row: {
          id: string
          project_id: string
          shared_at: string
          shared_by: string
          team_id: string
        }
        Insert: {
          id?: string
          project_id: string
          shared_at?: string
          shared_by: string
          team_id: string
        }
        Update: {
          id?: string
          project_id?: string
          shared_at?: string
          shared_by?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_comment_notification: {
        Args: {
          p_comment_id: string
          p_author_id: string
          p_team_id: string
          p_target_id: string
          p_target_type: string
          p_content: string
        }
        Returns: boolean
      }
      create_document_upload_notification: {
        Args: {
          p_document_id: string
          p_uploader_id: string
          p_project_id: string
          p_team_id: string
          p_file_name: string
        }
        Returns: boolean
      }
      create_phase_status_notification: {
        Args: {
          p_phase_id: string
          p_project_id: string
          p_changed_by: string
          p_team_id: string
          p_old_status: string
          p_new_status: string
          p_phase_name: string
        }
        Returns: boolean
      }
      create_project_status_notification: {
        Args: {
          p_project_id: string
          p_changed_by: string
          p_team_id: string
          p_old_status: string
          p_new_status: string
          p_project_name: string
        }
        Returns: boolean
      }
      create_task_assignment_notification: {
        Args: {
          p_task_id: string
          p_assigned_to: string
          p_assigned_by: string
          p_project_id: string
          p_team_id: string
          p_task_title: string
        }
        Returns: boolean
      }
      create_task_completion_notification: {
        Args: {
          p_task_id: string
          p_completed_by: string
          p_project_id: string
          p_team_id: string
          p_task_title: string
        }
        Returns: boolean
      }
      fetch_building_regs_updates: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          update_date: string
          pages_crawled: number
          chunks_processed: number
          vectors_created: number
          status: string
          error_message: string
        }[]
      }
      get_project_task_count: {
        Args: { project_id: string }
        Returns: number
      }
      get_teams_for_user: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          name: string
          description: string
          owner_id: string
          created_at: string
          logo_url: string
        }[]
      }
      is_team_member: {
        Args: { user_id_param: string; team_id_param: string }
        Returns: boolean
      }
      is_user_team_member: {
        Args: { check_user_id: string; check_team_id: string }
        Returns: boolean
      }
      is_user_team_owner_or_admin: {
        Args: { check_user_id: string; check_team_id: string }
        Returns: boolean
      }
      search_documents: {
        Args: { query: string }
        Returns: {
          id: string
          title: string
          content: string
          file_path: string
          snippet: string
          url: string
          created_at: string
        }[]
      }
      user_can_access_project: {
        Args: { project_user_id: string; project_team_id: string }
        Returns: boolean
      }
      user_has_folder_permission: {
        Args: {
          p_user_id: string
          p_folder_id: string
          p_required_level: string
        }
        Returns: boolean
      }
      user_has_project_permission: {
        Args: {
          p_user_id: string
          p_project_id: string
          p_required_level: string
        }
        Returns: boolean
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
