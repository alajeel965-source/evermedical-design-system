/**
 * API utilities and helper functions
 * Common functionality used across API services
 */

/**
 * HTTP status codes for API responses
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  RATE_LIMITED = 429,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

/**
 * Common API error types
 */
export enum ApiErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Standard API response format
 */
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: ApiErrorType;
  statusCode?: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends StandardApiResponse<T[]> {
  pagination?: PaginationMeta;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  headers?: Record<string, string>;
}

/**
 * API utility class with common functionality
 */
export class ApiUtils {
  /**
   * Generate a unique request ID for tracking
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a standard API response
   */
  static createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    errorType?: ApiErrorType,
    statusCode?: number
  ): StandardApiResponse<T> {
    return {
      success,
      data,
      error,
      errorType,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    };
  }

  /**
   * Create a successful response
   */
  static success<T>(data: T, statusCode = HttpStatus.OK): StandardApiResponse<T> {
    return this.createResponse(true, data, undefined, undefined, statusCode);
  }

  /**
   * Create an error response
   */
  static error(
    error: string,
    errorType = ApiErrorType.UNKNOWN,
    statusCode = HttpStatus.INTERNAL_ERROR
  ): StandardApiResponse<null> {
    return this.createResponse(false, null, error, errorType, statusCode);
  }

  /**
   * Determine error type from HTTP status code
   */
  static getErrorTypeFromStatus(statusCode: number): ApiErrorType {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return ApiErrorType.VALIDATION;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorType.AUTHENTICATION;
      case HttpStatus.FORBIDDEN:
        return ApiErrorType.AUTHORIZATION;
      case HttpStatus.NOT_FOUND:
        return ApiErrorType.NOT_FOUND;
      case HttpStatus.RATE_LIMITED:
        return ApiErrorType.RATE_LIMIT;
      case HttpStatus.INTERNAL_ERROR:
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ApiErrorType.SERVER;
      default:
        return ApiErrorType.UNKNOWN;
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyError(errorType: ApiErrorType, originalError?: string): string {
    switch (errorType) {
      case ApiErrorType.NETWORK:
        return 'Network connection error. Please check your internet connection.';
      case ApiErrorType.VALIDATION:
        return originalError || 'Invalid input. Please check your data and try again.';
      case ApiErrorType.AUTHENTICATION:
        return 'Authentication required. Please sign in and try again.';
      case ApiErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ApiErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ApiErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment before trying again.';
      case ApiErrorType.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ApiErrorType.SERVER:
        return 'Server error. Please try again later.';
      default:
        return originalError || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Retry function with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Create debounced function
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Create throttled function
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize URL for safe usage
   */
  static sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid protocol');
      }
      return urlObj.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Parse error from various sources
   */
  static parseError(error: unknown): { message: string; type: ApiErrorType } {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('fetch')) {
        return { message: error.message, type: ApiErrorType.NETWORK };
      }
      if (error.message.includes('timeout')) {
        return { message: error.message, type: ApiErrorType.TIMEOUT };
      }
      return { message: error.message, type: ApiErrorType.UNKNOWN };
    }

    if (typeof error === 'string') {
      return { message: error, type: ApiErrorType.UNKNOWN };
    }

    return { message: 'An unknown error occurred', type: ApiErrorType.UNKNOWN };
  }
}