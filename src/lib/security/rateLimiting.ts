/**
 * Client-Side Rate Limiting for Healthcare Applications
 * 
 * Implements client-side rate limiting to prevent abuse and ensure
 * compliance with healthcare data access patterns and security requirements.
 * 
 * @fileoverview Client-side rate limiting utilities
 * @version 1.0.0
 * @since 2024-01-01
 */

import { logger } from '@/lib/logger';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique identifier for the rate limit */
  identifier: string;
  /** Custom error message */
  message?: string;
  /** Skip function to bypass rate limiting */
  skip?: () => boolean;
}

/**
 * Rate limit attempt record
 */
interface RateLimitAttempt {
  timestamp: number;
  identifier: string;
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Time until window resets (milliseconds) */
  resetTime: number;
  /** Total requests in current window */
  totalRequests: number;
  /** Error message if rate limited */
  message?: string;
}

/**
 * Healthcare-specific rate limit presets
 */
export const HealthcareRateLimits = {
  /** Patient data access - strict limits */
  patientDataAccess: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'patient-data-access',
    message: 'Too many patient data requests. Please wait before accessing more records.'
  } as RateLimitConfig,

  /** Search operations - moderate limits */
  searchOperations: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'search-operations',
    message: 'Too many search requests. Please wait before searching again.'
  } as RateLimitConfig,

  /** File uploads - conservative limits */
  fileUploads: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    identifier: 'file-uploads',
    message: 'Upload limit reached. Please wait before uploading more files.'
  } as RateLimitConfig,

  /** API calls - generous limits */
  apiCalls: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'api-calls',
    message: 'Too many API requests. Please slow down.'
  } as RateLimitConfig,

  /** Authentication attempts - security focused */
  authAttempts: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: 'auth-attempts',
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
  } as RateLimitConfig,

  /** Password reset - strict security */
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    identifier: 'password-reset',
    message: 'Too many password reset requests. Please wait 1 hour before trying again.'
  } as RateLimitConfig
};

/**
 * Client-side rate limiter with healthcare-specific configurations
 */
export class ClientRateLimiter {
  private static attempts: Map<string, RateLimitAttempt[]> = new Map();
  private static readonly STORAGE_KEY = 'evermedical_rate_limits';
  private static initialized = false;

  /**
   * Initialize rate limiter with persistent storage
   */
  static initialize() {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      // Load existing attempts from localStorage
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as Record<string, RateLimitAttempt[]>;
        this.attempts = new Map(Object.entries(data));
      }

      // Clean up expired attempts on initialization
      this.cleanupExpiredAttempts();

      // Set up periodic cleanup
      setInterval(() => this.cleanupExpiredAttempts(), 60 * 1000); // Every minute

      this.initialized = true;
      
      logger.info('Client rate limiter initialized', {
        component: 'ClientRateLimiter',
        metadata: { 
          storedLimits: this.attempts.size,
          totalAttempts: Array.from(this.attempts.values()).reduce((sum, arr) => sum + arr.length, 0)
        }
      });
    } catch (error) {
      logger.error('Failed to initialize rate limiter', error instanceof Error ? error : new Error(String(error)), {
        component: 'ClientRateLimiter'
      });
    }
  }

  /**
   * Check if request is allowed under rate limit
   * 
   * @param config - Rate limit configuration
   * @returns Rate limit status
   * 
   * @example
   * ```typescript
   * const status = ClientRateLimiter.checkLimit(HealthcareRateLimits.patientDataAccess);
   * if (!status.allowed) {
   *   alert(status.message);
   *   return;
   * }
   * ```
   */
  static checkLimit(config: RateLimitConfig): RateLimitStatus {
    // Initialize if not already done
    if (!this.initialized) {
      this.initialize();
    }

    // Skip rate limiting if skip function returns true
    if (config.skip?.()) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: 0,
        totalRequests: 0
      };
    }

    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get existing attempts for this identifier
    const attempts = this.attempts.get(config.identifier) || [];
    
    // Filter attempts within current window
    const validAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    
    // Check if limit is exceeded
    const remaining = Math.max(0, config.maxRequests - validAttempts.length);
    const allowed = validAttempts.length < config.maxRequests;
    
    // Calculate reset time (when oldest attempt in window expires)
    const oldestAttempt = validAttempts.length > 0 ? Math.min(...validAttempts.map(a => a.timestamp)) : now;
    const resetTime = Math.max(0, (oldestAttempt + config.windowMs) - now);

    const status: RateLimitStatus = {
      allowed,
      remaining: allowed ? remaining - 1 : remaining,
      resetTime,
      totalRequests: validAttempts.length,
      message: allowed ? undefined : config.message
    };

    // Record this attempt if allowed
    if (allowed) {
      const newAttempt: RateLimitAttempt = {
        timestamp: now,
        identifier: config.identifier
      };
      
      validAttempts.push(newAttempt);
      this.attempts.set(config.identifier, validAttempts);
      
      // Persist to localStorage
      this.persistAttempts();
      
      logger.debug('Rate limit checked - allowed', {
        component: 'ClientRateLimiter',
        metadata: {
          identifier: config.identifier,
          remaining: status.remaining,
          totalRequests: status.totalRequests
        }
      });
    } else {
      logger.warn('Rate limit exceeded', {
        component: 'ClientRateLimiter',
        metadata: {
          identifier: config.identifier,
          maxRequests: config.maxRequests,
          windowMs: config.windowMs,
          totalRequests: status.totalRequests,
          resetTime: status.resetTime
        }
      });
    }

    return status;
  }

  /**
   * Reset rate limit for specific identifier
   * 
   * @param identifier - Rate limit identifier to reset
   * 
   * @example
   * ```typescript
   * ClientRateLimiter.resetLimit('patient-data-access');
   * ```
   */
  static resetLimit(identifier: string): void {
    this.attempts.delete(identifier);
    this.persistAttempts();
    
    logger.info('Rate limit reset', {
      component: 'ClientRateLimiter',
      metadata: { identifier }
    });
  }

  /**
   * Get current status without making an attempt
   * 
   * @param config - Rate limit configuration
   * @returns Current rate limit status
   */
  static getStatus(config: RateLimitConfig): Omit<RateLimitStatus, 'allowed'> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const attempts = this.attempts.get(config.identifier) || [];
    const validAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    
    const remaining = Math.max(0, config.maxRequests - validAttempts.length);
    const oldestAttempt = validAttempts.length > 0 ? Math.min(...validAttempts.map(a => a.timestamp)) : now;
    const resetTime = Math.max(0, (oldestAttempt + config.windowMs) - now);

    return {
      remaining,
      resetTime,
      totalRequests: validAttempts.length
    };
  }

  /**
   * Clean up expired attempts to prevent memory leaks
   */
  private static cleanupExpiredAttempts(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [identifier, attempts] of this.attempts.entries()) {
      // Find the longest window time to determine what's expired
      const maxWindowMs = 60 * 60 * 1000; // 1 hour max retention
      const cutoff = now - maxWindowMs;
      
      const validAttempts = attempts.filter(attempt => attempt.timestamp > cutoff);
      
      if (validAttempts.length !== attempts.length) {
        cleaned += attempts.length - validAttempts.length;
        
        if (validAttempts.length === 0) {
          this.attempts.delete(identifier);
        } else {
          this.attempts.set(identifier, validAttempts);
        }
      }
    }

    if (cleaned > 0) {
      this.persistAttempts();
      
      logger.debug('Cleaned up expired rate limit attempts', {
        component: 'ClientRateLimiter',
        metadata: { cleaned, remaining: this.attempts.size }
      });
    }
  }

  /**
   * Persist attempts to localStorage
   */
  private static persistAttempts(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Object.fromEntries(this.attempts);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to persist rate limit attempts', {
        component: 'ClientRateLimiter',
        metadata: { 
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * Clear all rate limit data
   */
  static clearAll(): void {
    this.attempts.clear();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    
    logger.info('All rate limit data cleared', {
      component: 'ClientRateLimiter'
    });
  }
}

/**
 * React hook for rate limiting with automatic status updates
 * 
 * @param config - Rate limit configuration
 * @returns Rate limit utilities and status
 * 
 * @example
 * ```typescript
 * const { checkLimit, status, isLimited } = useRateLimit(
 *   HealthcareRateLimits.patientDataAccess
 * );
 * 
 * const handlePatientAccess = () => {
 *   const result = checkLimit();
 *   if (!result.allowed) {
 *     showError(result.message);
 *     return;
 *   }
 *   // Proceed with patient data access
 * };
 * ```
 */
export function useRateLimit(config: RateLimitConfig) {
  const [status, setStatus] = useState<RateLimitStatus>(() => ({
    allowed: true,
    remaining: config.maxRequests,
    resetTime: 0,
    totalRequests: 0
  }));

  // Initialize rate limiter
  useEffect(() => {
    ClientRateLimiter.initialize();
  }, []);

  // Update status periodically
  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = ClientRateLimiter.getStatus(config);
      setStatus(prev => ({
        ...prev,
        ...currentStatus,
        allowed: currentStatus.remaining > 0
      }));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000); // Update every second

    return () => clearInterval(interval);
  }, [config]);

  const checkLimit = useCallback(() => {
    const result = ClientRateLimiter.checkLimit(config);
    setStatus(result);
    return result;
  }, [config]);

  const resetLimit = useCallback(() => {
    ClientRateLimiter.resetLimit(config.identifier);
    setStatus({
      allowed: true,
      remaining: config.maxRequests,
      resetTime: 0,
      totalRequests: 0
    });
  }, [config]);

  return {
    checkLimit,
    resetLimit,
    status,
    isLimited: !status.allowed,
    remaining: status.remaining,
    resetTime: status.resetTime
  };
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  ClientRateLimiter.initialize();
}

import { useState, useEffect, useCallback } from 'react';