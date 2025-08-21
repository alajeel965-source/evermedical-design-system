/**
 * EverMedical Platform Type Definitions
 * 
 * Comprehensive type definitions for the medical platform.
 * Provides type safety across the entire application.
 * 
 * @author EverMedical Team
 * @version 2.0.0
 */

/**
 * Base Entity Interface
 * Common fields for all database entities
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * User Profile Types
 */
export type ProfileType = 
  | 'admin'
  | 'moderator' 
  | 'medical_personnel'
  | 'medical_institute'
  | 'medical_seller'
  | 'user';

export type SubscriptionPlan = 'free' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

export interface UserProfile extends BaseEntity {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  avatar_url?: string;
  title?: string;
  specialty?: string;
  primary_specialty_slug?: string;
  subspecialties?: string[];
  organization?: string;
  country?: string;
  profile_type: ProfileType;
  verified: boolean;
  subscription_plan?: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_price?: number;
  subscription_currency?: string;
}

/**
 * Authentication Types
 */
export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: UserProfile | AuthSession | Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Medical Event Types
 */
export type EventType = 
  | 'conference'
  | 'workshop'
  | 'seminar'
  | 'webinar'
  | 'training'
  | 'certification'
  | 'networking'
  | 'exhibition';

export type EventFormat = 'in-person' | 'virtual' | 'hybrid';
export type EventStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface MedicalEvent extends BaseEntity {
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  summary?: string;
  summary_ar?: string;
  slug: string;
  start_date: string;
  end_date: string;
  timezone: string;
  registration_deadline?: string;
  format: EventFormat;
  venue_name?: string;
  venue_address?: string;
  venue_lat?: number;
  venue_lng?: number;
  country?: string;
  city?: string;
  online_url?: string;
  organizer?: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  specialty_slug?: string;
  subspecialty?: string;
  subspecialties?: string[];
  target_audience?: string[];
  languages: string[];
  has_cme: boolean;
  cme_provider?: string;
  cme_hours?: number;
  cme_points?: number;
  accreditation_url?: string;
  accreditation_details?: Record<string, any>;
  is_free: boolean;
  price_range?: string;
  currency?: string;
  registration_url?: string;
  registration_required: boolean;
  capacity?: number;
  registered_count: number;
  featured_image?: string;
  gallery_images?: string[];
  seo_title?: string;
  seo_description?: string;
  view_count: number;
  save_count: number;
  share_count: number;
  click_count: number;
  status: EventStatus;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  source_url?: string;
  source_id?: string;
  fetched_at?: string;
  ai_extracted_fields?: Record<string, any>;
  confidence_score?: number;
  compliance_checked: boolean;
  review_notes?: string;
  moderation_flags?: string[];
}

/**
 * Event Interaction Types
 */
export type InteractionType = 'view' | 'save' | 'share' | 'click' | 'register';

export interface EventInteraction extends BaseEntity {
  event_id: string;
  user_id: string;
  interaction_type: InteractionType;
  metadata?: Record<string, any>;
}

export interface EventRegistration extends BaseEntity {
  event_id: string;
  user_id: string;
  status: string;
  registration_date: string;
}

/**
 * RFQ (Request for Quotation) Types
 */
export type RFQStatus = 'open' | 'closed' | 'awarded' | 'cancelled';

export interface RFQ extends BaseEntity {
  title: string;
  description: string;
  category_id?: string;
  buyer_id: string;
  budget_range?: string;
  delivery_location?: string;
  status: RFQStatus;
}

/**
 * Product and Category Types
 */
export interface ProductCategory extends BaseEntity {
  name: string;
  description?: string;
  slug: string;
}

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  category_id?: string;
  supplier_id: string;
  manufacturer?: string;
  price_range?: string;
  images?: string[];
  active: boolean;
}

/**
 * Specialty Types
 */
export interface MedicalSpecialty extends BaseEntity {
  name_en: string;
  name_ar?: string;
  slug: string;
  code?: string;
  synonyms?: string[];
  level: number;
  parent_id?: string;
  is_active: boolean;
}

/**
 * Search and Filter Types
 */
export interface SearchFilters {
  query?: string;
  specialty?: string;
  country?: string;
  format?: EventFormat;
  date_from?: string;
  date_to?: string;
  is_free?: boolean;
  has_cme?: boolean;
  language?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Form Types
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: string | number | RegExp;
  message: string;
}

/**
 * UI Component Types
 */
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

/**
 * Analytics Types
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  user_id?: string;
  session_id?: string;
}

/**
 * Security Types
 */
export interface SecurityAuditLog extends BaseEntity {
  table_name: string;
  operation: string;
  user_id?: string;
  accessed_user_id?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface RateLimitConfig {
  requests: number;
  window: number; // milliseconds
  identifier?: string;
}

/**
 * File Upload Types
 */
export interface FileUploadConfig {
  maxSize: number;
  maxFiles: number;
  allowedTypes: string[];
  endpoint: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  original_filename: string;
  size: number;
  mime_type: string;
  url: string;
  uploaded_at: string;
}

/**
 * Internationalization Types
 */
export type Language = 'en' | 'ar';

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nConfig {
  defaultLanguage: Language;
  supportedLanguages: Language[];
  translations: Record<Language, Translation>;
}

/**
 * Theme Types
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
}

/**
 * Navigation Types
 */
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string | number;
  children?: NavigationItem[];
  protected?: boolean;
  roles?: ProfileType[];
}

/**
 * Hook Return Types
 */
export interface UseAuthReturn {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  validateCredentials: (email: string, password: string) => ValidationResult;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Environment Configuration Types
 */
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  APP_URL: string;
  API_URL: string;
  ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
}

/**
 * Error Types
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}