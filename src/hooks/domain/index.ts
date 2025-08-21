/**
 * Domain-specific hooks for EverMedical application
 * Business logic hooks for events, profiles, RFQs, etc.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '../common';
import { SecureProfile, SecureEvents } from '@/lib/secureApi';
import { Analytics } from '@/lib/api';

/**
 * Hook for managing saved/bookmarked items with optimistic updates
 */
export function useSavedItems(itemType: 'events' | 'rfqs' | 'profiles') {
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load saved items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`saved_${itemType}`);
    if (saved) {
      try {
        const items = JSON.parse(saved);
        setSavedItems(new Set(items));
      } catch (error) {
        console.warn(`Failed to parse saved ${itemType}:`, error);
      }
    }
  }, [itemType]);

  const toggleSaved = useCallback(async (itemId: string) => {
    const wasAlreadySaved = savedItems.has(itemId);
    
    // Optimistic update
    setSavedItems(prev => {
      const next = new Set(prev);
      if (wasAlreadySaved) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      
      // Persist to localStorage
      localStorage.setItem(`saved_${itemType}`, JSON.stringify([...next]));
      
      return next;
    });

    // Track the action
    Analytics.trackEvent(`${itemType}_${wasAlreadySaved ? 'unsaved' : 'saved'}`, {
      itemId,
      itemType,
      timestamp: new Date().toISOString(),
    });

    // TODO: Sync with backend when API is available
    try {
      setLoading(true);
      // await api.toggleSavedItem(itemType, itemId, !wasAlreadySaved);
    } catch (error) {
      // Revert optimistic update on failure
      setSavedItems(prev => {
        const next = new Set(prev);
        if (wasAlreadySaved) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        
        localStorage.setItem(`saved_${itemType}`, JSON.stringify([...next]));
        return next;
      });
      
      console.error(`Failed to ${wasAlreadySaved ? 'unsave' : 'save'} ${itemType}:`, error);
    } finally {
      setLoading(false);
    }
  }, [savedItems, itemType]);

  const isSaved = useCallback((itemId: string) => savedItems.has(itemId), [savedItems]);

  return {
    savedItems,
    isSaved,
    toggleSaved,
    loading,
    count: savedItems.size
  };
}

/**
 * Hook for event interactions (views, saves, shares, etc.)
 */
export function useEventInteractions() {
  const [loading, setLoading] = useState(false);

  const trackInteraction = useCallback(async (
    eventId: string,
    type: 'view' | 'save' | 'share' | 'click' | 'register',
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      
      const response = await SecureEvents.trackEventInteraction(eventId, type, metadata);
      
      if (!response.success) {
        console.warn('Failed to track event interaction:', response.error);
      }
      
      // Also track in analytics for redundancy
      Analytics.trackEvent(`event_${type}`, {
        eventId,
        ...metadata,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('Error tracking event interaction:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { trackInteraction, loading };
}

/**
 * Hook for managing user profile data with caching
 */
export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SecureProfile.getProfile(id);
      
      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to fetch profile');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (id: string, updates: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SecureProfile.updateProfile(id, updates);
      
      if (response.success) {
        setProfile(response.data);
        
        Analytics.trackEvent('profile_updated', {
          userId: id,
          fieldsUpdated: Object.keys(updates),
          timestamp: new Date().toISOString(),
        });
        
        return { success: true };
      } else {
        setError(response.error || 'Failed to update profile');
        return { success: false, error: response.error };
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: () => userId && fetchProfile(userId)
  };
}

/**
 * Hook for username availability checking with debouncing
 */
export function useUsernameCheck() {
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [message, setMessage] = useState('');

  const debouncedUsername = useDebounce(username, 500);

  const checkAvailability = useCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setAvailability('idle');
      setMessage('');
      return;
    }

    setAvailability('checking');

    try {
      const response = await SecureProfile.checkUsernameAvailability(usernameToCheck);
      
      if (response.success) {
        const isAvailable = response.data;
        setAvailability(isAvailable ? 'available' : 'taken');
        setMessage(isAvailable ? 'Username is available' : 'Username is already taken');
      } else {
        setAvailability('invalid');
        setMessage(response.error || 'Error checking username');
      }
    } catch (error) {
      setAvailability('invalid');
      setMessage('Error checking username availability');
    }
  }, []);

  useEffect(() => {
    checkAvailability(debouncedUsername);
  }, [debouncedUsername, checkAvailability]);

  return {
    username,
    setUsername,
    availability,
    message,
    isValid: availability === 'available'
  };
}

/**
 * Hook for managing search state and results
 */
export function useSearch<T = any>(
  searchFunction: (query: string, filters?: any) => Promise<{ data: T[]; error?: string }>,
  initialFilters: any = {}
) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string, searchFilters: any) => {
    if (!searchQuery && !Object.keys(searchFilters).length) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await searchFunction(searchQuery, searchFilters);
      
      if (response.error) {
        setError(response.error);
        setResults([]);
      } else {
        setResults(response.data);
      }
      
      setHasSearched(true);
      
      // Track search
      Analytics.trackEvent('search_performed', {
        query: searchQuery,
        filters: searchFilters,
        resultCount: response.data?.length || 0,
        timestamp: new Date().toISOString(),
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchFunction]);

  useEffect(() => {
    performSearch(debouncedQuery, filters);
  }, [debouncedQuery, filters, performSearch]);

  const updateFilters = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters(initialFilters);
    setResults([]);
    setError(null);
    setHasSearched(false);
  }, [initialFilters]);

  return {
    query,
    setQuery,
    filters,
    updateFilters,
    results,
    loading,
    error,
    hasSearched,
    clearSearch,
    isEmpty: hasSearched && results.length === 0 && !loading
  };
}

/**
 * Hook for managing pagination
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1,
    totalItems: items.length
  };
}