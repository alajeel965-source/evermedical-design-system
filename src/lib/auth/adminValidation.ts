/**
 * Admin Authentication Validation Utilities
 * 
 * Provides validation functions and rate limiting for admin operations
 */

interface PasswordStrength {
  score: number;
  isValid: boolean;
  feedback: string[];
}

export const validateAdminPassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 12) {
    score += 1;
  } else {
    feedback.push('Password must be at least 12 characters long');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }

  // Special character check
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain lowercase letters');
  }

  return {
    score,
    isValid: score >= 3, // Minimum 3 requirements met
    feedback
  };
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3 || username.length > 32) {
    return { isValid: false, error: 'Username must be 3-32 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  // Check for consecutive underscores
  if (username.includes('__')) {
    return { isValid: false, error: 'Username cannot contain consecutive underscores' };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

// Simple rate limiting for bootstrap attempts
class SimpleRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts = 3;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= this.maxAttempts) {
      return false;
    }

    // Increment count
    record.count += 1;
    record.lastAttempt = now;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || record.count < this.maxAttempts) {
      return 0;
    }

    const elapsed = Date.now() - record.lastAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }
}

export const bootstrapRateLimiter = new SimpleRateLimiter();