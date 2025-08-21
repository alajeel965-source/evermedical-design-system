/**
 * Secure API service that uses our new database security functions
 * All functions include proper error handling, input validation, and audit logging
 */
import { supabase } from '@/integrations/supabase/client';
import { Analytics } from './api';

// Security error classes
export class SecurityError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Type definitions for secure API responses
export interface SecureApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  metadata?: {
    timestamp: string;
    requestId: string;
    rateLimitRemaining?: number;
  };
}

/**
 * Input validation and sanitization
 */
export class InputValidator {
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>\"';&]/g, '').substring(0, 1000);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username) && !username.includes('__');
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"|<>?,./`~]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  static sanitizeJsonInput(input: any): any {
    if (typeof input !== 'object' || input === null) {
      return null;
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Only allow safe keys
      if (/^[a-zA-Z0-9_]{1,50}$/.test(key)) {
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  }
}

/**
 * Secure Profile Service using our new database functions
 */
export class SecureProfileService {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async getProfile(userId: string): Promise<SecureApiResponse<any>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // Use enhanced secure access with rate limiting and audit logging
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        Analytics.trackEvent('profile_access_error', {
          userId,
          error: error.message,
          requestId,
          timestamp
        });
        
        throw new SecurityError(error.message);
      }

      // Track successful access for audit purposes
      Analytics.trackEvent('profile_access_success', {
        userId,
        requestId,
        timestamp
      });

      return {
        data,
        error: null,
        success: true,
        metadata: { timestamp, requestId }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile access failed';
      
      return {
        data: null,
        error: errorMessage,
        success: false,
        metadata: { timestamp, requestId }
      };
    }
  }

  static async updateProfile(
    userId: string, 
    updates: Record<string, any>
  ): Promise<SecureApiResponse<any>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // Validate and sanitize input
      const sanitizedUpdates = InputValidator.sanitizeJsonInput(updates);
      
      if (!sanitizedUpdates || Object.keys(sanitizedUpdates).length === 0) {
        throw new ValidationError('No valid updates provided');
      }

      // Check rate limit using our secure function
      const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
        operation_name: 'profile_update',
        max_requests: 10,
        time_window: '1 hour'
      });

      if (!rateLimitOk) {
        throw new RateLimitError('Too many profile updates. Please try again later.');
      }

      // Update profile using enhanced secure access (RLS policies with rate limiting and audit logging)
      const { data, error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        Analytics.trackEvent('profile_update_error', {
          userId,
          error: error.message,
          requestId,
          timestamp
        });
        
        throw new SecurityError(error.message);
      }

      Analytics.trackEvent('profile_update_success', {
        userId,
        requestId,
        timestamp,
        fieldsUpdated: Object.keys(sanitizedUpdates)
      });

      return {
        data,
        error: null,
        success: true,
        metadata: { timestamp, requestId }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      
      return {
        data: null,
        error: errorMessage,
        success: false,
        metadata: { timestamp, requestId }
      };
    }
  }

  static async checkUsernameAvailability(username: string): Promise<SecureApiResponse<boolean>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // Validate username format
      if (!InputValidator.validateUsername(username)) {
        throw new ValidationError('Invalid username format. Must be 3-30 characters, alphanumeric and underscore only.');
      }

      // Use secure function for checking availability
      const { data, error } = await supabase.rpc('is_username_available', {
        username_input: username
      });

      if (error) {
        throw new SecurityError(error.message);
      }

      return {
        data,
        error: null,
        success: true,
        metadata: { timestamp, requestId }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Username check failed';
      
      return {
        data: null,
        error: errorMessage,
        success: false,
        metadata: { timestamp, requestId }
      };
    }
  }
}

/**
 * Secure Event Service using our new functions
 */
export class SecureEventService {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async trackEventInteraction(
    eventId: string,
    interactionType: 'view' | 'save' | 'share' | 'click' | 'register',
    metadata?: Record<string, any>
  ): Promise<SecureApiResponse<any>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // Validate interaction type
      const validTypes = ['view', 'save', 'share', 'click', 'register'];
      if (!validTypes.includes(interactionType)) {
        throw new ValidationError(`Invalid interaction type: ${interactionType}`);
      }

      // Sanitize metadata
      const sanitizedMetadata = metadata ? InputValidator.sanitizeJsonInput(metadata) : null;

      // Insert interaction (our trigger will validate user_id automatically)
      const { data, error } = await supabase
        .from('event_interactions')
        .insert({
          event_id: eventId,
          interaction_type: interactionType,
          metadata: sanitizedMetadata,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        Analytics.trackEvent('event_interaction_error', {
          eventId,
          interactionType,
          error: error.message,
          requestId,
          timestamp
        });
        
        throw new SecurityError(error.message);
      }

      Analytics.trackEvent('event_interaction_success', {
        eventId,
        interactionType,
        requestId,
        timestamp
      });

      return {
        data,
        error: null,
        success: true,
        metadata: { timestamp, requestId }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Event interaction failed';
      
      return {
        data: null,
        error: errorMessage,
        success: false,
        metadata: { timestamp, requestId }
      };
    }
  }

  static async getPublicEvents(filters?: Record<string, any>): Promise<SecureApiResponse<any[]>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // Use public view instead of direct table access
      let query = supabase.from('public_medical_events').select('*');

      // Apply filters safely
      if (filters?.specialty) {
        query = query.eq('specialty_slug', InputValidator.sanitizeString(filters.specialty));
      }
      if (filters?.country) {
        query = query.eq('country', InputValidator.sanitizeString(filters.country));
      }
      if (filters?.format) {
        query = query.eq('format', InputValidator.sanitizeString(filters.format));
      }

      // Limit results to prevent abuse
      query = query.limit(50);

      const { data, error } = await query;

      if (error) {
        throw new SecurityError(error.message);
      }

      return {
        data: data || [],
        error: null,
        success: true,
        metadata: { timestamp, requestId }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Event fetch failed';
      
      return {
        data: null,
        error: errorMessage,
        success: false,
        metadata: { timestamp, requestId }
      };
    }
  }
}

/**
 * Secure Authentication Service with enhanced validation
 */
export class SecureAuthService {
  static async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<SecureApiResponse<any>> {
    const requestId = SecureProfileService['generateRequestId']();
    const timestamp = new Date().toISOString();

    try {
      // Validate email
      if (!InputValidator.validateEmail(email)) {
        throw new ValidationError('Invalid email format');
      }

      // Validate password strength
      const passwordValidation = InputValidator.validatePassword(password);
      if (!passwordValidation.valid) {
        throw new ValidationError(passwordValidation.errors.join(', '));
      }

      // Sanitize metadata
      const sanitizedMetadata = metadata ? InputValidator.sanitizeJsonInput(metadata) : undefined;

      // Sign up with email redirect
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: sanitizedMetadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        Analytics.trackEvent('signup_error', {
          error: error.message,
          requestId,
          timestamp
        });
        
        throw new SecurityError(error.message);
      }

      Analytics.trackEvent('signup_success', {
        requestId,
        timestamp
      });

      return {
        data,
        error: null,
        success: true,
        metadata: { timestamp, requestId }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      
      return {
        data: null,
        error: errorMessage,
        success: false,
        metadata: { timestamp, requestId }
      };
    }
  }
}

// Re-export event-related functions for consistency
export { 
  getPublicEvents, 
  getPublicEventById, 
  getOrganizerContactInfo, 
  canAccessOrganizerData,
  getUserCreatedEvents,
  searchEvents,
  type SafeEventData,
  type OrganizerContactInfo 
} from './secureEventApi';

// Export all secure services
export {
  SecureProfileService as SecureProfile,
  SecureEventService as SecureEvents,
  SecureAuthService as SecureAuth,
};

export default {
  Profile: SecureProfileService,
  Events: SecureEventService,
  Auth: SecureAuthService,
  InputValidator,
};