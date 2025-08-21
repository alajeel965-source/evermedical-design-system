import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from "@/lib/logger";

/**
 * Enhanced Error Boundary Component
 * 
 * Provides production-ready error handling with:
 * - Structured error logging
 * - User-friendly error display
 * - Recovery mechanisms
 * - Development-only error details
 * 
 * @author EverMedical Team
 * @version 2.0.0
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using structured logging system
    logger.error('React Error Boundary caught error', error, {
      component: 'ErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name
      }
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="max-w-md mx-auto text-center p-xl">
            <div className="mb-lg">
              <AlertTriangle className="h-16 w-16 text-warning mx-auto mb-lg" />
              <h1 className="text-heading font-bold text-medical-2xl mb-md">
                Something went wrong
              </h1>
              <p className="text-body text-medical-base">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
            
            <div className="space-y-md">
              <Button 
                onClick={this.handleReset}
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                onClick={this.handleReload}
                variant="outline"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-lg text-left">
                <summary className="cursor-pointer text-sm text-muted">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-sm p-sm bg-destructive/10 rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}