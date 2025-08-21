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

/**
 * Contextual information for log entries
 * Used to provide structured metadata for debugging and monitoring
 */
interface LogContext {
  /** Component or service generating the log */
  component?: string;
  /** User ID associated with the action (auto-sanitized) */
  userId?: string;
  /** Session ID for tracking user sessions */
  sessionId?: string;
  /** Action or operation being performed */
  action?: string;
  /** Additional structured metadata */
  metadata?: Record<string, any>;
}

/**
 * Structured log entry format
 * Standardized format for all log outputs
 */
interface LogEntry {
  /** ISO timestamp of the log event */
  timestamp: string;
  /** Severity level of the log */
  level: LogLevel;
  /** Human-readable log message */
  message: string;
  /** Optional contextual information */
  context?: LogContext;
  /** Error details if applicable */
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Production-grade logger with healthcare compliance features
 * 
 * Automatically sanitizes PII, structures logs for monitoring systems,
 * and provides environment-appropriate output formatting.
 */
class Logger {
  /** Development environment flag */
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';
  /** Test environment flag */
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
   * Only outputs in development environment to prevent sensitive data leaks
   * 
   * @param message - Debug message
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.debug('Processing user data', { 
   *   component: 'userProcessor',
   *   metadata: { recordCount: 42 }
   * });
   * ```
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Info level logging
   * Used for normal application flow and important events
   * 
   * @param message - Information message
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.info('User profile updated successfully', {
   *   component: 'profileService',
   *   userId: user.id
   * });
   * ```
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   * Used for potentially problematic situations that don't prevent operation
   * 
   * @param message - Warning message
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.warn('API rate limit approaching', {
   *   component: 'apiClient',
   *   metadata: { currentRate: 90, limit: 100 }
   * });
   * ```
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   * Used for error conditions that require attention
   * 
   * @param message - Error message
   * @param error - Optional Error object with stack trace
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.error('Database connection failed', dbError, {
   *   component: 'databaseService',
   *   metadata: { host: 'db.example.com', port: 5432 }
   * });
   * ```
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  /**
   * Authentication-specific logging
   * Specialized logging for auth events with automatic component tagging
   * 
   * @param action - Authentication action performed
   * @param context - Authentication context (excluding component)
   * 
   * @example
   * ```typescript
   * logger.auth('login_success', { 
   *   userId: user.id, 
   *   metadata: { method: '2fa', ip: '192.168.1.1' }
   * });
   * ```
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

/**
 * Global logger instance for the EverMedical platform
 * 
 * Pre-configured logger with healthcare compliance features:
 * - Automatic PII sanitization for patient data protection
 * - Structured JSON output for monitoring integration
 * - Environment-specific formatting and filtering
 * - Integration with external monitoring services
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 * 
 * // Log user actions
 * logger.info('Medical event created', {
 *   component: 'eventService',
 *   userId: user.id,
 *   metadata: { eventType: 'conference', specialty: 'cardiology' }
 * });
 * 
 * // Log errors with context
 * logger.error('Failed to process RFQ', error, {
 *   component: 'rfqProcessor', 
 *   metadata: { rfqId: 'rfq-123', retryCount: 3 }
 * });
 * ```
 */
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogContext, LogEntry };