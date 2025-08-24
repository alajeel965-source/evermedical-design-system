/**
 * Super Admin Onboarding Page
 * 
 * One-time bootstrap page to create the first super admin
 * when none exists. Includes security features and validation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useAdminAuth } from '@/hooks/auth/useAdminAuth';
import { cn } from '@/lib/utils';

interface FormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

export const SuperAdminOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, checkSuperAdminExists, bootstrapSuperAdmin, clearError } = useAdminAuth();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Check if super admin already exists on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminExists = await checkSuperAdminExists();
        if (adminExists) {
          navigate('/admin/login', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [checkSuperAdminExists, navigate]);

  const validateField = (name: string, value: string | boolean): string | undefined => {
    switch (name) {
      case 'fullName':
        return !value ? 'Full name is required' : undefined;
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value as string) ? 'Please enter a valid email' : undefined;
      case 'username':
        if (!value) return 'Username is required';
        const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;
        return !usernameRegex.test(value as string) ? 'Username must be 3-32 characters, alphanumeric and underscores only' : undefined;
      case 'password':
        if (!value) return 'Password is required';
        if ((value as string).length < 12) return 'Password must be at least 12 characters';
        if (!/[0-9]/.test(value as string)) return 'Password must contain at least 1 number';
        if (!/[^a-zA-Z0-9]/.test(value as string)) return 'Password must contain at least 1 special character';
        return undefined;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        return value !== formData.password ? 'Passwords do not match' : undefined;
      case 'agreeToTerms':
        return !value ? 'You must agree to the terms and conditions' : undefined;
      default:
        return undefined;
    }
  };

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();

    // Real-time validation for touched fields
    if (touchedFields.has(name)) {
      const fieldError = validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleInputBlur = (name: string) => {
    setTouchedFields(prev => new Set(prev).add(name));
    const fieldError = validateField(name, formData[name as keyof FormData]);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        errors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    const result = await bootstrapSuperAdmin(formData);
    if (result.success) {
      setShowSuccess(true);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking admin status...</span>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <CardTitle className="text-2xl text-success">Success!</CardTitle>
            <CardDescription>
              Super admin account created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please check your email and verify your account before logging in.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/admin/login')} 
              className="w-full"
            >
              Proceed to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bootstrap Super Admin</CardTitle>
          <CardDescription>
            Create the first super administrator account for your EverMedical platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleInputBlur('fullName')}
                className={cn(formErrors.fullName && 'border-destructive')}
                placeholder="Enter your full name"
              />
              {formErrors.fullName && (
                <p className="text-sm text-destructive">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                className={cn(formErrors.email && 'border-destructive')}
                placeholder="admin@evermedical.com"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleInputBlur('username')}
                className={cn(formErrors.username && 'border-destructive')}
                placeholder="superadmin"
              />
              {formErrors.username && (
                <p className="text-sm text-destructive">{formErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleInputBlur('password')}
                className={cn(formErrors.password && 'border-destructive')}
                placeholder="Create a strong password"
              />
              {formErrors.password && (
                <p className="text-sm text-destructive">{formErrors.password}</p>
              )}
              <PasswordStrengthMeter password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                className={cn(formErrors.confirmPassword && 'border-destructive')}
                placeholder="Confirm your password"
              />
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the{' '}
                <a href="/legal/terms" target="_blank" className="text-primary hover:underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/legal/privacy" target="_blank" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>
            {formErrors.agreeToTerms && (
              <p className="text-sm text-destructive">{formErrors.agreeToTerms}</p>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Super Admin...
                </>
              ) : (
                'Create Super Admin Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};