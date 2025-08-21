/**
 * Optimized authentication hook with enhanced error handling and caching
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Auth, Analytics } from '@/lib/api';

interface UseOptimizedAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

/**
 * Enhanced authentication hook with optimizations
 */
export function useOptimizedAuth(): UseOptimizedAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized computed values
  const isAuthenticated = useMemo(() => !!user, [user]);

  // Error handling
  const handleError = useCallback((error: Error | string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setError(errorMessage);
    console.error('Authentication Error:', errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Session refresh
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      handleError(error as Error);
    }
  }, [handleError]);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      const result = await Auth.signIn(email, password);
      
      if (!result.success) {
        handleError(result.error || 'Sign in failed');
        return false;
      }

      // Track successful sign in
      await Analytics.trackEvent('user_signed_in', { method: 'email' }, result.data?.user?.id);
      
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Sign up function
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      const result = await Auth.signUp(email, password, metadata);
      
      if (!result.success) {
        handleError(result.error || 'Sign up failed');
        return false;
      }

      // Track successful sign up
      await Analytics.trackEvent('user_signed_up', { method: 'email' }, result.data?.user?.id);
      
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Sign out function
  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      // Track sign out before clearing session
      if (user?.id) {
        await Analytics.trackEvent('user_signed_out', {}, user.id);
      }

      const result = await Auth.signOut();
      
      if (!result.success) {
        handleError(result.error || 'Sign out failed');
        return false;
      }

      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError, clearError]);

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Track auth state changes
        if (session?.user) {
          await Analytics.trackEvent('auth_state_changed', { event }, session.user.id);
        }

        // Clear errors on successful auth changes
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          clearError();
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          handleError(error);
        } else if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        if (mounted) {
          handleError(error as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleError, clearError]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session?.expires_at) return;

    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      const timeout = setTimeout(() => {
        refreshSession();
      }, refreshTime);

      return () => clearTimeout(timeout);
    }
  }, [session?.expires_at, refreshSession]);

  return {
    user,
    session,
    loading,
    isAuthenticated,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshSession,
  };
}