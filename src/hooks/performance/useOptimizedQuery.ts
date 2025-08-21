/**
 * Optimized React Query Hook for Healthcare Applications
 * 
 * Provides performance-optimized data fetching with healthcare-specific
 * caching strategies, error handling, and compliance features.
 * 
 * @fileoverview Enhanced React Query hook with medical data optimization
 * @version 1.0.0
 * @since 2024-01-01
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { logger } from '@/lib/logger';
import { PerformanceOptimizer } from '@/lib/performance/optimization';

/**
 * Cache configuration for different data types
 */
export interface CacheConfig {
  /** Cache time in milliseconds */
  cacheTime?: number;
  /** Stale time in milliseconds */
  staleTime?: number;
  /** Refetch on window focus */
  refetchOnWindowFocus?: boolean;
  /** Refetch on reconnect */
  refetchOnReconnect?: boolean;
  /** Enable background updates */
  refetchInBackground?: boolean;
  /** Retry configuration */
  retry?: number | false;
  /** Retry delay function */
  retryDelay?: (attemptIndex: number) => number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Enable performance tracking */
  trackPerformance?: boolean;
  /** Query performance threshold in ms */
  performanceThreshold?: number;
  /** Track cache hit/miss ratio */
  trackCacheMetrics?: boolean;
  /** Enable detailed logging */
  enableDetailedLogging?: boolean;
}

/**
 * Healthcare-specific cache configurations
 */
export const HealthcareCacheConfigs = {
  /** Patient data - strict freshness requirements */
  patientData: {
    cacheTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  } as CacheConfig,

  /** Medical events - moderate freshness */
  medicalEvents: {
    cacheTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2
  } as CacheConfig,

  /** Static reference data - long cache */
  referenceData: {
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  } as CacheConfig,

  /** User profiles - balanced approach */
  userProfiles: {
    cacheTime: 15 * 60 * 1000, // 15 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2
  } as CacheConfig,

  /** Real-time data - minimal caching */
  realTimeData: {
    cacheTime: 30 * 1000, // 30 seconds
    staleTime: 5 * 1000, // 5 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInBackground: true,
    retry: 5,
    retryDelay: (attemptIndex: number) => 500 * attemptIndex
  } as CacheConfig
};

/**
 * Query performance metrics
 */
interface QueryMetrics {
  queryKey: string;
  duration: number;
  cacheHit: boolean;
  dataSize?: number;
  error?: string;
  retryCount?: number;
}

/**
 * Enhanced query hook with healthcare optimization
 * 
 * @param queryKey - Query key for caching
 * @param queryFn - Query function
 * @param cacheConfig - Cache configuration preset or custom config
 * @param performanceConfig - Performance monitoring configuration
 * @param options - Additional React Query options
 * @returns Enhanced query result with performance metrics
 * 
 * @example
 * ```typescript
 * const { data, error, isLoading, metrics } = useOptimizedQuery(
 *   ['patient', patientId],
 *   () => fetchPatient(patientId),
 *   'patientData',
 *   { trackPerformance: true, performanceThreshold: 1000 }
 * );
 * ```
 */
export function useOptimizedQuery<TData = unknown, TError = unknown>(
  queryKey: (string | number)[],
  queryFn: () => Promise<TData>,
  cacheConfig: keyof typeof HealthcareCacheConfigs | CacheConfig = 'medicalEvents',
  performanceConfig: PerformanceConfig = {},
  options: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> = {}
) {
  const queryClient = useQueryClient();
  const queryStartTime = useRef<number>(0);
  const metricsRef = useRef<QueryMetrics | null>(null);

  // Resolve cache configuration
  const resolvedCacheConfig = useMemo(() => {
    return typeof cacheConfig === 'string' 
      ? HealthcareCacheConfigs[cacheConfig]
      : cacheConfig;
  }, [cacheConfig]);

  // Performance configuration with defaults
  const resolvedPerformanceConfig = useMemo(() => ({
    trackPerformance: true,
    performanceThreshold: 1000,
    trackCacheMetrics: true,
    enableDetailedLogging: process.env.NODE_ENV === 'development',
    ...performanceConfig
  }), [performanceConfig]);

  // Track query start time
  const trackQueryStart = useCallback(() => {
    if (resolvedPerformanceConfig.trackPerformance) {
      queryStartTime.current = performance.now();
    }
  }, [resolvedPerformanceConfig.trackPerformance]);

  // Track query completion and metrics
  const trackQueryComplete = useCallback((
    isSuccess: boolean, 
    data?: TData, 
    error?: TError,
    isCacheHit?: boolean
  ) => {
    if (!resolvedPerformanceConfig.trackPerformance || queryStartTime.current === 0) {
      return;
    }

    const duration = performance.now() - queryStartTime.current;
    const queryKeyString = queryKey.join(':');

    // Create metrics object
    metricsRef.current = {
      queryKey: queryKeyString,
      duration,
      cacheHit: isCacheHit || false,
      dataSize: data ? JSON.stringify(data).length : undefined,
      error: error ? String(error) : undefined
    };

    // Log performance metrics
    if (resolvedPerformanceConfig.enableDetailedLogging) {
      logger.info('Query performance tracked', {
        component: 'useOptimizedQuery',
        metadata: metricsRef.current
      });
    }

    // Check performance threshold
    if (duration > resolvedPerformanceConfig.performanceThreshold!) {
      logger.warn('Slow query detected', {
        component: 'useOptimizedQuery',
        metadata: {
          ...metricsRef.current,
          threshold: resolvedPerformanceConfig.performanceThreshold
        }
      });
    }

    // Track with global performance optimizer
    PerformanceOptimizer.trackComponentRender(
      `Query:${queryKeyString}`, 
      duration,
      ['queryKey', 'duration', 'cacheHit']
    );

    queryStartTime.current = 0;
  }, [
    resolvedPerformanceConfig.trackPerformance,
    resolvedPerformanceConfig.performanceThreshold,
    resolvedPerformanceConfig.enableDetailedLogging,
    queryKey
  ]);

  // Enhanced query function with performance tracking
  const enhancedQueryFn = useCallback(async () => {
    trackQueryStart();
    
    try {
      const result = await queryFn();
      trackQueryComplete(true, result, undefined, false);
      return result;
    } catch (error) {
      trackQueryComplete(false, undefined, error as TError, false);
      throw error;
    }
  }, [queryFn, trackQueryStart, trackQueryComplete]);

  // Check if data is in cache (for cache hit tracking)
  const checkCacheHit = useCallback(() => {
    const cachedData = queryClient.getQueryData(queryKey);
    return cachedData !== undefined;
  }, [queryClient, queryKey]);

  // Execute query with enhanced configuration
  const queryResult = useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    ...resolvedCacheConfig,
    ...options
  });

  // Handle success/error in useEffect instead of deprecated callbacks
  useEffect(() => {
    if (queryResult.isSuccess && queryResult.data) {
      const wasCacheHit = checkCacheHit();
      if (wasCacheHit && metricsRef.current) {
        metricsRef.current.cacheHit = true;
      }
    }
    
    if (queryResult.isError && queryResult.error) {
      logger.error('Query failed', queryResult.error instanceof Error ? queryResult.error : new Error(String(queryResult.error)), {
        component: 'useOptimizedQuery',
        metadata: {
          queryKey: queryKey.join(':'),
          cacheConfig: typeof cacheConfig === 'string' ? cacheConfig : 'custom'
        }
      });
    }
  }, [queryResult.isSuccess, queryResult.isError, queryResult.data, queryResult.error, checkCacheHit]);

  // Cache metrics tracking
  useEffect(() => {
    if (!resolvedPerformanceConfig.trackCacheMetrics) return;

    const queryKeyString = queryKey.join(':');
    const cacheData = queryClient.getQueryData(queryKey);
    const cacheState = queryClient.getQueryState(queryKey);

    if (cacheState && resolvedPerformanceConfig.enableDetailedLogging) {
      logger.debug('Cache state tracked', {
        component: 'useOptimizedQuery',
        metadata: {
          queryKey: queryKeyString,
          dataUpdatedAt: cacheState.dataUpdatedAt,
          fetchStatus: cacheState.fetchStatus,
          hasData: cacheData !== undefined
        }
      });
    }
  }, [queryKey, queryClient, resolvedPerformanceConfig.trackCacheMetrics, resolvedPerformanceConfig.enableDetailedLogging]);

  // Return enhanced query result with metrics
  return useMemo(() => ({
    ...queryResult,
    metrics: metricsRef.current,
    cacheConfig: resolvedCacheConfig,
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey }),
    refetchQuery: () => queryClient.refetchQueries({ queryKey }),
    prefetchQuery: (prefetchFn?: () => Promise<TData>) => 
      queryClient.prefetchQuery({
        queryKey,
        queryFn: prefetchFn || queryFn,
        ...resolvedCacheConfig
      })
  }), [queryResult, resolvedCacheConfig, queryClient, queryKey, queryFn]);
}

/**
 * Optimized mutation hook with performance tracking
 * 
 * @param mutationFn - Mutation function
 * @param performanceConfig - Performance monitoring configuration
 * @param options - React Query mutation options
 * @returns Enhanced mutation result
 * 
 * @example
 * ```typescript
 * const createPatient = useOptimizedMutation(
 *   (patientData) => api.createPatient(patientData),
 *   { trackPerformance: true },
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries(['patients']);
 *     }
 *   }
 * );
 * ```
 */
export function useOptimizedMutation<TData = unknown, TError = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  performanceConfig: PerformanceConfig = {},
  options: UseMutationOptions<TData, TError, TVariables> = {}
) {
  const mutationStartTime = useRef<number>(0);
  const metricsRef = useRef<QueryMetrics | null>(null);

  const resolvedPerformanceConfig = useMemo(() => ({
    trackPerformance: true,
    performanceThreshold: 2000, // Higher threshold for mutations
    enableDetailedLogging: process.env.NODE_ENV === 'development',
    ...performanceConfig
  }), [performanceConfig]);

  // Enhanced mutation function with performance tracking
  const enhancedMutationFn = useCallback(async (variables: TVariables) => {
    if (resolvedPerformanceConfig.trackPerformance) {
      mutationStartTime.current = performance.now();
    }

    try {
      const result = await mutationFn(variables);
      
      if (resolvedPerformanceConfig.trackPerformance && mutationStartTime.current > 0) {
        const duration = performance.now() - mutationStartTime.current;
        
        metricsRef.current = {
          queryKey: 'mutation',
          duration,
          cacheHit: false,
          dataSize: result ? JSON.stringify(result).length : undefined
        };

        if (duration > resolvedPerformanceConfig.performanceThreshold!) {
          logger.warn('Slow mutation detected', {
            component: 'useOptimizedMutation',
            metadata: {
              duration,
              threshold: resolvedPerformanceConfig.performanceThreshold
            }
          });
        }
      }
      
      return result;
    } catch (error) {
      if (resolvedPerformanceConfig.trackPerformance && mutationStartTime.current > 0) {
        const duration = performance.now() - mutationStartTime.current;
        
        metricsRef.current = {
          queryKey: 'mutation',
          duration,
          cacheHit: false,
          error: String(error)
        };
      }
      
      logger.error('Mutation failed', error instanceof Error ? error : new Error(String(error)), {
        component: 'useOptimizedMutation'
      });
      
      throw error;
    }
  }, [mutationFn, resolvedPerformanceConfig]);

  const mutationResult = useMutation({
    mutationFn: enhancedMutationFn,
    ...options
  });

  return useMemo(() => ({
    ...mutationResult,
    metrics: metricsRef.current
  }), [mutationResult]);
}

/**
 * Hook for batch query operations with optimized performance
 * 
 * @param queries - Array of query configurations
 * @param cacheConfig - Cache configuration for all queries
 * @returns Array of query results with combined metrics
 * 
 * @example
 * ```typescript
 * const results = useBatchOptimizedQueries([
 *   { key: ['patient', patientId], fn: () => fetchPatient(patientId) },
 *   { key: ['events', patientId], fn: () => fetchPatientEvents(patientId) }
 * ], 'patientData');
 * ```
 */
export function useBatchOptimizedQueries<TData = unknown>(
  queries: Array<{
    key: (string | number)[];
    fn: () => Promise<TData>;
    options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;
  }>,
  cacheConfig: keyof typeof HealthcareCacheConfigs | CacheConfig = 'medicalEvents'
) {
  const results = queries.map(({ key, fn, options }) => 
    useOptimizedQuery(key, fn, cacheConfig, { trackPerformance: true }, options)
  );

  // Combined loading state
  const isLoading = results.some(result => result.isLoading);
  
  // Combined error state
  const hasError = results.some(result => result.error);
  const errors = results.map(result => result.error).filter(Boolean);

  // Combined metrics
  const combinedMetrics = useMemo(() => {
    const metrics = results.map(result => result.metrics).filter(Boolean);
    
    if (metrics.length === 0) return null;

    return {
      totalQueries: metrics.length,
      totalDuration: metrics.reduce((sum, metric) => sum + metric.duration, 0),
      averageDuration: metrics.reduce((sum, metric) => sum + metric.duration, 0) / metrics.length,
      cacheHitRate: metrics.filter(metric => metric.cacheHit).length / metrics.length,
      slowQueries: metrics.filter(metric => metric.duration > 1000).length
    };
  }, [results]);

  return {
    results,
    isLoading,
    hasError,
    errors,
    combinedMetrics,
    refetchAll: () => Promise.all(results.map(result => result.refetch())),
    invalidateAll: () => results.forEach(result => result.invalidateQuery())
  };
}