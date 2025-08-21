/**
 * @deprecated This is the old useAuth hook. 
 * The new unified useAuth hook is available at @/hooks/auth/useAuth
 * 
 * This file is kept for backward compatibility but will be removed in a future version.
 * Please migrate to: import { useAuth } from '@/hooks'
 */
import { useAuth as newUseAuth } from './auth/useAuth';

console.warn(
  'You are using the deprecated useAuth hook. Please update your import to: import { useAuth } from "@/hooks"'
);

export const useAuth = newUseAuth;
export default useAuth;