/**
 * Performance Optimization Utilities for EverMedical Platform
 * 
 * Provides comprehensive performance monitoring, optimization utilities,
 * and React-specific performance helpers for healthcare applications.
 * 
 * @fileoverview Performance optimization and monitoring tools
 * @version 1.0.0
 * @since 2024-01-01
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  /** Time to first byte */
  ttfb: number;
  /** First contentful paint */
  fcp: number;
  /** Largest contentful paint */
  lcp: number;
  /** First input delay */
  fid: number;
  /** Cumulative layout shift */
  cls: number;
  /** Total blocking time */
  tbt: number;
  /** Time to interactive */
  tti: number;
}

/**
 * Component performance data
 */
export interface ComponentPerformanceData {
  /** Component name */
  name: string;
  /** Render time in milliseconds */
  renderTime: number;
  /** Number of renders */
  renderCount: number;
  /** Props that cause re-renders */
  propsChanges: Record<string, number>;
  /** Memory usage estimate */
  memoryUsage?: number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Enable performance tracking */
  enabled: boolean;
  /** Sample rate (0-1) */
  sampleRate: number;
  /** Track component performance */
  trackComponents: boolean;
  /** Track user interactions */
  trackInteractions: boolean;
  /** Performance budget thresholds */
  budgets: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

/**
 * Default performance configuration
 */
const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 0.1, // 10% sampling in production
  trackComponents: true,
  trackInteractions: true,
  budgets: {
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1   // 0.1 cumulative layout shift
  }
};

/**
 * Performance monitoring and optimization utilities
 */
export class PerformanceOptimizer {
  private static config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG;
  private static observers: Map<string, PerformanceObserver> = new Map();
  private static metrics: PerformanceMetrics = {} as PerformanceMetrics;

  /**
   * Initialize performance monitoring
   * 
   * @param config - Performance configuration
   * 
   * @example
   * ```typescript
   * PerformanceOptimizer.initialize({
   *   enabled: true,
   *   sampleRate: 0.2,
   *   trackComponents: true,
   *   trackInteractions: true,
   *   budgets: { lcp: 2000, fid: 50, cls: 0.05 }
   * });
   * ```
   */
  static initialize(config?: Partial<PerformanceConfig>) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
    
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    this.initializeWebVitalsObserver();
    this.initializeNavigationObserver();
    this.initializeResourceObserver();
    
    logger.info('Performance monitoring initialized', {
      component: 'PerformanceOptimizer',
      metadata: { config: this.config }
    });
  }

  /**
   * Track component render performance
   */
  static trackComponentRender(componentName: string, renderTime: number, propsChanged?: string[]) {
    if (!this.config.enabled) return;

    logger.info('Component render tracked', {
      component: 'PerformanceOptimizer',
      metadata: {
        componentName,
        renderTime,
        propsChanged: propsChanged || []
      }
    });

    // Check if render time exceeds threshold
    if (renderTime > 16) { // 60fps = ~16ms per frame
      logger.warn('Slow component render detected', {
        component: 'PerformanceOptimizer',
        metadata: {
          componentName,
          renderTime,
          threshold: 16
        }
      });
    }
  }

  /**
   * Initialize Web Vitals observer
   */
  private static initializeWebVitalsObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number };
        
        this.metrics.lcp = lastEntry.renderTime || lastEntry.startTime;
        this.checkPerformanceBudget('lcp', this.metrics.lcp);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & { processingStart: number };
          this.metrics.fid = fidEntry.processingStart - entry.startTime;
          this.checkPerformanceBudget('fid', this.metrics.fid);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        });
        
        this.metrics.cls = clsValue;
        this.checkPerformanceBudget('cls', this.metrics.cls);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', clsObserver);

    } catch (error) {
      logger.error('Failed to initialize Web Vitals observer', error instanceof Error ? error : new Error(String(error)), {
        component: 'PerformanceOptimizer'
      });
    }
  }

  /**
   * Initialize navigation observer
   */
  private static initializeNavigationObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          
          this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
          this.metrics.tti = navEntry.loadEventEnd - navEntry.fetchStart;
          
          logger.info('Navigation performance measured', {
            component: 'PerformanceOptimizer',
            metadata: {
              ttfb: this.metrics.ttfb,
              tti: this.metrics.tti,
              domComplete: navEntry.domComplete - navEntry.fetchStart
            }
          });
        });
      });
      navigationObserver.observe({ type: 'navigation', buffered: true });
      this.observers.set('navigation', navigationObserver);
    } catch (error) {
      logger.error('Failed to initialize navigation observer', error instanceof Error ? error : new Error(String(error)), {
        component: 'PerformanceOptimizer'
      });
    }
  }

  /**
   * Initialize resource observer
   */
  private static initializeResourceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.requestStart;
          
          // Log slow resources
          if (loadTime > 1000) { // 1 second threshold
            logger.warn('Slow resource detected', {
              component: 'PerformanceOptimizer',
              metadata: {
                name: entry.name,
                loadTime,
                size: resourceEntry.transferSize,
                type: resourceEntry.initiatorType
              }
            });
          }
        });
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      logger.error('Failed to initialize resource observer', error instanceof Error ? error : new Error(String(error)), {
        component: 'PerformanceOptimizer'
      });
    }
  }

  /**
   * Check performance against budgets
   */
  private static checkPerformanceBudget(metric: keyof PerformanceConfig['budgets'], value: number) {
    const budget = this.config.budgets[metric];
    
    if (value > budget) {
      logger.warn('Performance budget exceeded', {
        component: 'PerformanceOptimizer',
        metadata: {
          metric,
          value,
          budget,
          exceedBy: value - budget
        }
      });
    }
  }

  /**
   * Get current performance metrics
   */
  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Cleanup observers
   */
  static cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

/**
 * React hook for component performance tracking
 * 
 * @param componentName - Name of the component to track
 * @returns Performance utilities
 * 
 * @example
 * ```typescript
 * function MyComponent({ data, filters }) {
 *   const { startRender, endRender, renderTime } = useComponentPerformance('MyComponent');
 *   
 *   useEffect(() => {
 *     startRender();
 *     // Component rendering logic
 *     endRender();
 *   }, [data, filters]);
 *   
 *   return <div>Render time: {renderTime}ms</div>;
 * }
 * ```
 */
export function useComponentPerformance(componentName: string) {
  const renderStartRef = useRef<number>(0);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartRef.current > 0) {
      const duration = performance.now() - renderStartRef.current;
      setRenderTime(duration);
      setRenderCount(prev => prev + 1);
      
      PerformanceOptimizer.trackComponentRender(componentName, duration);
      renderStartRef.current = 0;
    }
  }, [componentName]);

  return {
    startRender,
    endRender,
    renderTime,
    renderCount
  };
}

/**
 * React hook for debounced performance tracking
 * 
 * @param value - Value to track changes for
 * @param delay - Debounce delay in milliseconds
 * @param trackingId - Unique identifier for tracking
 * @returns Debounced value and change metrics
 * 
 * @example
 * ```typescript
 * const { debouncedValue, changeCount } = usePerformanceDebounce(
 *   searchQuery, 
 *   300, 
 *   'searchInput'
 * );
 * ```
 */
export function usePerformanceDebounce<T>(
  value: T, 
  delay: number, 
  trackingId: string
) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [changeCount, setChangeCount] = useState<number>(0);
  const lastChangeRef = useRef<number>(0);

  useEffect(() => {
    const now = performance.now();
    const timeSinceLastChange = now - lastChangeRef.current;
    
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setChangeCount(prev => prev + 1);
      
      // Track performance metrics
      logger.debug('Debounced value updated', {
        component: 'usePerformanceDebounce',
        metadata: {
          trackingId,
          delay,
          timeSinceLastChange,
          changeCount: changeCount + 1
        }
      });
    }, delay);

    lastChangeRef.current = now;
    return () => clearTimeout(handler);
  }, [value, delay, trackingId, changeCount]);

  return { debouncedValue, changeCount };
}

/**
 * React hook for memory usage tracking
 * 
 * @param componentName - Component name for tracking
 * @returns Memory usage information
 * 
 * @example
 * ```typescript
 * const memoryInfo = useMemoryTracker('LargeDataTable');
 * 
 * if (memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
 *   console.warn('High memory usage detected');
 * }
 * ```
 */
export function useMemoryTracker(componentName: string) {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const updateMemoryInfo = () => {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
        
        // Log high memory usage
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB threshold
          logger.warn('High memory usage detected', {
            component: 'useMemoryTracker',
            metadata: {
              componentName,
              usedHeapMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
              totalHeapMB: Math.round(memory.totalJSHeapSize / 1024 / 1024)
            }
          });
        }
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [componentName]);

  return memoryInfo;
}

/**
 * Memoization utility with performance tracking
 * 
 * @param factory - Factory function to create the value
 * @param deps - Dependencies array
 * @param debugName - Debug name for performance tracking
 * @returns Memoized value
 * 
 * @example
 * ```typescript
 * const expensiveValue = usePerformanceMemo(
 *   () => processLargeDataset(data),
 *   [data],
 *   'processLargeDataset'
 * );
 * ```
 */
export function usePerformanceMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName: string
): T {
  const computationTimeRef = useRef<number>(0);

  return useMemo(() => {
    const startTime = performance.now();
    const result = factory();
    const endTime = performance.now();
    
    computationTimeRef.current = endTime - startTime;
    
    // Track long computations
    if (computationTimeRef.current > 10) { // 10ms threshold
      logger.warn('Long memoization computation', {
        component: 'usePerformanceMemo',
        metadata: {
          debugName,
          computationTime: computationTimeRef.current,
          threshold: 10
        }
      });
    }
    
    return result;
  }, deps);
}

// Initialize performance monitoring on module load
if (typeof window !== 'undefined') {
  PerformanceOptimizer.initialize();
}