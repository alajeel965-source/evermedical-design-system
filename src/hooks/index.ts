/**
 * Centralized hooks export - Single entry point for all hooks
 * 
 * This barrel export provides a clean interface to all application hooks
 * organized by category for better maintainability
 */

// Authentication hooks
export * from './auth';

// Common/utility hooks
export * from './common';

// Domain-specific hooks
export * from './domain';

// Backward compatibility exports (DEPRECATED - use specific imports)
export { useAuth as useOptimizedAuth } from './auth/useAuth';
export { useAuth as useSecureAuth } from './auth/useAuth';