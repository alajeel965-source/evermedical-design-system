/**
 * Enhanced Error Boundary with fallback UI and error reporting
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Analytics } from '@/lib/api';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Enhanced Error Boundary component with better UX
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      errorInfo,
      eventId,
    });

    // Log error to analytics
    Analytics.trackEvent('error_boundary_triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      eventId,
      retryCount: this.retryCount,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.retryCount++;
    
    Analytics.trackEvent('error_boundary_retry', {
      eventId: this.state.eventId,
      retryCount: this.retryCount,
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleGoHome = () => {
    Analytics.trackEvent('error_boundary_go_home', {
      eventId: this.state.eventId,
    });
    
    window.location.href = '/';
  };

  handleReportError = () => {
    Analytics.trackEvent('error_boundary_report', {
      eventId: this.state.eventId,
    });

    // Open email client with error details
    const subject = encodeURIComponent('Error Report - EverMedical');
    const body = encodeURIComponent(`
Error ID: ${this.state.eventId}
Error Message: ${this.state.error?.message}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:

`);
    
    window.open(`mailto:support@evermedical.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl text-heading">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-body text-center">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>

              {this.props.showErrorDetails && this.state.error && (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs">
                    <details>
                      <summary className="cursor-pointer font-sans font-medium">
                        Error Details (Click to expand)
                      </summary>
                      <div className="mt-2 pt-2 border-t">
                        <p><strong>Message:</strong> {this.state.error.message}</p>
                        <p><strong>Event ID:</strong> {this.state.eventId}</p>
                        {this.state.error.stack && (
                          <div className="mt-2">
                            <strong>Stack Trace:</strong>
                            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-32">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {this.retryCount < this.maxRetries ? (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleGoHome}
                    className="flex-1"
                    variant="default"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReportError}
                  variant="outline"
                  className="flex-1"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </div>

              {this.state.eventId && (
                <p className="text-xs text-muted-foreground text-center">
                  Error ID: {this.state.eventId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of Error Boundary for functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    Analytics.trackEvent('error_handler_used', {
      error: error.message,
      stack: error.stack,
    });

    console.error('Error caught by useErrorHandler:', error, errorInfo);
  };
}

export default ErrorBoundary;