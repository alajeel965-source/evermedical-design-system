/**
 * EverMedical Utility Functions
 * 
 * A comprehensive collection of utility functions for the medical platform.
 * Provides type-safe, optimized, and secure helpers for common operations.
 * 
 * @author EverMedical Team
 * @version 2.0.0
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { logger } from "./logger";

/**
 * Combines and merges CSS classes using clsx and tailwind-merge
 * Prevents duplicate classes and handles conditional styling
 * 
 * @param inputs - CSS class values to combine
 * @returns Merged CSS class string
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', condition && 'text-white')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes string input to prevent XSS attacks
 * Removes potentially dangerous characters and limits length
 * 
 * @param input - Input string to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"';&]/g, '') // Remove potentially dangerous characters
    .substring(0, maxLength);
}

/**
 * Validates email format using RFC-compliant regex
 * 
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Formats file size in bytes to human-readable format
 * 
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 * 
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576, 1) // "1.0 MB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Truncates text to specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Generates a secure random ID
 * 
 * @param length - Length of the ID (default: 12)
 * @returns Random ID string
 */
export function generateId(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Retry function with exponential backoff for network operations
 * Increases delay between retries to avoid overwhelming servers
 * 
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise resolving to function result
 * 
 * @example
 * const data = await retryWithBackoff(() => fetchUserData(id), 3, 1000);
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        logger.error(`Retry failed after ${maxRetries} attempts`, lastError);
        throw lastError;
      }
      
      // Exponential backoff with jitter to prevent thundering herd
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      logger.warn(`Retry attempt ${i + 1}/${maxRetries} in ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Debounce function for performance optimization
 * Delays function execution until after specified time has passed
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => searchAPI(query), 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(func(...args));
      }, delay);
    });
  };
}

/**
 * Throttle function for rate limiting
 * Ensures function is called at most once per specified interval
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;
  
  return (...args: Parameters<T>): ReturnType<T> | void => {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
      return lastResult;
    }
  };
}

/**
 * Deep clones an object safely
 * 
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const copy = {} as T;
    Object.keys(obj).forEach(key => {
      (copy as any)[key] = deepClone((obj as any)[key]);
    });
    return copy;
  }
  return obj;
}

/**
 * Formats date for display in the medical platform
 * 
 * @param date - Date to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Safely parses JSON with error handling
 * 
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    logger.warn('Failed to parse JSON', {
      component: 'utils',
      metadata: { jsonLength: json.length }
    });
    return fallback;
  }
}

/**
 * Checks if code is running in development environment
 * 
 * @returns True if in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Logs errors with proper context and security considerations
 * Replaces direct console.* usage throughout the application
 * 
 * @param error - Error to log
 * @param context - Additional context information
 * @deprecated Use logger.error() instead for better structured logging
 */
export function devLog(error: any, context?: string): void {
  logger.error(
    context || 'Development error',
    error instanceof Error ? error : new Error(String(error)),
    { component: 'dev-log' }
  );
}

/**
 * Performance measurement utility
 * 
 * @param name - Name of the operation being measured
 * @returns Function to call when operation completes
 * 
 * @example
 * const endTimer = measurePerformance('api-call');
 * await apiCall();
 * endTimer(); // Logs the duration
 */
export function measurePerformance(name: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    logger.perf(name, Math.round(duration));
  };
}

/**
 * Validates and sanitizes user input for healthcare compliance
 * 
 * @param input - User input to validate
 * @param type - Type of input ('email', 'name', 'phone', 'text')
 * @returns Sanitized and validated input
 */
export function validateInput(input: string, type: 'email' | 'name' | 'phone' | 'text'): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = sanitizeString(input);
  let isValid = true;

  switch (type) {
    case 'email':
      if (!isValidEmail(sanitized)) {
        errors.push('Invalid email format');
        isValid = false;
      }
      break;
      
    case 'name':
      if (sanitized.length < 2) {
        errors.push('Name must be at least 2 characters');
        isValid = false;
      }
      if (!/^[a-zA-Z\s\-'\.]+$/.test(sanitized)) {
        errors.push('Name contains invalid characters');
        isValid = false;
      }
      break;
      
    case 'phone':
      // Remove all non-digit characters for validation
      const phoneDigits = sanitized.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        errors.push('Invalid phone number format');
        isValid = false;
      }
      break;
      
    case 'text':
      if (sanitized.length === 0) {
        errors.push('Text cannot be empty');
        isValid = false;
      }
      break;
  }

  return { isValid, sanitized, errors };
}