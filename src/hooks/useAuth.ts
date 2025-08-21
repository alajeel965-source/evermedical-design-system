import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Analytics } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced error handling
  const handleAuthError = useCallback((error: Error | string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setError(errorMessage);
    console.error('Auth Error:', errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    // Set up auth state listener with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setError(null);

          // Track auth events for security monitoring
          if (session?.user) {
            Analytics.trackEvent('auth_state_change', {
              event,
              userId: session.user.id,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          handleAuthError(error as Error);
          setLoading(false);
        }
      }
    );

    // Check for existing session with enhanced error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          handleAuthError(error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((error) => {
        handleAuthError(error);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [handleAuthError]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Track sign out event
      if (user) {
        Analytics.trackEvent('auth_sign_out', {
          userId: user.id,
          timestamp: new Date().toISOString()
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        handleAuthError(error);
        return false;
      }
      
      return true;
    } catch (error) {
      handleAuthError(error as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, handleAuthError]);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signOut,
    clearError
  };
}