/**
 * Enhanced API Response Types
 * Provides strict typing for all API responses
 */

/**
 * Standard Supabase API response structure
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

/**
 * Supabase error structure
 */
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Event API response types
 */
export interface EventSearchResult {
  events: EventSearchItem[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface EventSearchItem {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  format: string;
  country?: string;
  city?: string;
  specialty_slug?: string;
  has_cme?: boolean;
  is_free?: boolean;
  featured_image?: string;
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