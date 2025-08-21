/**
 * Analytics Utilities - Centralized tracking and monitoring
 * 
 * Provides type-safe analytics tracking with consistent event naming
 * and automatic error handling. Replaces scattered Analytics imports.
 * 
 * @fileoverview Centralized analytics utilities for healthcare platform
 * @version 1.0.0
 */

import { Analytics } from '@/lib/api';

/**
 * Standard event categories for consistent tracking
 */
export const AnalyticsCategories = {
  AUTH: 'auth',
  USER_INTERACTION: 'user_interaction',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  NAVIGATION: 'navigation'
} as const;

/**
 * Authentication event tracking
 */
export const AuthAnalytics = {
  trackSignInAttempt: (method: string) => 
    Analytics.trackEvent('auth_signin_attempt', { method }),
  
  trackSignInSuccess: (userId: string) => 
    Analytics.trackEvent('auth_signin_success', { userId }),
  
  trackSignOut: (userId: string) => 
    Analytics.trackEvent('auth_signout', { userId }),
  
  trackSessionRefresh: (userId: string) => 
    Analytics.trackEvent('auth_session_refreshed', { userId }),
  
  trackError: (error: string, context?: string) => 
    Analytics.trackEvent('auth_error', { error, context })
};

/**
 * Error tracking utilities
 */
export const ErrorAnalytics = {
  trackErrorBoundary: (error: string, component: string) =>
    Analytics.trackEvent('error_boundary_triggered', { error, component }),
  
  trackSecurityError: (errorType: string, details?: Record<string, unknown>) =>
    Analytics.trackEvent('security_error_boundary_triggered', { errorType, ...details }),
  
  trackRetry: (component: string, attempt: number) =>
    Analytics.trackEvent('error_boundary_retry', { component, attempt })
};

/**
 * User interaction tracking
 */
export const InteractionAnalytics = {
  trackCardClick: (cardType: string, cardId: string) =>
    Analytics.trackEvent('card_clicked', { cardType, cardId }),
  
  trackActionClick: (action: string, context: string) =>
    Analytics.trackEvent('card_action_clicked', { action, context }),
  
  trackClipboardCopy: (content: string, success: boolean) =>
    Analytics.trackEvent('clipboard_copy', { content: content.substring(0, 50), success }),
  
  trackSearch: (query: string, resultsCount: number) =>
    Analytics.trackEvent('search_performed', { query: query.substring(0, 100), resultsCount })
};

/**
 * Navigation tracking
 */
export const NavigationAnalytics = {
  trackPageView: (path: string) =>
    Analytics.trackPageView(path),
  
  trackNavClick: (destination: string) =>
    Analytics.trackEvent('navigation_click', { destination })
};

/**
 * Performance tracking utilities
 */
export const PerformanceAnalytics = {
  trackComponentRender: (component: string, renderTime: number) =>
    Analytics.trackEvent('component_performance', { component, renderTime }),
  
  trackApiCall: (endpoint: string, duration: number, success: boolean) =>
    Analytics.trackEvent('api_performance', { endpoint, duration, success })
};

/**
 * Safe analytics wrapper that handles errors gracefully
 */
export function safeTrack(trackingFn: () => void, fallbackMessage?: string): void {
  try {
    trackingFn();
  } catch (error) {
    console.error('Analytics tracking error:', error);
    if (fallbackMessage) {
      console.log(fallbackMessage);
    }
  }
}