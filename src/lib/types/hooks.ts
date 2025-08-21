/**
 * Enhanced Hook Return Types
 * Provides strict typing for all custom hook returns
 */

import type { 
  SearchParameters, 
  EventSearchResult, 
  SupabaseResponse,
  FormFieldValue 
} from './api';

// Re-export commonly used types
export type { FormFieldValue };

/**
 * Enhanced search hook return type
 */
export interface UseSearchReturn<T> {
  results: T[];
  loading: boolean;
  error: string | null;
  isDebouncing: boolean;
  search: (query: string, filters?: SearchParameters) => void;
  loadMore: () => void;
  clearResults: () => void;
  clearError: () => void;
  hasMore: boolean;
  totalResults: number;
}

/**
 * Form hook return type with strict typing
 */
export interface UseFormReturn<T extends Record<string, FormFieldValue>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: FormFieldValue) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>;
  resetForm: () => void;
  validateForm: () => boolean;
  isValid: boolean;
}

/**
 * Async operation hook return type
 */
export interface UseAsyncReturn<T, E = string> {
  data: T | undefined;
  error: E | undefined;
  loading: boolean;
  retry: () => void;
}

/**
 * Local storage hook return type
 */
export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((val: T) => T)) => void,
  () => void
];

/**
 * API hook return type with Supabase response structure
 */
export interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<SupabaseResponse<T>>;
}

/**
 * Debounced value hook return type
 */
export type UseDebounceReturn<T> = T;

/**
 * Clipboard hook return type
 */
export interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

/**
 * Focus trap hook return type
 */
export type UseFocusTrapReturn<T extends HTMLElement> = [
  React.RefObject<T>,
  boolean,
  (enabled: boolean) => void
];

/**
 * Intersection observer hook return type
 */
export type UseIntersectionObserverReturn = [
  React.RefObject<Element>,
  boolean
];

/**
 * Breakpoint hook return type
 */
export type UseBreakpointReturn = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Online status hook return type
 */
export type UseOnlineStatusReturn = boolean;

/**
 * Previous value hook return type
 */
export type UsePreviousReturn<T> = T | undefined;