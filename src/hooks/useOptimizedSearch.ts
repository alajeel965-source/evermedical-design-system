/**
 * Optimized search hook with caching, debouncing, and error handling
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Events, Analytics } from '@/lib/api';

interface SearchFilters {
  specialty?: string;
  country?: string;
  city?: string;
  format?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  isFree?: boolean;
  hasCME?: boolean;
  targetAudience?: string;
  language?: 'en' | 'ar';
}

interface SearchResult {
  events: any[];
  totalCount: number;
  page: number;
  hasMore: boolean;
  facets?: Record<string, any>;
}

interface UseOptimizedSearchReturn {
  results: SearchResult | null;
  loading: boolean;
  error: string | null;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  isDebouncing: boolean;
}

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: SearchResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from search parameters
 */
function generateCacheKey(query: string, filters?: SearchFilters, page: number = 1): string {
  return JSON.stringify({ query, filters, page });
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Optimized search hook with caching and performance optimizations
 */
export function useOptimizedSearch(): UseOptimizedSearchReturn {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>();
  const [currentPage, setCurrentPage] = useState(1);

  // Error handling
  const handleError = useCallback((error: Error | string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setError(errorMessage);
    console.error('Search Error:', errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setCurrentPage(1);
    clearError();
  }, [clearError]);

  // Validate search parameters
  const validateSearchParams = useCallback((query: string, filters?: SearchFilters): boolean => {
    if (!query && !filters) {
      handleError('Search query or filters are required');
      return false;
    }

    if (query && query.length < 2) {
      handleError('Search query must be at least 2 characters');
      return false;
    }

    return true;
  }, [handleError]);

  // Perform search with caching
  const performSearch = useCallback(async (
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    appendResults: boolean = false
  ): Promise<void> => {
    try {
      if (!validateSearchParams(query, filters)) {
        return;
      }

      setLoading(true);
      clearError();

      // Check cache first
      const cacheKey = generateCacheKey(query, filters, page);
      const cached = searchCache.get(cacheKey);
      
      if (cached && isCacheValid(cached.timestamp)) {
        if (appendResults && results) {
          setResults({
            ...cached.data,
            events: [...results.events, ...cached.data.events],
          });
        } else {
          setResults(cached.data);
        }
        setLoading(false);
        return;
      }

      // Perform API search
      const searchParams = {
        ...filters,
        page,
        limit: 20,
      };

      const result = await Events.searchEvents(query, searchParams);
      
      if (!result.success) {
        handleError(result.error || 'Search failed');
        return;
      }

      const searchResult: SearchResult = {
        events: result.data?.events || [],
        totalCount: result.data?.totalCount || 0,
        page,
        hasMore: (result.data?.events?.length || 0) >= 20,
        facets: result.data?.facets,
      };

      // Cache the result
      searchCache.set(cacheKey, {
        data: searchResult,
        timestamp: Date.now(),
      });

      // Update results
      if (appendResults && results) {
        setResults({
          ...searchResult,
          events: [...results.events, ...searchResult.events],
        });
      } else {
        setResults(searchResult);
      }

      // Track search
      await Analytics.trackEvent('search_performed', {
        query,
        filters,
        resultsCount: searchResult.totalCount,
        page,
      });

    } catch (error) {
      handleError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [validateSearchParams, clearError, handleError, results]);

  // Debounced search function
  const search = useCallback(async (query: string, filters?: SearchFilters): Promise<void> => {
    setCurrentQuery(query);
    setCurrentFilters(filters);
    setCurrentPage(1);
    setIsDebouncing(true);

    // Clear debouncing state after delay
    setTimeout(() => setIsDebouncing(false), 300);

    await performSearch(query, filters, 1, false);
  }, [performSearch]);

  // Load more results (pagination)
  const loadMore = useCallback(async (): Promise<void> => {
    if (!results?.hasMore || loading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await performSearch(currentQuery, currentFilters, nextPage, true);
  }, [results?.hasMore, loading, currentPage, currentQuery, currentFilters, performSearch]);

  // Clean up cache periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of searchCache.entries()) {
        if (!isCacheValid(value.timestamp)) {
          searchCache.delete(key);
        }
      }
    }, CACHE_DURATION);

    return () => clearInterval(cleanup);
  }, []);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    results,
    loading,
    error,
    search,
    loadMore,
    clearResults,
    clearError,
    isDebouncing,
  }), [
    results,
    loading,
    error,
    search,
    loadMore,
    clearResults,
    clearError,
    isDebouncing,
  ]);
}