/**
 * Authentication exports - Centralized authentication module
 * 
 * This barrel export provides a clean interface to all authentication
 * functionality while maintaining backward compatibility
 */

// Main hook
export { useAuth, type UseAuthReturn, type AuthResult, type ValidationResult } from './useAuth';

// Utilities and types
export { 
  AuthUtils, 
  AuthErrorType, 
  AuthEventType, 
  UserRole, 
  ProfileType 
} from './authUtils';

// Default export for backward compatibility
export { useAuth as default } from './useAuth';