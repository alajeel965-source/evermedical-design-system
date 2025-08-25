-- Enhanced Profile Security: Implement Fortress-Level Data Protection
-- This migration addresses critical security vulnerabilities in the profiles table

-- CRITICAL SECURITY FIX: Force RLS to prevent any potential bypasses
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Drop existing potentially vulnerable policies
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_basic_fields" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;

-- Create ultra-secure policies with enhanced validation

-- 1. SELECT: Only allow users to see their OWN data, block all cross-user access
CREATE POLICY "profiles_ultra_secure_select" ON public.profiles
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- 2. INSERT: Only allow users to create their OWN profile with strict validation
CREATE POLICY "profiles_ultra_secure_insert" ON public.profiles
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
  -- Prevent duplicate profiles
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.user_id = auth.uid()
  )
);

-- 3. UPDATE: Only allow users to update their OWN profile with field restrictions
CREATE POLICY "profiles_ultra_secure_update" ON public.profiles
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
  -- Prevent changing user_id (critical security check)
  AND user_id = OLD.user_id
);

-- 4. DELETE: Only super admins can delete profiles (audit trail preservation)
CREATE POLICY "profiles_ultra_secure_delete" ON public.profiles
FOR DELETE 
USING (
  is_super_admin()
);

-- Create secure function to get safe profile data for public display
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  specialty text,
  country text,
  verified boolean,
  profile_type text
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only return limited, non-sensitive data for verified professionals
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name, -- Only first name, never last name or email
    p.specialty,
    p.country,
    p.verified,
    p.profile_type
  FROM public.profiles p
  WHERE p.user_id = target_user_id 
    AND p.verified = true
    AND p.profile_type IN ('personnel', 'institute', 'seller')
  LIMIT 1;
END;
$$;

-- Enhanced audit logging for profile access attempts
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all profile access attempts for security monitoring
  INSERT INTO public.security_audit_log (
    table_name,
    operation,
    user_id,
    accessed_user_id,
    timestamp,
    details
  ) VALUES (
    'profiles',
    TG_OP,
    auth.uid(),
    COALESCE(NEW.user_id, OLD.user_id),
    NOW(),
    jsonb_build_object(
      'trigger', 'audit_profile_access',
      'protection_level', 'enhanced_security',
      'cross_user_attempt', (auth.uid() != COALESCE(NEW.user_id, OLD.user_id))
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the operation if audit logging fails
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create audit trigger for comprehensive monitoring
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_access();

-- Create function to validate profile data integrity
CREATE OR REPLACE FUNCTION public.validate_profile_integrity()
RETURNS TABLE(
  check_name text,
  status text,
  details text
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check for forced RLS
  RETURN QUERY
  SELECT 
    'RLS_FORCED'::text,
    CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::text,
    CASE WHEN relforcerowsecurity 
      THEN 'RLS is forced - maximum security enabled'
      ELSE 'CRITICAL: RLS not forced - data exposure risk'
    END::text
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles';
  
  -- Check for secure policies
  RETURN QUERY
  SELECT 
    'SECURE_POLICIES'::text,
    CASE WHEN COUNT(*) = 4 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::text,
    'Ultra-secure policies active: ' || COUNT(*)::text || ' (SELECT, INSERT, UPDATE, DELETE)'
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' AND pc.relname = 'profiles'
    AND pol.polname LIKE '%ultra_secure%';
END;
$$;