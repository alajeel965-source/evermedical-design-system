/**
 * Enhanced API Response Types
 * 
 * Provides strict typing for all API responses throughout the EverMedical platform.
 * Ensures type safety for Supabase interactions and custom API endpoints.
 * 
 * @fileoverview Type definitions for API responses, form data, and component actions
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * Standard Supabase API response structure
 * 
 * @template T - The type of data returned on success
 */
export interface SupabaseResponse<T> {
  /** The returned data on success, null on error */
  data: T | null;
  /** Error details if the operation failed, null on success */
  error: SupabaseError | null;
}

/**
 * Supabase error structure
 * Standardized error format from Supabase operations
 */
export interface SupabaseError {
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: string;
  /** Helpful hint for resolving the error */
  hint?: string;
  /** Error code for programmatic handling */
  code?: string;
}

/**
 * Event API response types
 * Used for medical event search and discovery features
 */
export interface EventSearchResult {
  /** Array of matching events */
  events: EventSearchItem[];
  /** Total number of events matching the search criteria */
  total: number;
  /** Whether more results are available for pagination */
  hasMore: boolean;
  /** Current page number (0-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
}

/**
 * Individual event item in search results
 * Optimized structure for event listings and cards
 */
export interface EventSearchItem {
  /** Unique event identifier */
  id: string;
  /** Event title */
  title: string;
  /** Event start date (ISO 8601 format) */
  start_date: string;
  /** Event end date (ISO 8601 format) */
  end_date: string;
  /** Event format: in-person, virtual, or hybrid */
  format: string;
  /** Country where event is held */
  country?: string;
  /** City where event is held */
  city?: string;
  /** Medical specialty slug for categorization */
  specialty_slug?: string;
  /** Whether event offers CME credits */
  has_cme?: boolean;
  /** Whether event is free to attend */
  is_free?: boolean;
  /** Featured image URL for event promotion */
  featured_image?: string;
  /** Number of registered attendees */
  registered_count?: number;
}

/**
 * Profile form data types
 */
export interface BaseProfileData {
  username: string;
  email: string;
  country?: string;
  avatar_url?: string;
  profile_type: 'medical_personnel' | 'medical_institute' | 'medical_seller';
}

export interface MedicalPersonnelProfileData extends BaseProfileData {
  profile_type: 'medical_personnel';
  first_name: string;
  last_name: string;
  title?: string;
  organization?: string;
  specialty?: string;
}

export interface MedicalInstituteProfileData extends BaseProfileData {
  profile_type: 'medical_institute';
  organization: string;
  title?: string; // Institution type
}

export interface MedicalSellerProfileData extends BaseProfileData {
  profile_type: 'medical_seller';
  first_name: string;
  last_name: string;
  title?: string; // Company role
  organization?: string; // Company name
}

export type ProfileFormData = MedicalPersonnelProfileData | MedicalInstituteProfileData | MedicalSellerProfileData;

/**
 * Form field value types
 */
export type FormFieldValue = string | number | boolean | string[] | Date | null | undefined;

/**
 * Generic form values type
 */
export type FormValues<T extends Record<string, FormFieldValue>> = T;

/**
 * Action callback types
 */
export interface ActionCallback<T = void> {
  (): T | Promise<T>;
}

export interface ActionCallbackWithData<TData, TReturn = void> {
  (data: TData): TReturn | Promise<TReturn>;
}

/**
 * Component action types
 */
export interface ComponentAction {
  id: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ComponentType;
  onClick: ActionCallback;
}

/**
 * Search and filter parameter types
 */
export interface SearchParameters {
  query?: string;
  specialty?: string;
  country?: string;
  city?: string;
  format?: string;
  has_cme?: boolean;
  is_free?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

/**
 * Analytics event data types
 */
export interface AnalyticsEventData {
  event_name: string;
  properties?: Record<string, string | number | boolean>;
  user_id?: string;
  session_id?: string;
  timestamp?: string;
}