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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      crawl_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          errors: Json | null
          events_created: number | null
          events_discovered: number | null
          events_updated: number | null
          id: string
          metadata: Json | null
          source_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          events_created?: number | null
          events_discovered?: number | null
          events_updated?: number | null
          id?: string
          metadata?: Json | null
          source_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          events_created?: number | null
          events_discovered?: number | null
          events_updated?: number | null
          id?: string
          metadata?: Json | null
          source_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawl_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "event_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      event_duplicates: {
        Row: {
          action_taken: string | null
          created_at: string
          duplicate_of: string
          event_id: string
          id: string
          match_criteria: string[]
          reviewed: boolean | null
          similarity_score: number
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          duplicate_of: string
          event_id: string
          id?: string
          match_criteria: string[]
          reviewed?: boolean | null
          similarity_score: number
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          duplicate_of?: string
          event_id?: string
          id?: string
          match_criteria?: string[]
          reviewed?: boolean | null
          similarity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_duplicates_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "medical_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_duplicates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "medical_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_interactions: {
        Row: {
          created_at: string
          event_id: string
          id: string
          interaction_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "medical_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registration_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registration_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registration_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sources: {
        Row: {
          crawl_delay_seconds: number | null
          crawl_enabled: boolean | null
          crawl_frequency: string | null
          created_at: string
          created_by: string | null
          failure_count: number | null
          id: string
          last_crawled_at: string | null
          max_pages: number | null
          name: string
          next_crawl_at: string | null
          respect_robots_txt: boolean | null
          selectors: Json | null
          source_type: string
          success_count: number | null
          updated_at: string
          url: string
        }
        Insert: {
          crawl_delay_seconds?: number | null
          crawl_enabled?: boolean | null
          crawl_frequency?: string | null
          created_at?: string
          created_by?: string | null
          failure_count?: number | null
          id?: string
          last_crawled_at?: string | null
          max_pages?: number | null
          name: string
          next_crawl_at?: string | null
          respect_robots_txt?: boolean | null
          selectors?: Json | null
          source_type?: string
          success_count?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          crawl_delay_seconds?: number | null
          crawl_enabled?: boolean | null
          crawl_frequency?: string | null
          created_at?: string
          created_by?: string | null
          failure_count?: number | null
          id?: string
          last_crawled_at?: string | null
          max_pages?: number | null
          name?: string
          next_crawl_at?: string | null
          respect_robots_txt?: boolean | null
          selectors?: Json | null
          source_type?: string
          success_count?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      event_specialties: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean | null
          level: number
          name_ar: string | null
          name_en: string
          parent_id: string | null
          slug: string
          synonyms: string[] | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          level?: number
          name_ar?: string | null
          name_en: string
          parent_id?: string | null
          slug: string
          synonyms?: string[] | null
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          level?: number
          name_ar?: string | null
          name_en?: string
          parent_id?: string | null
          slug?: string
          synonyms?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "event_specialties_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "event_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tag_relations: {
        Row: {
          event_id: string
          tag_id: string
        }
        Insert: {
          event_id: string
          tag_id: string
        }
        Update: {
          event_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tag_relations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "medical_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "event_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_featured: boolean | null
          name_ar: string | null
          name_en: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          name_ar?: string | null
          name_en: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          name_ar?: string | null
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      medical_events: {
        Row: {
          accreditation_details: Json | null
          accreditation_url: string | null
          ai_extracted_fields: Json | null
          approved_at: string | null
          approved_by: string | null
          capacity: number | null
          city: string | null
          click_count: number | null
          cme_hours: number | null
          cme_points: number | null
          cme_provider: string | null
          compliance_checked: boolean | null
          confidence_score: number | null
          country: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          description_ar: string | null
          end_date: string
          featured_image: string | null
          fetched_at: string | null
          format: string
          gallery_images: string[] | null
          has_cme: boolean | null
          id: string
          is_free: boolean | null
          languages: string[] | null
          moderation_flags: string[] | null
          online_url: string | null
          organizer: string | null
          organizer_email: string | null
          organizer_phone: string | null
          organizer_website: string | null
          price_range: string | null
          registered_count: number | null
          registration_deadline: string | null
          registration_required: boolean | null
          registration_url: string | null
          review_notes: string | null
          save_count: number | null
          seo_description: string | null
          seo_title: string | null
          share_count: number | null
          slug: string
          source_id: string | null
          source_url: string | null
          specialty_slug: string | null
          start_date: string
          status: string
          subspecialties: string[] | null
          subspecialty: string | null
          summary: string | null
          summary_ar: string | null
          target_audience: string[] | null
          timezone: string
          title: string
          title_ar: string | null
          updated_at: string
          venue_address: string | null
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string | null
          view_count: number | null
        }
        Insert: {
          accreditation_details?: Json | null
          accreditation_url?: string | null
          ai_extracted_fields?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          capacity?: number | null
          city?: string | null
          click_count?: number | null
          cme_hours?: number | null
          cme_points?: number | null
          cme_provider?: string | null
          compliance_checked?: boolean | null
          confidence_score?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          end_date: string
          featured_image?: string | null
          fetched_at?: string | null
          format?: string
          gallery_images?: string[] | null
          has_cme?: boolean | null
          id?: string
          is_free?: boolean | null
          languages?: string[] | null
          moderation_flags?: string[] | null
          online_url?: string | null
          organizer?: string | null
          organizer_email?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          price_range?: string | null
          registered_count?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          review_notes?: string | null
          save_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug: string
          source_id?: string | null
          source_url?: string | null
          specialty_slug?: string | null
          start_date: string
          status?: string
          subspecialties?: string[] | null
          subspecialty?: string | null
          summary?: string | null
          summary_ar?: string | null
          target_audience?: string[] | null
          timezone?: string
          title: string
          title_ar?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          view_count?: number | null
        }
        Update: {
          accreditation_details?: Json | null
          accreditation_url?: string | null
          ai_extracted_fields?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          capacity?: number | null
          city?: string | null
          click_count?: number | null
          cme_hours?: number | null
          cme_points?: number | null
          cme_provider?: string | null
          compliance_checked?: boolean | null
          confidence_score?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          end_date?: string
          featured_image?: string | null
          fetched_at?: string | null
          format?: string
          gallery_images?: string[] | null
          has_cme?: boolean | null
          id?: string
          is_free?: boolean | null
          languages?: string[] | null
          moderation_flags?: string[] | null
          online_url?: string | null
          organizer?: string | null
          organizer_email?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          price_range?: string | null
          registered_count?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          review_notes?: string | null
          save_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug?: string
          source_id?: string | null
          source_url?: string | null
          specialty_slug?: string | null
          start_date?: string
          status?: string
          subspecialties?: string[] | null
          subspecialty?: string | null
          summary?: string | null
          summary_ar?: string | null
          target_audience?: string[] | null
          timezone?: string
          title?: string
          title_ar?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "event_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          manufacturer: string | null
          name: string
          price_range: string | null
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          manufacturer?: string | null
          name: string
          price_range?: string | null
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          manufacturer?: string | null
          name?: string
          price_range?: string | null
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          organization: string | null
          primary_specialty_slug: string | null
          profile_type: string
          specialty: string | null
          subscription_currency: string | null
          subscription_end_date: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_price: number | null
          subscription_start_date: string | null
          subscription_status: string | null
          subspecialties: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          organization?: string | null
          primary_specialty_slug?: string | null
          profile_type: string
          specialty?: string | null
          subscription_currency?: string | null
          subscription_end_date?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_price?: number | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subspecialties?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          organization?: string | null
          primary_specialty_slug?: string | null
          profile_type?: string
          specialty?: string | null
          subscription_currency?: string | null
          subscription_end_date?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_price?: number | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subspecialties?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      public_medical_events: {
        Row: {
          accreditation_details: Json | null
          accreditation_url: string | null
          capacity: number | null
          city: string | null
          click_count: number | null
          cme_hours: number | null
          cme_points: number | null
          cme_provider: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          description_ar: string | null
          end_date: string
          featured_image: string | null
          format: string | null
          gallery_images: string[] | null
          has_cme: boolean | null
          id: string
          is_free: boolean | null
          languages: string[] | null
          online_url: string | null
          organizer: string | null
          organizer_website: string | null
          price_range: string | null
          registered_count: number | null
          registration_deadline: string | null
          registration_required: boolean | null
          registration_url: string | null
          save_count: number | null
          seo_description: string | null
          seo_title: string | null
          share_count: number | null
          slug: string
          source_url: string | null
          specialty_slug: string | null
          start_date: string
          status: string | null
          subspecialties: string[] | null
          subspecialty: string | null
          summary: string | null
          summary_ar: string | null
          target_audience: string[] | null
          timezone: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
          venue_address: string | null
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string | null
          view_count: number | null
        }
        Insert: {
          accreditation_details?: Json | null
          accreditation_url?: string | null
          capacity?: number | null
          city?: string | null
          click_count?: number | null
          cme_hours?: number | null
          cme_points?: number | null
          cme_provider?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          end_date: string
          featured_image?: string | null
          format?: string | null
          gallery_images?: string[] | null
          has_cme?: boolean | null
          id: string
          is_free?: boolean | null
          languages?: string[] | null
          online_url?: string | null
          organizer?: string | null
          organizer_website?: string | null
          price_range?: string | null
          registered_count?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          save_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug: string
          source_url?: string | null
          specialty_slug?: string | null
          start_date: string
          status?: string | null
          subspecialties?: string[] | null
          subspecialty?: string | null
          summary?: string | null
          summary_ar?: string | null
          target_audience?: string[] | null
          timezone?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          view_count?: number | null
        }
        Update: {
          accreditation_details?: Json | null
          accreditation_url?: string | null
          capacity?: number | null
          city?: string | null
          click_count?: number | null
          cme_hours?: number | null
          cme_points?: number | null
          cme_provider?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          end_date?: string
          featured_image?: string | null
          format?: string | null
          gallery_images?: string[] | null
          has_cme?: boolean | null
          id?: string
          is_free?: boolean | null
          languages?: string[] | null
          online_url?: string | null
          organizer?: string | null
          organizer_website?: string | null
          price_range?: string | null
          registered_count?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          save_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug?: string
          source_url?: string | null
          specialty_slug?: string | null
          start_date?: string
          status?: string | null
          subspecialties?: string[] | null
          subspecialty?: string | null
          summary?: string | null
          summary_ar?: string | null
          target_audience?: string[] | null
          timezone?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      rfqs: {
        Row: {
          budget_range: string | null
          buyer_id: string
          category_id: string | null
          created_at: string | null
          delivery_location: string | null
          description: string
          id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          buyer_id: string
          category_id?: string | null
          created_at?: string | null
          delivery_location?: string | null
          description: string
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          buyer_id?: string
          category_id?: string | null
          created_at?: string | null
          delivery_location?: string | null
          description?: string
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          alert_enabled: boolean | null
          alert_frequency: string | null
          created_at: string
          id: string
          last_alert_sent: string | null
          name: string
          query: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean | null
          alert_frequency?: string | null
          created_at?: string
          id?: string
          last_alert_sent?: string | null
          name: string
          query: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_enabled?: boolean | null
          alert_frequency?: string | null
          created_at?: string
          id?: string
          last_alert_sent?: string | null
          name?: string
          query?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          accessed_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          operation: string
          table_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          accessed_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          operation: string
          table_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          accessed_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          operation?: string
          table_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      safe_professional_directory: {
        Row: {
          country: string | null
          created_at: string | null
          id: string | null
          primary_specialty_slug: string | null
          profile_type: string | null
          specialty: string | null
          verified: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      audit_public_view_safety: {
        Args: Record<PropertyKey, never>
        Returns: {
          exposed_fields_count: number
          risk_assessment: string
          security_status: string
          view_name: string
        }[]
      }
      can_access_crawl_sensitive_data: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_access_organizer_data: {
        Args: { event_id: string }
        Returns: boolean
      }
      can_access_profile_data: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_access_profile_data_enhanced: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_see_user_email: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      check_profile_access_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_profiles_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          security_check: string
          status: string
        }[]
      }
      check_rate_limit: {
        Args:
          | {
              action_type: string
              max_attempts?: number
              user_id_input: string
              window_minutes?: number
            }
          | {
              max_requests: number
              operation_name: string
              time_window: unknown
            }
        Returns: boolean
      }
      comprehensive_security_audit: {
        Args: Record<PropertyKey, never>
        Returns: {
          audit_category: string
          check_name: string
          details: string
          recommendation: string
          risk_level: string
          status: string
        }[]
      }
      comprehensive_security_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          check_name: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      get_crawl_job_sensitive_data: {
        Args: { job_id: string }
        Returns: {
          errors: Json
          failure_count: number
          metadata: Json
        }[]
      }
      get_crawl_jobs_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_at: string
          created_at: string
          events_created: number
          events_discovered: number
          events_updated: number
          id: string
          source_id: string
          started_at: string
          status: string
        }[]
      }
      get_current_user_profile_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_organizer_contact_info: {
        Args: { event_id: string }
        Returns: {
          moderation_flags: string[]
          organizer_email: string
          organizer_phone: string
          organizer_website: string
          review_notes: string
        }[]
      }
      get_safe_medical_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          accreditation_details: Json
          accreditation_url: string
          capacity: number
          city: string
          click_count: number
          cme_hours: number
          cme_points: number
          cme_provider: string
          country: string
          created_at: string
          currency: string
          description: string
          description_ar: string
          end_date: string
          featured_image: string
          format: string
          gallery_images: string[]
          has_cme: boolean
          id: string
          is_free: boolean
          languages: string[]
          online_url: string
          organizer: string
          organizer_website: string
          price_range: string
          registered_count: number
          registration_deadline: string
          registration_required: boolean
          registration_url: string
          save_count: number
          seo_description: string
          seo_title: string
          share_count: number
          slug: string
          source_url: string
          specialty_slug: string
          start_date: string
          status: string
          subspecialties: string[]
          subspecialty: string
          summary: string
          summary_ar: string
          target_audience: string[]
          timezone: string
          title: string
          title_ar: string
          updated_at: string
          venue_address: string
          venue_lat: number
          venue_lng: number
          venue_name: string
          view_count: number
        }[]
      }
      get_safe_organizer_display: {
        Args: { event_id: string; include_sensitive?: boolean }
        Returns: {
          can_access_full_contact: boolean
          organizer_email_masked: string
          organizer_name: string
          organizer_phone_masked: string
          organizer_website: string
        }[]
      }
      get_safe_professional_directory: {
        Args: Record<PropertyKey, never>
        Returns: {
          country: string
          created_at: string
          id: string
          primary_specialty_slug: string
          profile_type: string
          specialty: string
          verified: boolean
        }[]
      }
      get_safe_profile_by_username: {
        Args: { username_input: string }
        Returns: {
          avatar_url: string
          country: string
          id: string
          member_since_year: number
          organization: string
          primary_specialty_slug: string
          profile_type: string
          specialty: string
          title: string
          username: string
          verified: boolean
        }[]
      }
      get_safe_profile_summary: {
        Args: { target_user_id: string }
        Returns: {
          country: string
          created_date: string
          is_verified: boolean
          profile_exists: boolean
          profile_type: string
        }[]
      }
      get_safe_rfq_display: {
        Args: { include_sensitive?: boolean; rfq_id: string }
        Returns: {
          budget_range_masked: string
          can_access_full_details: boolean
          category_id: string
          created_at: string
          delivery_location: string
          description_masked: string
          id: string
          is_buyer: boolean
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_safe_user_summary: {
        Args: { target_user_id: string }
        Returns: {
          country_region: string
          is_verified: boolean
          member_since: string
          profile_exists: boolean
          specialty_area: string
        }[]
      }
      get_secure_public_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          country: string
          created_date: string
          id: string
          member_since_year: number
          organization: string
          primary_specialty_slug: string
          profile_type: string
          specialty: string
          subspecialties: string[]
          title: string
          user_id: string
          username: string
          verified: boolean
        }[]
      }
      get_security_compliance_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          compliance_item: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      handle_subscription_signup: {
        Args: {
          plan_price?: number
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          user_email: string
          user_name: string
          user_password: string
        }
        Returns: Json
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_verified_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_username_available: {
        Args: { username_input: string }
        Returns: boolean
      }
      safe_search_events: {
        Args: {
          limit_count?: number
          search_term?: string
          specialty_filter?: string
        }
        Returns: {
          city: string
          country: string
          end_date: string
          format: string
          id: string
          is_free: boolean
          slug: string
          specialty_slug: string
          start_date: string
          title: string
        }[]
      }
      sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      validate_all_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_count: number
          rls_status: string
          security_level: string
          table_name: string
        }[]
      }
      validate_complete_profile_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      validate_crawl_operation: {
        Args: { operation_type: string }
        Returns: boolean
      }
      validate_email: {
        Args: { email_input: string }
        Returns: boolean
      }
      validate_enhanced_profile_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      validate_event_registrations_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue_description: string
          policy_name: string
          policy_type: string
          security_status: string
        }[]
      }
      validate_medical_events_complete_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      validate_no_pii_exposure: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      validate_professional_directory_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      validate_profile_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          security_check: string
          status: string
        }[]
      }
      validate_profiles_security_final: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      validate_public_views_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_level: string
          security_status: string
          sensitive_fields_check: string
          view_name: string
        }[]
      }
      validate_rfq_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      validate_security_functions: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          has_search_path: boolean
          has_security_definer: boolean
          security_status: string
        }[]
      }
      validate_specialty_slug: {
        Args: { slug: string }
        Returns: boolean
      }
      validate_username: {
        Args: { username_input: string }
        Returns: boolean
      }
      validate_zero_pii_exposure: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      verify_crawl_jobs_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      verify_email_protection: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          security_aspect: string
          status: string
        }[]
      }
      verify_medical_events_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      verify_organizer_contact_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      verify_profiles_rls_fix: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      verify_profiles_security_enhancement: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      view_security_audit: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_sensitive_data: boolean
          is_security_definer: boolean
          owner_name: string
          recommendation: string
          security_rating: string
          view_name: string
        }[]
      }
    }
    Enums: {
      subscription_plan:
        | "medical_institute_buyers"
        | "medical_sellers_monthly"
        | "medical_sellers_yearly"
        | "medical_personnel"
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
    Enums: {
      subscription_plan: [
        "medical_institute_buyers",
        "medical_sellers_monthly",
        "medical_sellers_yearly",
        "medical_personnel",
      ],
    },
  },
} as const
