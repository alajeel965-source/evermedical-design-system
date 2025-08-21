/**
 * @deprecated This hook has been consolidated into useAuth.
 * Please import { useAuth } from '@/hooks' instead.
 * 
 * This file will be removed in a future version.
 */
import { useAuth } from './auth/useAuth';

console.warn(
  'useSecureAuth is deprecated. Please use the unified useAuth hook from @/hooks instead.'
);

export const useSecureAuth = useAuth;
export default useSecureAuth;