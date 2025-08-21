/**
 * Common React hooks for form handling, data fetching, and UI state
 * Centralized custom hooks to reduce code duplication
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { FormFieldValue, UseFormReturn, UseAsyncReturn } from '@/lib/types/hooks';

/**
 * Enhanced form hook with validation and error handling
 * 
 * Provides a complete form state management solution with built-in validation,
 * error handling, and submission logic. Designed for medical forms requiring
 * strict validation and user experience standards.
 * 
 * @template T - Form values type extending Record<string, FormFieldValue>
 * @param initialValues - Initial form values
 * @param validationSchema - Optional validation function
 * @returns Form state and handlers
 * 
 * @example
 * ```typescript
 * const userForm = useForm<UserProfileData>(
 *   { name: '', email: '', specialty: '' },
 *   (values) => {
 *     const errors: Partial<Record<keyof UserProfileData, string>> = {};
 *     if (!values.name) errors.name = 'Name is required';
 *     if (!values.email?.includes('@')) errors.email = 'Valid email required';
 *     return errors;
 *   }
 * );
 * 
 * // In component
 * const handleSubmit = userForm.handleSubmit(async (values) => {
 *   await saveUserProfile(values);
 * });
 * ```
 */
export function useForm<T extends Record<string, FormFieldValue>>(
  initialValues: T,
  validationSchema?: (values: T) => Record<keyof T, string>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: FormFieldValue) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const validateForm = useCallback(() => {
    if (!validationSchema) return true;
    
    const newErrors = validationSchema(values);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);
    
    try {
      if (validateForm()) {
        await onSubmit(values);
      }
    } catch (error) {
      logger.error('Form submission error', error instanceof Error ? error : new Error(String(error)), {
        component: 'useForm.handleSubmit'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
    validateForm,
    isValid: Object.keys(errors).length === 0
  };
}

/**
 * Debounced value hook for search inputs and API calls
 * 
 * Delays value updates until after the specified delay period has passed
 * without new changes. Essential for optimizing search performance and
 * reducing API calls.
 * 
 * @template T - Type of value to debounce
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 * 
 * @example
 * ```typescript
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 300);
 * 
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     searchEvents(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Local storage hook with type safety and SSR compatibility
 * 
 * Provides persistent state management using localStorage with automatic
 * serialization/deserialization and error handling. Safe for SSR environments.
 * 
 * @template T - Type of stored value
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * ```typescript
 * const [preferences, setPreferences, clearPreferences] = useLocalStorage(
 *   'userPreferences',
 *   { theme: 'light', language: 'en' }
 * );
 * 
 * // Update preferences
 * setPreferences(prev => ({ ...prev, theme: 'dark' }));
 * 
 * // Clear preferences
 * clearPreferences();
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.warn('Error reading localStorage', {
        component: 'useLocalStorage',
        metadata: { key }
      });
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      logger.warn('Error setting localStorage', {
        component: 'useLocalStorage.setValue',
        metadata: { key }
      });
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      logger.warn('Error removing localStorage', {
        component: 'useLocalStorage.removeValue',
        metadata: { key }
      });
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Previous value hook for tracking changes
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Async operation hook with loading, error, and data states
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
): UseAsyncReturn<T, E> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<E | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as E);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return { data, error, loading, retry };
}

/**
 * Page analytics tracking hook
 */
export function usePageTracking() {
  const location = useLocation();
  const previousPath = usePrevious(location.pathname);

  useEffect(() => {
    // Only track if path actually changed
    if (previousPath !== location.pathname) {
      Analytics.trackPageView(location.pathname);
    }
  }, [location.pathname, previousPath]);
}

/**
 * Intersection Observer hook for lazy loading and animations
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<Element>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isVisible];
}

/**
 * Responsive breakpoint hook
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Copy to clipboard hook
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      Analytics.trackEvent('clipboard_copy', { 
        success: true,
        textLength: text.length 
      });
    } catch (error) {
      setCopied(false);
      Analytics.trackEvent('clipboard_copy', { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  return { copied, copy };
}

/**
 * Online status hook
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Document title hook
 */
export function useDocumentTitle(title: string, keepOnUnmount = false) {
  const prevTitle = useRef(document.title);

  useEffect(() => {
    document.title = title;
    
    return () => {
      if (!keepOnUnmount) {
        document.title = prevTitle.current;
      }
    };
  }, [title, keepOnUnmount]);
}

/**
 * Focus trap hook for modals and dialogs
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  boolean,
  (enabled: boolean) => void
] {
  const ref = useRef<T>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  return [ref, enabled, setEnabled];
}