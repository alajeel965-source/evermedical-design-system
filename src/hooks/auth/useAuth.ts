/**
 * Unified Authentication Hook - Best of all auth hooks combined
 * 
 * This hook consolidates useAuth, useOptimizedAuth, and useSecureAuth
 * into a single, comprehensive authentication solution with:
 * - Security-first design with input validation
 * - Performance optimizations with memoization
 * - Comprehensive error handling and logging
 * - Rate limiting and session management
 * - Analytics tracking for security monitoring
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Analytics } from '@/lib/api';
import { SecureAuth, InputValidator, SecurityError, ValidationError } from '@/lib/secureApi';
import { logger } from '@/lib/logger';
import { AuthUtils } from './authUtils';

// Comprehensive return type with all features
export interface UseAuthReturn {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Auth methods with enhanced error handling
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  
  // Utility methods
  clearError: () => void;
  refreshSession: () => Promise<void>;
  validateCredentials: (email: string, password: string) => ValidationResult;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Unified Authentication Hook
 * Combines all authentication functionality into a single, optimized hook
 */
export function useAuth(): UseAuthReturn {
  // Core state management
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized computed values for performance
  const isAuthenticated = useMemo(() => !!user, [user]);

  // Enhanced error handling with security logging
  const handleAuthError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setError(errorMessage);
    
    // Log security-relevant auth errors for monitoring
    Analytics.trackEvent('auth_error', {
      error: errorMessage,
      context: context || 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    if (process.env.NODE_ENV === 'development') {
      logger.error('Authentication error', error instanceof Error ? error : new Error(String(error)), { 
        component: 'useAuth',
        metadata: {
          errorMessage,
          context: context || undefined,
          errorType: AuthUtils.getErrorType(error instanceof Error ? error : new Error(String(error)))
        }
      });
    }
  }, []);

  // Utility methods
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Client-side credential validation
  const validateCredentials = useCallback((email: string, password: string): ValidationResult => {
    const errors: string[] = [];

    // Email validation
    if (!InputValidator.validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    const passwordValidation = InputValidator.validatePassword(password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }

    return { valid: errors.length === 0, errors };
  }, []);

  // Enhanced session refresh with error handling
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        handleAuthError(error, 'session_refresh');
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setError(null);
      
      // Track session refresh for monitoring
      Analytics.trackEvent('auth_session_refreshed', {
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      handleAuthError(error as Error, 'session_refresh');
    }
  }, [handleAuthError]);

  // Secure sign in with comprehensive validation
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);

      // Client-side validation
      const validation = validateCredentials(email, password);
      if (!validation.valid) {
        const errorMessage = validation.errors.join(', ');
        handleAuthError(errorMessage, 'signin_validation');
        return { success: false, error: errorMessage };
      }

      // Track sign in attempt for security monitoring
      Analytics.trackEvent('auth_signin_attempt', {
        timestamp: new Date().toISOString(),
      });

      // Perform authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        handleAuthError(error, 'signin');
        return { success: false, error: error.message };
      }

      // Track successful sign in
      Analytics.trackEvent('auth_signin_success', {
        userId: data.user?.id,
        timestamp: new Date().toISOString(),
      });

      return { success: true, data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      handleAuthError(error as Error, 'signin');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [validateCredentials, handleAuthError]);

  // Secure sign up with enhanced validation and security
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);

      // Use our secure auth service for enhanced validation
      const response = await SecureAuth.signUp(email, password, metadata);

      if (!response.success) {
        handleAuthError(response.error || 'Sign up failed', 'signup');
        return { success: false, error: response.error || 'Sign up failed' };
      }

      return { success: true, data: response.data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      handleAuthError(error as Error, 'signup');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  // Secure sign out with cleanup
  const signOut = useCallback(async (): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      // Track sign out event before clearing user
      if (user) {
        Analytics.trackEvent('auth_signout', {
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        handleAuthError(error, 'signout');
        return { success: false, error: error.message };
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      handleAuthError(error as Error, 'signout');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, handleAuthError]);

  // Enhanced auth state management with automatic session refresh
  useEffect(() => {
    let sessionRefreshInterval: NodeJS.Timeout;

    // Set up auth state listener with comprehensive error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setError(null);

          // Track auth state changes for security monitoring
          Analytics.trackEvent('auth_state_change', {
            event,
            userId: session?.user?.id,
            timestamp: new Date().toISOString(),
            sessionAge: session ? Date.now() - new Date(session.expires_at || 0).getTime() : null,
          });

          // Set up automatic session refresh
          if (session?.user) {
            // Refresh session 5 minutes before it expires
            const expiresAt = new Date(session.expires_at || 0).getTime();
            const refreshTime = expiresAt - Date.now() - (5 * 60 * 1000);
            
            if (refreshTime > 0) {
              sessionRefreshInterval = setTimeout(refreshSession, refreshTime);
            }
          } else {
            // Clear refresh interval if no session
            if (sessionRefreshInterval) {
              clearTimeout(sessionRefreshInterval);
            }
          }

        } catch (error) {
          handleAuthError(error as Error, 'auth_state_change');
          setLoading(false);
        }
      }
    );

    // Check for existing session with enhanced error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          handleAuthError(error, 'initial_session_check');
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((error) => {
        handleAuthError(error, 'initial_session_check');
        setLoading(false);
      });

    // Cleanup function
    return () => {
      subscription.unsubscribe();
      if (sessionRefreshInterval) {
        clearTimeout(sessionRefreshInterval);
      }
    };
  }, [handleAuthError, refreshSession]);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshSession,
    validateCredentials,
  };
}

export default useAuth;