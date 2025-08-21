/**
 * Security-enhanced error boundary with comprehensive error handling
 * Safely handles security errors and prevents information leakage
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Shield, ArrowLeft } from 'lucide-react';
import { Analytics } from '@/lib/api';
import { SecurityError, ValidationError, RateLimitError } from '@/lib/secureApi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  errorType: 'security' | 'validation' | 'rate-limit' | 'general';
  isRetrying: boolean;
}

export class SecurityErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      errorType: 'general',
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine error type for appropriate handling
    let errorType: State['errorType'] = 'general';
    if (error instanceof SecurityError) {
      errorType = 'security';
    } else if (error instanceof ValidationError) {
      errorType = 'validation';
    } else if (error instanceof RateLimitError) {
      errorType = 'rate-limit';
    }

    return {
      hasError: true,
      error,
      errorId,
      errorType,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId, errorType } = this.state;
    
    // Log error for monitoring (sanitized for security)
    const sanitizedError = {
      message: this.getSafeErrorMessage(error),
      name: error.name,
      errorId,
      errorType,
      componentStack: errorInfo.componentStack?.substring(0, 500), // Limit stack trace
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Track error for analytics
    Analytics.trackEvent('security_error_boundary_triggered', sanitizedError);

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // In development, log full error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('SecurityErrorBoundary caught an error:', error, errorInfo);
    }
  }

  /**
   * Get a safe error message that doesn't leak sensitive information
   */
  private getSafeErrorMessage(error: Error): string {
    const { errorType } = this.state;

    switch (errorType) {
      case 'security':
        return 'A security error occurred. Please try again or contact support.';
      case 'validation':
        return error.message; // Validation errors are usually safe to show
      case 'rate-limit':
        return 'Too many requests. Please wait a moment before trying again.';
      default:
        // For general errors, show a generic message to prevent information leakage
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get appropriate action for the error type
   */
  private getErrorAction() {
    const { errorType } = this.state;

    switch (errorType) {
      case 'security':
        return {
          text: 'Go to Safety',
          icon: Shield,
          action: () => window.location.href = '/',
        };
      case 'rate-limit':
        return {
          text: 'Wait and Retry',
          icon: RefreshCw,
          action: () => {
            setTimeout(() => this.handleRetry(), 5000); // Wait 5 seconds
          },
        };
      default:
        return {
          text: 'Try Again',
          icon: RefreshCw,
          action: () => this.handleRetry(),
        };
    }
  }

  /**
   * Handle retry with exponential backoff
   */
  private handleRetry = () => {
    if (this.retryCount >= this.maxRetries) {
      // Max retries reached, redirect to safe page
      window.location.href = '/';
      return;
    }

    this.setState({ isRetrying: true });
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, this.retryCount) * 1000;
    
    setTimeout(() => {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorId: null,
        errorType: 'general',
        isRetrying: false,
      });
    }, delay);
  };

  /**
   * Handle going back safely
   */
  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, errorType, isRetrying } = this.state;
      const safeMessage = this.getSafeErrorMessage(error!);
      const action = this.getErrorAction();
      const ActionIcon = action.icon;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
          <Card className="w-full max-w-md p-6 text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {errorType === 'security' ? 'Security Issue' : 'Something went wrong'}
              </h2>
              <p className="text-muted-foreground">
                {safeMessage}
              </p>
              {errorId && (
                <p className="text-xs text-muted-foreground font-mono">
                  Error ID: {errorId}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={action.action}
                disabled={isRetrying}
                className="w-full"
                variant={errorType === 'security' ? 'destructive' : 'default'}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <ActionIcon className="w-4 h-4 mr-2" />
                    {action.text}
                  </>
                )}
              </Button>

              {errorType !== 'security' && (
                <Button
                  onClick={this.handleGoBack}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              )}
            </div>

            {/* Additional Info for Development */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer">
                  Debug Info (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SecurityErrorBoundary;