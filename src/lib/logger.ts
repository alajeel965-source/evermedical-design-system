/**
 * EverMedical Production Logger
 * 
 * Centralized, type-safe logging system for the medical platform.
 * Provides structured logging with proper error handling and security considerations.
 * 
 * Features:
 * - Environment-aware logging (dev vs production)
 * - Structured log formats for better monitoring
 * - PII sanitization for healthcare compliance
 * - Integration ready for external monitoring services
 * 
 * @author EverMedical Team
 * @version 2.0.0
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';
  private isTestEnvironment: boolean = process.env.NODE_ENV === 'test';

  /**
   * Sanitizes potentially sensitive information from logs
   * Removes PII and sensitive healthcare data
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    
    // Remove sensitive fields
    if (sanitized.metadata) {
      const { password, token, email, phone, ssn, ...safeMeta } = sanitized.metadata;
      sanitized.metadata = safeMeta;
    }
    
    // Hash user ID for privacy in production
    if (sanitized.userId && !this.isDevelopment) {
      sanitized.userId = `user_${this.hashString(sanitized.userId)}`;
    }
    
    return sanitized;
  }

  /**
   * Simple hash function for user ID anonymization
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Creates structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.sanitizeContext(context) : undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      } : undefined
    };
  }

  /**
   * Sends log to external monitoring service in production
   */
  private async sendToMonitoring(logEntry: LogEntry): Promise<void> {
    if (this.isDevelopment || this.isTestEnvironment) return;

    try {
      // In production, you would send to your monitoring service
      // Example integrations:
      // - Sentry: Sentry.captureMessage(logEntry.message, logEntry.level as SeverityLevel);
      // - LogRocket: LogRocket.captureException(new Error(logEntry.message));
      // - DataDog: DD_LOGS.logger.log(logEntry.message, logEntry, logEntry.level);
      
      // For now, we'll use a placeholder that could be replaced with actual service
      if (typeof window !== 'undefined' && (window as any).MonitoringService) {
        (window as any).MonitoringService.log(logEntry);
      }
    } catch (monitoringError) {
      // Fallback to console if monitoring service fails
      console.error('Monitoring service failed:', monitoringError);
      console.error('Original log entry:', logEntry);
    }
  }

  /**
   * Outputs log to console in development with nice formatting
   */
  private outputToConsole(logEntry: LogEntry): void {
    if (this.isTestEnvironment) return;

    const { timestamp, level, message, context, error } = logEntry;
    const timeStr = new Date(timestamp).toLocaleTimeString();
    
    const styles = {
      debug: 'color: #6B7280; font-weight: normal;',
      info: 'color: #059669; font-weight: bold;',
      warn: 'color: #D97706; font-weight: bold;',
      error: 'color: #DC2626; font-weight: bold;'
    };

    if (this.isDevelopment) {
      console.groupCollapsed(
        `%c[${level.toUpperCase()}] ${timeStr} - ${message}`,
        styles[level]
      );
      
      if (context) {
        console.log('Context:', context);
      }
      
      if (error) {
        console.error('Error:', error);
      }
      
      console.groupEnd();
    } else {
      // Production: structured logging for parsing
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Main logging method
   */
  private async log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    const logEntry = this.createLogEntry(level, message, context, error);
    
    // Always output to console (with environment-appropriate formatting)
    this.outputToConsole(logEntry);
    
    // Send to monitoring in production
    await this.sendToMonitoring(logEntry);
  }

  // Public API methods
  
  /**
   * Debug level logging - development only
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  /**
   * Authentication-specific logging
   */
  auth(action: string, context?: Omit<LogContext, 'component'>): void {
    this.info(`Auth: ${action}`, { ...context, component: 'auth' });
  }

  /**
   * API call logging
   */
  api(method: string, endpoint: string, duration?: number, context?: LogContext): void {
    const message = `API: ${method.toUpperCase()} ${endpoint}${duration ? ` (${duration}ms)` : ''}`;
    this.info(message, { ...context, component: 'api' });
  }

  /**
   * User interaction tracking
   */
  track(event: string, properties?: Record<string, any>): void {
    this.info(`Track: ${event}`, { 
      component: 'analytics',
      metadata: properties 
    });
  }

  /**
   * Performance monitoring
   */
  perf(metric: string, value: number, context?: LogContext): void {
    this.info(`Performance: ${metric} = ${value}ms`, { 
      ...context, 
      component: 'performance' 
    });
  }

  /**
   * Security event logging
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level: LogLevel = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this.log(level, `Security: ${event}`, { 
      ...context, 
      component: 'security',
      metadata: { severity }
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogContext, LogEntry };