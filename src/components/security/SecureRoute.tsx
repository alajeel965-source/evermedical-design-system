/**
 * Enhanced Security Route Component
 * 
 * Provides comprehensive route protection with role-based access control,
 * security monitoring, and healthcare compliance features.
 * 
 * @fileoverview Security-focused route wrapper for sensitive healthcare data
 * @version 1.0.0
 * @since 2024-01-01
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { logger } from '@/lib/logger';
import { SecureInputValidator } from '@/lib/security/inputValidation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

/**
 * Security level definitions for different route types
 */
export type SecurityLevel = 'public' | 'authenticated' | 'verified' | 'admin' | 'medical_professional';

/**
 * Route security configuration
 */
export interface RouteSecurityConfig {
  /** Required security level */
  level: SecurityLevel;
  /** Required user roles */
  requiredRoles?: string[];
  /** Required permissions */
  requiredPermissions?: string[];
  /** Whether to verify user session integrity */
  verifySessionIntegrity?: boolean;
  /** Custom authorization function */
  customAuth?: (user: any) => Promise<boolean>;
  /** Redirect path for unauthorized access */
  unauthorizedRedirect?: string;
  /** Enable security monitoring */
  enableMonitoring?: boolean;
}

/**
 * Security monitoring data
 */
interface SecurityEvent {
  type: 'access_granted' | 'access_denied' | 'session_invalid' | 'role_mismatch';
  userId?: string;
  path: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Props for SecureRoute component
 */
interface SecureRouteProps {
  /** Child components to render if authorized */
  children: React.ReactNode;
  /** Security configuration */
  security: RouteSecurityConfig;
  /** Loading component while checking authorization */
  loadingComponent?: React.ReactNode;
  /** Unauthorized access component */
  unauthorizedComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ComponentType<{ error: Error }>;
}

/**
 * Default loading component
 */
const DefaultLoadingComponent = () => (
  <div className="container mx-auto p-6">
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-5 w-5 text-primary animate-pulse" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  </div>
);

/**
 * Default unauthorized component
 */
const DefaultUnauthorizedComponent = ({ securityLevel }: { securityLevel: SecurityLevel }) => (
  <div className="container mx-auto p-6">
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-destructive/10 rounded-full">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Access Restricted</h1>
      <p className="text-muted-foreground mb-4">
        This area requires {securityLevel === 'medical_professional' ? 'medical professional' : securityLevel} access.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        <span>Please contact your administrator if you believe this is an error.</span>
      </div>
    </Card>
  </div>
);

/**
 * Enhanced route component with comprehensive security features
 * 
 * @example
 * ```tsx
 * <SecureRoute 
 *   security={{
 *     level: 'medical_professional',
 *     requiredRoles: ['doctor', 'nurse'],
 *     verifySessionIntegrity: true,
 *     enableMonitoring: true
 *   }}
 * >
 *   <PatientRecordsPage />
 * </SecureRoute>
 * ```
 */
export function SecureRoute({
  children,
  security,
  loadingComponent = <DefaultLoadingComponent />,
  unauthorizedComponent,
  errorComponent: ErrorComponent
}: SecureRouteProps) {
  const { user, session, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const [authorizationState, setAuthorizationState] = useState<{
    loading: boolean;
    authorized: boolean;
    error?: Error;
  }>({
    loading: true,
    authorized: false
  });

  /**
   * Records security events for monitoring and compliance
   */
  const recordSecurityEvent = useCallback((event: Omit<SecurityEvent, 'timestamp'>) => {
    if (!security.enableMonitoring) return;

    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    logger.info('Security event recorded', {
      component: 'SecureRoute',
      metadata: {
        event: securityEvent,
        path: location.pathname,
        securityLevel: security.level
      }
    });

    // In production, this would also send to security monitoring service
    if (event.type === 'access_denied') {
      logger.warn('Unauthorized access attempt', {
        component: 'SecureRoute',
        metadata: {
          userId: user?.id,
          path: location.pathname,
          requiredLevel: security.level,
          userRoles: user?.user_metadata?.roles || []
        }
      });
    }
  }, [security.enableMonitoring, security.level, location.pathname, user]);

  /**
   * Validates user session integrity
   */
  const validateSessionIntegrity = useCallback(async (): Promise<boolean> => {
    if (!security.verifySessionIntegrity || !session) {
      return true;
    }

    try {
      // Check if session is still valid and not tampered with
      const now = Date.now();
      const sessionExp = session.expires_at ? session.expires_at * 1000 : 0;
      
      if (sessionExp > 0 && now > sessionExp) {
        logger.warn('Session expired detected', {
          component: 'SecureRoute',
          metadata: {
            userId: user?.id,
            expiredAt: new Date(sessionExp).toISOString(),
            currentTime: new Date(now).toISOString()
          }
        });
        return false;
      }

      // Additional integrity checks could be added here
      // e.g., token signature validation, session fingerprinting
      
      return true;
    } catch (error) {
      logger.error('Session integrity validation failed', error instanceof Error ? error : new Error(String(error)), {
        component: 'SecureRoute',
        metadata: { userId: user?.id }
      });
      return false;
    }
  }, [security.verifySessionIntegrity, session, user]);

  /**
   * Checks if user has required roles
   */
  const hasRequiredRoles = useCallback((): boolean => {
    if (!security.requiredRoles || security.requiredRoles.length === 0) {
      return true;
    }

    const userRoles = user?.user_metadata?.roles || [];
    return security.requiredRoles.some(role => userRoles.includes(role));
  }, [security.requiredRoles, user]);

  /**
   * Checks if user meets security level requirements
   */
  const meetsSecurityLevel = useCallback((): boolean => {
    switch (security.level) {
      case 'public':
        return true;
      
      case 'authenticated':
        return isAuthenticated;
      
      case 'verified':
        return isAuthenticated && user?.email_confirmed_at != null;
      
      case 'medical_professional':
        return isAuthenticated && 
               user?.email_confirmed_at != null &&
               ['medical_personnel', 'medical_institute'].includes(user?.user_metadata?.profile_type);
      
      case 'admin':
        return isAuthenticated && 
               user?.user_metadata?.roles?.includes('admin');
      
      default:
        return false;
    }
  }, [security.level, isAuthenticated, user]);

  /**
   * Performs comprehensive authorization check
   */
  const checkAuthorization = useCallback(async (): Promise<boolean> => {
    try {
      // Basic security level check
      if (!meetsSecurityLevel()) {
        recordSecurityEvent({
          type: 'access_denied',
          userId: user?.id,
          path: location.pathname,
          metadata: { reason: 'insufficient_security_level', requiredLevel: security.level }
        });
        return false;
      }

      // Role-based access control
      if (!hasRequiredRoles()) {
        recordSecurityEvent({
          type: 'role_mismatch',
          userId: user?.id,
          path: location.pathname,
          metadata: { requiredRoles: security.requiredRoles, userRoles: user?.user_metadata?.roles }
        });
        return false;
      }

      // Session integrity validation
      if (!(await validateSessionIntegrity())) {
        recordSecurityEvent({
          type: 'session_invalid',
          userId: user?.id,
          path: location.pathname,
          metadata: { reason: 'session_integrity_failed' }
        });
        return false;
      }

      // Custom authorization logic
      if (security.customAuth && !(await security.customAuth(user))) {
        recordSecurityEvent({
          type: 'access_denied',
          userId: user?.id,
          path: location.pathname,
          metadata: { reason: 'custom_auth_failed' }
        });
        return false;
      }

      // All checks passed
      recordSecurityEvent({
        type: 'access_granted',
        userId: user?.id,
        path: location.pathname,
        metadata: { securityLevel: security.level }
      });
      
      return true;
    } catch (error) {
      logger.error('Authorization check failed', error instanceof Error ? error : new Error(String(error)), {
        component: 'SecureRoute',
        metadata: {
          userId: user?.id,
          path: location.pathname,
          securityLevel: security.level
        }
      });
      return false;
    }
  }, [
    meetsSecurityLevel,
    hasRequiredRoles,
    validateSessionIntegrity,
    security.customAuth,
    security.level,
    user,
    location.pathname,
    recordSecurityEvent
  ]);

  // Perform authorization check when dependencies change
  useEffect(() => {
    const performCheck = async () => {
      setAuthorizationState({ loading: true, authorized: false });

      try {
        const authorized = await checkAuthorization();
        setAuthorizationState({ loading: false, authorized });
      } catch (error) {
        setAuthorizationState({ 
          loading: false, 
          authorized: false, 
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    };

    if (!authLoading) {
      performCheck();
    }
  }, [authLoading, checkAuthorization]);

  // Show loading state
  if (authLoading || authorizationState.loading) {
    return <>{loadingComponent}</>;
  }

  // Show error if authorization check failed
  if (authorizationState.error && ErrorComponent) {
    return <ErrorComponent error={authorizationState.error} />;
  }

  // Redirect if unauthorized
  if (!authorizationState.authorized) {
    const redirectPath = security.unauthorizedRedirect || '/auth';
    
    // Show unauthorized component if no redirect specified
    if (!security.unauthorizedRedirect) {
      return unauthorizedComponent || <DefaultUnauthorizedComponent securityLevel={security.level} />;
    }
    
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Higher-order component for route security
 * 
 * @param security - Security configuration
 * @returns HOC function
 * 
 * @example
 * ```tsx
 * const ProtectedPatientPage = withSecureRoute({
 *   level: 'medical_professional',
 *   requiredRoles: ['doctor'],
 *   verifySessionIntegrity: true
 * })(PatientRecordsPage);
 * ```
 */
export function withSecureRoute(security: RouteSecurityConfig) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function SecureComponent(props: P) {
      return (
        <SecureRoute security={security}>
          <Component {...props} />
        </SecureRoute>
      );
    };
  };
}

/**
 * Utility function to create security configurations for common use cases
 */
export const SecurityConfigs = {
  /** Public route accessible to all users */
  public: (): RouteSecurityConfig => ({
    level: 'public',
    enableMonitoring: false
  }),

  /** Authenticated user route */
  authenticated: (): RouteSecurityConfig => ({
    level: 'authenticated',
    verifySessionIntegrity: true,
    enableMonitoring: true
  }),

  /** Verified user route */
  verified: (): RouteSecurityConfig => ({
    level: 'verified',
    verifySessionIntegrity: true,
    enableMonitoring: true
  }),

  /** Medical professional route */
  medicalProfessional: (): RouteSecurityConfig => ({
    level: 'medical_professional',
    requiredRoles: ['medical_personnel', 'medical_institute'],
    verifySessionIntegrity: true,
    enableMonitoring: true
  }),

  /** Admin-only route */
  admin: (): RouteSecurityConfig => ({
    level: 'admin',
    requiredRoles: ['admin'],
    verifySessionIntegrity: true,
    enableMonitoring: true,
    unauthorizedRedirect: '/unauthorized'
  })
};