/**
 * Library Barrel Export - Optimized for Tree Shaking
 * 
 * Central export point for all library utilities organized by domain
 * for better code splitting and tree-shaking optimization.
 * 
 * @fileoverview Optimized library exports for EverMedical platform
 * @version 2.0.0
 */

// Core utilities - most commonly used
export * from './utils';
export * from './logger';
export * from './constants';

// Analytics - modular export for better tree-shaking  
export * from './analytics';

// Performance utilities - separated for specialized usage  
export { measureAsync, checkPerformanceBudget, trackMemoryUsage, queuePerformanceMetric } from './performance';

// Security utilities - isolated for security-focused imports
export * from './security';

// API utilities - main API export
export * from './api';

// Domain-specific utilities
export * from './countries';
export * from './seo';

// Internationalization
export * from './i18n';