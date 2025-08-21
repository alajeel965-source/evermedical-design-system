/**
 * Centralized API service for EverMedical
 * Handles all backend communication with retry logic and error handling
 */
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, debounce } from './utils';

// Simplified error classes for now
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Simple error logger
const ErrorLogger = {
  logError: (error: Error) => {
    console.error(`[${error.name}]:`, error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
  }
};

// Configuration constants
const APP_CONFIG = {
  API: {
    MAX_RETRIES: 3,
    DEBOUNCE_DELAY: 300,
  },
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    RESULTS_PER_PAGE: 20,
  }
};

const API_ENDPOINTS = {
  EVENT_SEARCH: 'https://copipddzqlmxstkucvmk.supabase.co/functions/v1/event-search',
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

/**
 * Authentication services
 */
export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        ErrorLogger.logError(new AuthenticationError(error.message));
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      ErrorLogger.logError(new AuthenticationError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        ErrorLogger.logError(new AuthenticationError(error.message));
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      ErrorLogger.logError(new AuthenticationError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        ErrorLogger.logError(new AuthenticationError(error.message));
        return { data: null, error: error.message, success: false };
      }

      return { data: null, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      ErrorLogger.logError(new AuthenticationError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }
}

/**
 * Profile management services
 */
export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<ApiResponse<any>> {
    try {
      const result = await retryWithBackoff(
        async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
          return { data, error };
        },
        APP_CONFIG.API.MAX_RETRIES
      );

      if (result.error) {
        ErrorLogger.logError(new DatabaseError(result.error.message));
        return { data: null, error: result.error.message, success: false };
      }

      return { data: result.data, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const result = await retryWithBackoff(
        async () => {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
          return { data, error };
        },
        APP_CONFIG.API.MAX_RETRIES
      );

      if (result.error) {
        ErrorLogger.logError(new DatabaseError(result.error.message));
        return { data: null, error: result.error.message, success: false };
      }

      return { data: result.data, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }
}

/**
 * Event search services with debounced search
 */
export class EventService {
  // Debounced search to prevent excessive API calls
  static searchEvents = debounce(async (query: string, filters?: Record<string, any>): Promise<ApiResponse<any>> => {
    try {
      const searchParams = new URLSearchParams({
        query: query || '',
        ...filters,
      });

      const response = await fetch(`${API_ENDPOINTS.EVENT_SEARCH}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }, APP_CONFIG.API.DEBOUNCE_DELAY);

  /**
   * Get event details
   */
  static async getEvent(eventId: string): Promise<ApiResponse<any>> {
    try {
      const result = await retryWithBackoff(
        async () => {
          const { data, error } = await supabase
            .from('medical_events')
            .select('*')
            .eq('id', eventId)
            .single();
          return { data, error };
        },
        APP_CONFIG.API.MAX_RETRIES
      );

      if (result.error) {
        ErrorLogger.logError(new DatabaseError(result.error.message));
        return { data: null, error: result.error.message, success: false };
      }

      return { data: result.data, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }
}

/**
 * RFQ management services (simplified - remove database operations until tables exist)
 */
export class RFQService {
  /**
   * Get saved RFQs for user - placeholder implementation
   */
  static async getSavedRFQs(userId: string): Promise<ApiResponse<any[]>> {
    try {
      // TODO: Implement when saved_rfqs table is created
      console.log('Getting saved RFQs for user:', userId);
      return { data: [], error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch saved RFQs';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }

  /**
   * Save RFQ for user - placeholder implementation
   */
  static async saveRFQ(userId: string, rfqId: string): Promise<ApiResponse<any>> {
    try {
      // TODO: Implement when saved_rfqs table is created
      console.log('Saving RFQ:', { userId, rfqId });
      return { data: { id: rfqId }, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save RFQ';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }

  /**
   * Remove saved RFQ - placeholder implementation
   */
  static async removeSavedRFQ(userId: string, rfqId: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Implement when saved_rfqs table is created
      console.log('Removing saved RFQ:', { userId, rfqId });
      return { data: null, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove saved RFQ';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }
}

/**
 * Storage services for file uploads
 */
export class StorageService {
  /**
   * Upload file to storage
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ): Promise<ApiResponse<{ path: string; url: string }>> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options?.upsert || false,
        });

      if (error) {
        ErrorLogger.logError(new DatabaseError(error.message));
        return { data: null, error: error.message, success: false };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        data: {
          path: data.path,
          url: urlData.publicUrl,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File upload failed';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(bucket: string, path: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        ErrorLogger.logError(new DatabaseError(error.message));
        return { data: null, error: error.message, success: false };
      }

      return { data: null, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File deletion failed';
      ErrorLogger.logError(new DatabaseError(errorMessage));
      return { data: null, error: errorMessage, success: false };
    }
  }
}

/**
 * Analytics and tracking services
 */
export class AnalyticsService {
  /**
   * Track user action
   */
  static async trackEvent(
    eventName: string,
    properties?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    try {
      // For now, just log to console in development
      if (APP_CONFIG.ENVIRONMENT === 'development') {
        console.log('Analytics Event:', {
          event: eventName,
          properties,
          userId,
          timestamp: new Date().toISOString(),
        });
      }

      // TODO: Implement actual analytics service integration
      // Example: await analytics.track(eventName, properties, userId);
    } catch (error) {
      ErrorLogger.logError(new Error(`Analytics tracking failed: ${error}`));
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(path: string, userId?: string): Promise<void> {
    try {
      await this.trackEvent('page_view', { path }, userId);
    } catch (error) {
      ErrorLogger.logError(new Error(`Page view tracking failed: ${error}`));
    }
  }
}

// Export all services
export {
  AuthService as Auth,
  ProfileService as Profile,
  EventService as Events,
  RFQService as RFQ,
  StorageService as Storage,
  AnalyticsService as Analytics,
};

// Default export for convenience
export default {
  Auth: AuthService,
  Profile: ProfileService,
  Events: EventService,
  RFQ: RFQService,
  Storage: StorageService,
  Analytics: AnalyticsService,
};