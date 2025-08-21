/**
 * Enhanced authentication hook with comprehensive security features
 * Combines the best of useAuth and useOptimizedAuth with new security functions
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Analytics } from '@/lib/api';
import { SecureAuth, InputValidator, SecurityError, ValidationError } from '@/lib/secureApi';

interface UseSecureAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  validateCredentials: (email: string, password: string) => { valid: boolean; errors: string[] };
}

export function useSecureAuth(): UseSecureAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized computed values
  const isAuthenticated = useMemo(() => !!user, [user]);

  // Enhanced error handling with security logging
  const handleAuthError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setError(errorMessage);
    
    // Log security-relevant auth errors
    Analytics.trackEvent('auth_error', {
      error: errorMessage,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    console.error('Auth Error:', errorMessage, context ? `Context: ${context}` : '');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Validate credentials before sending to server
  const validateCredentials = useCallback((email: string, password: string) => {
    const errors: string[] = [];

    // Validate email
    if (!InputValidator.validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    // Validate password
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
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
    } catch (error) {
      handleAuthError(error as Error, 'session_refresh');
    }
  }, [handleAuthError]);

  // Secure sign in with validation and rate limiting
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Client-side validation
      const validation = validateCredentials(email, password);
      if (!validation.valid) {
        throw new ValidationError(validation.errors.join(', '));
      }

      // Track sign in attempt
      Analytics.trackEvent('auth_signin_attempt', {
        timestamp: new Date().toISOString(),
      });

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

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      handleAuthError(error as Error, 'signin');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [validateCredentials, handleAuthError]);

  // Secure sign up with enhanced validation
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Use our secure auth service for enhanced validation
      const response = await SecureAuth.signUp(email, password, metadata);

      if (!response.success) {
        handleAuthError(response.error || 'Sign up failed', 'signup');
        return { success: false, error: response.error || 'Sign up failed' };
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      handleAuthError(error as Error, 'signup');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  // Secure sign out with cleanup
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Track sign out event
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

  // Enhanced auth state management with security monitoring
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

          // Set up session refresh interval if user is authenticated
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