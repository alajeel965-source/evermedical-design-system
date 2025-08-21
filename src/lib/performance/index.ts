/**
 * Performance Utilities - Extracted from utils.ts for better modularity
 * 
 * Provides performance measurement, monitoring, and optimization utilities
 * with structured logging integration.
 * 
 * @fileoverview Performance measurement and monitoring utilities
 * @version 1.0.0
 */

import { logger } from '../logger';

/**
 * Performance measurement utility with structured logging
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
 * Async performance wrapper that automatically measures execution time
 * 
 * @param name - Operation name for logging
 * @param operation - Async function to measure
 * @returns Promise with the operation result
 */
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const endTimer = measurePerformance(name);
  try {
    const result = await operation();
    return result;
  } finally {
    endTimer();
  }
}

/**
 * Performance budget checker for monitoring slow operations
 * 
 * @param name - Operation name
 * @param budgetMs - Performance budget in milliseconds
 * @param actualMs - Actual duration
 */
export function checkPerformanceBudget(
  name: string,
  budgetMs: number,
  actualMs: number
): void {
  if (actualMs > budgetMs) {
    logger.warn(`Performance budget exceeded for ${name}`, {
      component: name,
      metadata: { budget: budgetMs, actual: actualMs, excess: actualMs - budgetMs }
    });
  }
}

/**
 * Memory usage tracker for components
 * 
 * @param componentName - Name of the component
 * @returns Current memory usage in MB
 */
export function trackMemoryUsage(componentName: string): number {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
    const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1048576);
    
    if (usedMB > 100) { // Warn if over 100MB
      logger.warn(`High memory usage in ${componentName}`, {
        component: componentName,
        metadata: { usedMB, limitMB }
      });
    }
    
    return usedMB;
  }
  return 0;
}

/**
 * Debounced performance tracker for frequent operations
 */
let performanceQueue: Array<{ name: string; duration: number }> = [];
let flushTimeout: NodeJS.Timeout | null = null;

export function queuePerformanceMetric(name: string, duration: number): void {
  performanceQueue.push({ name, duration });
  
  if (flushTimeout) clearTimeout(flushTimeout);
  
  flushTimeout = setTimeout(() => {
    if (performanceQueue.length > 0) {
      logger.perf('batched_metrics', performanceQueue.length);
      performanceQueue = [];
    }
    flushTimeout = null;
  }, 1000); // Flush every second
}