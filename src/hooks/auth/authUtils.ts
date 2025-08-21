/**
 * Authentication utilities and helper functions
 * Centralized authentication-related utilities for consistency across the app
 */

// Authentication error types
export enum AuthErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  CREDENTIALS = 'credentials',
  SESSION = 'session',
  UNKNOWN = 'unknown'
}

// Auth event types for analytics
export enum AuthEventType {
  SIGNIN_ATTEMPT = 'signin_attempt',
  SIGNIN_SUCCESS = 'signin_success',
  SIGNIN_FAILURE = 'signin_failure',
  SIGNUP_ATTEMPT = 'signup_attempt',
  SIGNUP_SUCCESS = 'signup_success',
  SIGNUP_FAILURE = 'signup_failure',
  SIGNOUT = 'signout',
  SESSION_REFRESH = 'session_refresh',
  SESSION_EXPIRED = 'session_expired',
  PASSWORD_RESET = 'password_reset',
}

// User role types
export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  MEDICAL_PERSONNEL = 'medical_personnel',
  MEDICAL_INSTITUTE = 'medical_institute',
  MEDICAL_SELLER = 'medical_seller',
  USER = 'user'
}

// Profile types
export enum ProfileType {
  ADMIN = 'admin',
  ORGANIZER = 'organizer', 
  MEDICAL_PERSONNEL = 'medical_personnel',
  MEDICAL_INSTITUTE = 'medical_institute',
  MEDICAL_SELLER = 'medical_seller'
}

/**
 * Authentication utility functions
 */
export class AuthUtils {
  /**
   * Extract error type from error message for proper handling
   */
  static getErrorType(error: Error | string): AuthErrorType {
    const message = error instanceof Error ? error.message.toLowerCase() : error.toLowerCase();
    
    if (message.includes('validation') || message.includes('invalid')) {
      return AuthErrorType.VALIDATION;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return AuthErrorType.NETWORK;
    }
    if (message.includes('rate') || message.includes('too many')) {
      return AuthErrorType.RATE_LIMIT;
    }
    if (message.includes('password') || message.includes('email') || message.includes('credentials')) {
      return AuthErrorType.CREDENTIALS;
    }
    if (message.includes('session') || message.includes('token')) {
      return AuthErrorType.SESSION;
    }
    
    return AuthErrorType.UNKNOWN;
  }

  /**
   * Get user-friendly error message based on error type
   */
  static getUserFriendlyErrorMessage(error: Error | string): string {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case AuthErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case AuthErrorType.NETWORK:
        return 'Network error. Please check your connection and try again.';
      case AuthErrorType.RATE_LIMIT:
        return 'Too many attempts. Please wait a moment before trying again.';
      case AuthErrorType.CREDENTIALS:
        return 'Invalid email or password. Please try again.';
      case AuthErrorType.SESSION:
        return 'Your session has expired. Please sign in again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  /**
   * Check if user has specific role
   */
  static hasRole(userRole: string | undefined, requiredRole: UserRole): boolean {
    if (!userRole) return false;
    return userRole === requiredRole;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(userRole: string | undefined, roles: UserRole[]): boolean {
    if (!userRole) return false;
    return roles.includes(userRole as UserRole);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(userRole: string | undefined): boolean {
    return this.hasRole(userRole, UserRole.ADMIN);
  }

  /**
   * Check if user is organizer or admin
   */
  static canCreateEvents(userRole: string | undefined): boolean {
    return this.hasAnyRole(userRole, [UserRole.ADMIN, UserRole.ORGANIZER]);
  }

  /**
   * Get default redirect path based on user role
   */
  static getDefaultRedirectPath(userRole: string | undefined): string {
    switch (userRole) {
      case UserRole.ADMIN:
        return '/dashboards';
      case UserRole.ORGANIZER:
        return '/events';
      case UserRole.MEDICAL_PERSONNEL:
        return '/profile/medical-personnel';
      case UserRole.MEDICAL_INSTITUTE:
        return '/profile/medical-institute';
      case UserRole.MEDICAL_SELLER:
        return '/profile/medical-seller';
      default:
        return '/';
    }
  }

  /**
   * Sanitize user metadata for safe storage
   */
  static sanitizeUserMetadata(metadata: Record<string, any>): Record<string, any> {
    const allowedFields = [
      'first_name',
      'last_name',
      'profile_type',
      'organization',
      'title',
      'specialty',
      'country',
      'phone',
      'website'
    ];

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      if (allowedFields.includes(key) && value != null) {
        // Basic sanitization
        if (typeof value === 'string') {
          sanitized[key] = value.trim().substring(0, 255);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Generate secure session fingerprint for additional security
   */
  static generateSessionFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
    ];
    
    // Create a simple hash of the components
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if current session is suspicious based on fingerprint
   */
  static isSessionSuspicious(storedFingerprint?: string): boolean {
    if (!storedFingerprint) return false;
    
    const currentFingerprint = this.generateSessionFingerprint();
    return storedFingerprint !== currentFingerprint;
  }
}

export default AuthUtils;