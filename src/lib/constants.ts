/**
 * EverMedical Platform Constants
 * 
 * Centralized configuration and constants for the medical platform.
 * Provides type-safe access to application-wide settings.
 * 
 * @author EverMedical Team
 * @version 2.0.0
 */

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  name: 'EverMedical',
  version: '2.0.0',
  description: 'Comprehensive medical networking and event management platform',
  author: 'EverMedical Team',
  supportEmail: 'support@evermedical.com',
  website: 'https://evermedical.com',
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
  rateLimit: {
    requests: 100,
    window: 3600000, // 1 hour in milliseconds
  },
} as const;

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
  sessionTimeout: 86400000, // 24 hours in milliseconds
  refreshThreshold: 300000, // 5 minutes before expiry
  maxLoginAttempts: 5,
  lockoutDuration: 900000, // 15 minutes
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
} as const;

/**
 * File Upload Configuration
 */
export const FILE_CONFIG = {
  maxSize: 10485760, // 10MB in bytes
  maxFiles: 5,
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
  debounceDelay: 300,
  toastDuration: 5000,
  animationDuration: 300,
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },
} as const;

/**
 * Medical Specialties - Core specialties supported by the platform
 */
export const MEDICAL_SPECIALTIES = {
  // Primary Specialties
  CARDIOLOGY: 'cardiology',
  NEUROLOGY: 'neurology',
  ONCOLOGY: 'oncology',
  ORTHOPEDICS: 'orthopedics',
  RADIOLOGY: 'radiology',
  ANESTHESIOLOGY: 'anesthesiology',
  EMERGENCY_MEDICINE: 'emergency-medicine',
  FAMILY_MEDICINE: 'family-medicine',
  INTERNAL_MEDICINE: 'internal-medicine',
  PEDIATRICS: 'pediatrics',
  PSYCHIATRY: 'psychiatry',
  SURGERY: 'surgery',
  
  // Surgical Specialties
  CARDIAC_SURGERY: 'cardiac-surgery',
  NEUROSURGERY: 'neurosurgery',
  PLASTIC_SURGERY: 'plastic-surgery',
  VASCULAR_SURGERY: 'vascular-surgery',
  
  // Diagnostic Specialties
  PATHOLOGY: 'pathology',
  MEDICAL_IMAGING: 'medical-imaging',
  LABORATORY_MEDICINE: 'laboratory-medicine',
} as const;

/**
 * Event Types supported by the platform
 */
export const EVENT_TYPES = {
  CONFERENCE: 'conference',
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  WEBINAR: 'webinar',
  TRAINING: 'training',
  CERTIFICATION: 'certification',
  NETWORKING: 'networking',
  EXHIBITION: 'exhibition',
} as const;

/**
 * Event Formats
 */
export const EVENT_FORMATS = {
  IN_PERSON: 'in-person',
  VIRTUAL: 'virtual',
  HYBRID: 'hybrid',
} as const;

/**
 * User Roles in the platform
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEDICAL_PERSONNEL: 'medical_personnel',
  MEDICAL_INSTITUTE: 'medical_institute',
  MEDICAL_SELLER: 'medical_seller',
  USER: 'user',
} as const;

/**
 * Subscription Plans
 */
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

/**
 * Event Status Types
 */
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

/**
 * RFQ Status Types
 */
export const RFQ_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  AWARDED: 'awarded',
  CANCELLED: 'cancelled',
} as const;

/**
 * Countries supported by the platform (ISO 3166-1 alpha-2)
 */
export const SUPPORTED_COUNTRIES = {
  // Middle East & North Africa
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  EG: 'Egypt',
  JO: 'Jordan',
  LB: 'Lebanon',
  KW: 'Kuwait',
  QA: 'Qatar',
  BH: 'Bahrain',
  OM: 'Oman',
  
  // Global
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  CA: 'Canada',
  AU: 'Australia',
  IN: 'India',
  SG: 'Singapore',
} as const;

/**
 * Languages supported by the platform
 */
export const SUPPORTED_LANGUAGES = {
  EN: 'English',
  AR: 'العربية',
} as const;

/**
 * Currency codes supported by the platform
 */
export const SUPPORTED_CURRENCIES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  EGP: 'Egyptian Pound',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait before trying again.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully.',
  EVENT_CREATED: 'Event created successfully.',
  EVENT_UPDATED: 'Event updated successfully.',
  RFQ_CREATED: 'RFQ posted successfully.',
  RFQ_UPDATED: 'RFQ updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
} as const;

/**
 * Regular Expressions for validation
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  SPECIALTY_SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'evermedical_auth_token',
  USER_PREFERENCES: 'evermedical_user_preferences',
  LANGUAGE: 'evermedical_language',
  THEME: 'evermedical_theme',
  SEARCH_HISTORY: 'evermedical_search_history',
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PROFILES: {
    GET: '/profiles',
    UPDATE: '/profiles',
    DELETE: '/profiles',
    UPLOAD_AVATAR: '/profiles/avatar',
  },
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    GET: '/events/:id',
    UPDATE: '/events/:id',
    DELETE: '/events/:id',
    REGISTER: '/events/:id/register',
    SEARCH: '/events/search',
  },
  RFQS: {
    LIST: '/rfqs',
    CREATE: '/rfqs',
    GET: '/rfqs/:id',
    UPDATE: '/rfqs/:id',
    DELETE: '/rfqs/:id',
    RESPOND: '/rfqs/:id/respond',
  },
} as const;

/**
 * Analytics Event Names
 */
export const ANALYTICS_EVENTS = {
  // User Events
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PROFILE_UPDATED: 'profile_updated',
  
  // Event Events
  EVENT_VIEWED: 'event_viewed',
  EVENT_SHARED: 'event_shared',
  EVENT_SAVED: 'event_saved',
  EVENT_REGISTERED: 'event_registered',
  EVENT_CREATED: 'event_created',
  
  // RFQ Events
  RFQ_VIEWED: 'rfq_viewed',
  RFQ_CREATED: 'rfq_created',
  RFQ_RESPONDED: 'rfq_responded',
  
  // Search Events
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  
  // Error Events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const;