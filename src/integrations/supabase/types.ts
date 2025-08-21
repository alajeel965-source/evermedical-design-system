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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          user_id?: string | null
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
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          verified?: boolean | null
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
            foreignKeyName: "rfqs_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          organization: string | null
          primary_specialty_slug: string | null
          profile_type: string | null
          specialty: string | null
          title: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          organization?: string | null
          primary_specialty_slug?: string | null
          profile_type?: string | null
          specialty?: string | null
          title?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          organization?: string | null
          primary_specialty_slug?: string | null
          profile_type?: string | null
          specialty?: string | null
          title?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_see_user_email: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          organization: string | null
          primary_specialty_slug: string | null
          profile_type: string | null
          specialty: string | null
          title: string | null
          user_id: string | null
          verified: boolean | null
        }
      }
      get_public_profile_safe: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          country: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          organization: string
          primary_specialty_slug: string
          profile_type: string
          specialty: string
          title: string
          user_id: string
          verified: boolean
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
      validate_specialty_slug: {
        Args: { slug: string }
        Returns: boolean
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
