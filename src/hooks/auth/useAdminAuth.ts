/**
 * Admin Authentication Hook
 * 
 * Extended authentication functionality specifically for admin users
 * including super admin bootstrap functionality
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BootstrapData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface UseAdminAuthReturn {
  isLoading: boolean;
  error: string | null;
  checkSuperAdminExists: () => Promise<boolean>;
  bootstrapSuperAdmin: (data: BootstrapData) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearError = () => setError(null);

  const checkSuperAdminExists = async (): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      if (error) {
        console.error('Error checking super admin:', error);
        return false; // Assume doesn't exist on error to allow bootstrap
      }

      return (count || 0) > 0;
    } catch (err) {
      console.error('Exception checking super admin:', err);
      return false;
    }
  };

  const validateBootstrapData = (data: BootstrapData): string | null => {
    if (!data.fullName.trim()) return 'Full name is required';
    if (!data.email.trim()) return 'Email is required';
    if (!data.username.trim()) return 'Username is required';
    if (!data.password) return 'Password is required';
    if (data.password !== data.confirmPassword) return 'Passwords do not match';
    if (!data.agreeToTerms) return 'You must agree to the terms and conditions';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return 'Please enter a valid email address';

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;
    if (!usernameRegex.test(data.username)) {
      return 'Username must be 3-32 characters, alphanumeric and underscores only';
    }

    // Password strength validation
    if (data.password.length < 12) return 'Password must be at least 12 characters';
    if (!/[0-9]/.test(data.password)) return 'Password must contain at least 1 number';
    if (!/[^a-zA-Z0-9]/.test(data.password)) return 'Password must contain at least 1 special character';

    return null;
  };

  const bootstrapSuperAdmin = async (data: BootstrapData): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate input data
      const validationError = validateBootstrapData(data);
      if (validationError) {
        setError(validationError);
        return { success: false, message: validationError };
      }

      // Check if super admin already exists
      const superAdminExists = await checkSuperAdminExists();
      if (superAdminExists) {
        const errorMsg = 'Super admin already exists. Redirecting to login...';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }

      // Call the bootstrap edge function
      const { data: result, error: fnError } = await supabase.functions.invoke('bootstrap-super-admin', {
        body: {
          fullName: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          username: data.username.trim(),
          password: data.password,
          botProtection: 'human' // Simple bot protection
        }
      });

      if (fnError) {
        console.error('Bootstrap function error:', fnError);
        const errorMsg = 'Failed to create super admin account';
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return { success: false, message: errorMsg };
      }

      if (result?.error) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return { success: false, message: result.error };
      }

      // Success
      const successMsg = result?.message || 'Super admin created successfully!';
      toast({
        title: "Success",
        description: successMsg,
        variant: "default"
      });

      return { success: true, message: successMsg };

    } catch (err) {
      console.error('Bootstrap error:', err);
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    checkSuperAdminExists,
    bootstrapSuperAdmin,
    clearError
  };
};