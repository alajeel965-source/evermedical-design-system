/**
 * Enhanced Input Validation System for Healthcare Applications
 * 
 * Provides comprehensive validation with healthcare-specific security measures
 * including PII detection, SQL injection prevention, and medical data validation.
 * 
 * @fileoverview Security-focused input validation for EverMedical platform
 * @version 1.0.0
 * @since 2024-01-01
 */

import { logger } from '@/lib/logger';

/**
 * Validation result structure
 */
export interface ValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Sanitized version of the input */
  sanitizedValue?: string;
  /** Security warnings if any */
  warnings: string[];
}

/**
 * Validation rule configuration
 */
export interface ValidationRule {
  /** Rule type identifier */
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'medical' | 'pii';
  /** Rule parameter value */
  value?: any;
  /** Custom error message */
  message?: string;
  /** Custom validation function */
  validator?: (input: string) => boolean;
}

/**
 * Security patterns for detecting potential threats
 */
const SECURITY_PATTERNS = {
  // SQL Injection patterns
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|(\-\-)|(\;)/gi,
  
  // XSS patterns
  xss: /<script[^>]*>.*?<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed/gi,
  
  // Path traversal
  pathTraversal: /\.\.[\/\\]/g,
  
  // Command injection
  commandInjection: /(\||;|&|`|\$\(|\$\{)/g,
  
  // Suspicious medical patterns
  suspiciousMedical: /\b(SSN|Social Security|Credit Card|Password|PIN)\b/gi,
};

/**
 * PII (Personally Identifiable Information) patterns
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers
  phone: /\b(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  
  // SSN patterns
  ssn: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
  
  // Credit card patterns
  creditCard: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
  
  // Medical Record Numbers
  mrn: /\b(MRN|Medical Record|Patient ID)[:=\s]+[\w\-]+/gi,
};

/**
 * Medical-specific validation patterns
 */
const MEDICAL_PATTERNS = {
  // ICD-10 codes
  icd10: /^[A-TV-Z][0-9][0-9AB]\.?[0-9A-TV-Z]{0,4}$/,
  
  // CPT codes
  cpt: /^\d{5}$/,
  
  // NPI (National Provider Identifier)
  npi: /^[0-9]{10}$/,
  
  // DEA numbers
  dea: /^[ABCDEFGHJKLMNPRSTUX][ABCDEFGHJKLMNPRSTUX0-9]{1}[0-9]{7}$/,
  
  // Medical license numbers (general pattern)
  medicalLicense: /^[A-Z]{1,3}[0-9]{4,8}$/,
};

/**
 * Comprehensive input validator with healthcare-specific security
 */
export class SecureInputValidator {
  
  /**
   * Validates input against multiple security and business rules
   * 
   * @param input - Input value to validate
   * @param rules - Array of validation rules
   * @param context - Validation context for logging
   * @returns Validation result with errors and sanitized value
   * 
   * @example
   * ```typescript
   * const result = SecureInputValidator.validate(userInput, [
   *   { type: 'required', message: 'Email is required' },
   *   { type: 'email', message: 'Must be valid email' },
   *   { type: 'maxLength', value: 255 }
   * ]);
   * 
   * if (!result.isValid) {
   *   console.error(result.errors);
   * }
   * ```
   */
  static validate(
    input: string, 
    rules: ValidationRule[], 
    context?: string
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: input
    };

    // Skip validation for empty input unless required
    if (!input || input.trim() === '') {
      const requiredRule = rules.find(rule => rule.type === 'required');
      if (requiredRule) {
        result.isValid = false;
        result.errors.push(requiredRule.message || 'This field is required');
      }
      return result;
    }

    // Security validation - always performed
    const securityIssues = this.checkSecurityThreats(input);
    if (securityIssues.length > 0) {
      result.isValid = false;
      result.errors.push(...securityIssues);
      
      // Log security violations
      logger.error('Security validation failed', new Error('Input validation security violation'), {
        component: 'SecureInputValidator',
        metadata: { 
          context: context || 'unknown',
          violationType: 'security_pattern_match'
        }
      });
    }

    // PII detection
    const piiWarnings = this.detectPII(input);
    result.warnings.push(...piiWarnings);

    // Business rule validation
    for (const rule of rules) {
      const ruleResult = this.validateRule(input, rule);
      if (!ruleResult.isValid) {
        result.isValid = false;
        result.errors.push(...ruleResult.errors);
      }
    }

    // Sanitize input if valid
    if (result.isValid) {
      result.sanitizedValue = this.sanitizeInput(input);
    }

    return result;
  }

  /**
   * Checks input for security threats
   */
  private static checkSecurityThreats(input: string): string[] {
    const threats: string[] = [];

    // SQL Injection check
    if (SECURITY_PATTERNS.sqlInjection.test(input)) {
      threats.push('Input contains potential SQL injection patterns');
    }

    // XSS check
    if (SECURITY_PATTERNS.xss.test(input)) {
      threats.push('Input contains potential XSS patterns');
    }

    // Path traversal check
    if (SECURITY_PATTERNS.pathTraversal.test(input)) {
      threats.push('Input contains path traversal patterns');
    }

    // Command injection check
    if (SECURITY_PATTERNS.commandInjection.test(input)) {
      threats.push('Input contains potential command injection patterns');
    }

    return threats;
  }

  /**
   * Detects Personally Identifiable Information
   */
  private static detectPII(input: string): string[] {
    const warnings: string[] = [];

    if (PII_PATTERNS.ssn.test(input)) {
      warnings.push('Input may contain Social Security Number');
    }

    if (PII_PATTERNS.creditCard.test(input)) {
      warnings.push('Input may contain credit card information');
    }

    if (PII_PATTERNS.mrn.test(input)) {
      warnings.push('Input may contain medical record numbers');
    }

    return warnings;
  }

  /**
   * Validates individual rule
   */
  private static validateRule(input: string, rule: ValidationRule): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    switch (rule.type) {
      case 'required':
        if (!input || input.trim() === '') {
          result.isValid = false;
          result.errors.push(rule.message || 'This field is required');
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Must be a valid email address');
        }
        break;

      case 'minLength':
        if (input.length < rule.value) {
          result.isValid = false;
          result.errors.push(rule.message || `Must be at least ${rule.value} characters`);
        }
        break;

      case 'maxLength':
        if (input.length > rule.value) {
          result.isValid = false;
          result.errors.push(rule.message || `Must not exceed ${rule.value} characters`);
        }
        break;

      case 'pattern':
        if (!rule.value.test(input)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Invalid format');
        }
        break;

      case 'medical':
        const medicalValidation = this.validateMedicalData(input, rule.value);
        if (!medicalValidation.isValid) {
          result.isValid = false;
          result.errors.push(...medicalValidation.errors);
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(input)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Custom validation failed');
        }
        break;
    }

    return result;
  }

  /**
   * Validates medical-specific data formats
   */
  private static validateMedicalData(input: string, medicalType: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    switch (medicalType) {
      case 'icd10':
        if (!MEDICAL_PATTERNS.icd10.test(input)) {
          result.isValid = false;
          result.errors.push('Invalid ICD-10 code format');
        }
        break;

      case 'cpt':
        if (!MEDICAL_PATTERNS.cpt.test(input)) {
          result.isValid = false;
          result.errors.push('Invalid CPT code format');
        }
        break;

      case 'npi':
        if (!MEDICAL_PATTERNS.npi.test(input)) {
          result.isValid = false;
          result.errors.push('Invalid NPI format');
        }
        break;

      case 'dea':
        if (!MEDICAL_PATTERNS.dea.test(input)) {
          result.isValid = false;
          result.errors.push('Invalid DEA number format');
        }
        break;
    }

    return result;
  }

  /**
   * Sanitizes input by removing/escaping dangerous characters
   */
  private static sanitizeInput(input: string): string {
    return input
      .trim()
      // Remove null bytes
      .replace(/\0/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }
}

/**
 * React hook for input validation with healthcare security
 * 
 * @param rules - Validation rules array
 * @param context - Context for logging and debugging
 * @returns Validation function and utilities
 * 
 * @example
 * ```typescript
 * const { validate, isValidating, errors } = useSecureValidation([
 *   { type: 'required' },
 *   { type: 'email' },
 *   { type: 'maxLength', value: 255 }
 * ], 'userRegistration');
 * 
 * const handleInputChange = (value: string) => {
 *   const result = validate(value);
 *   if (result.isValid) {
 *     // Process valid input
 *   }
 * };
 * ```
 */
export function useSecureValidation(rules: ValidationRule[], context?: string) {
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const validate = useCallback((input: string) => {
    setIsValidating(true);
    
    try {
      const result = SecureInputValidator.validate(input, rules, context);
      setErrors(result.errors);
      setWarnings(result.warnings);
      
      return result;
    } catch (error) {
      logger.error('Validation error', error instanceof Error ? error : new Error(String(error)), {
        component: 'useSecureValidation',
        metadata: { context }
      });
      
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings: [],
        sanitizedValue: input
      };
    } finally {
      setIsValidating(false);
    }
  }, [rules, context]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setWarnings([]);
  }, []);

  return {
    validate,
    isValidating,
    errors,
    warnings,
    clearErrors
  };
}

// React import for the hook
import { useState, useCallback } from 'react';