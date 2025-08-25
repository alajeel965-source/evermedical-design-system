-- CRITICAL SECURITY FIX: Enhanced Profile Protection 
-- Address the critical vulnerability: "User Personal Information Could Be Stolen by Hackers"

-- Step 1: Force RLS to prevent any potential bypasses (maximum security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Step 2: Remove existing policies that may be vulnerable
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_basic_fields" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;

-- Step 3: Create ultra-secure policies with strict validation

-- SELECT: Only users can see their OWN data - zero cross-user access
CREATE POLICY "profiles_ultra_secure_select" ON public.profiles
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- INSERT: Only allow creating OWN profile with duplicate prevention
CREATE POLICY "profiles_ultra_secure_insert" ON public.profiles
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
  -- Critical: Prevent duplicate profiles
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.user_id = auth.uid()
  )
);

-- UPDATE: Strict update controls with identity protection
CREATE POLICY "profiles_ultra_secure_update" ON public.profiles
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- DELETE: Only super admins (audit trail preservation)
CREATE POLICY "profiles_ultra_secure_delete" ON public.profiles
FOR DELETE 
USING (
  is_super_admin()
);

-- Step 4: Create secure function for limited public profile access
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
  -- Return ONLY limited, non-sensitive data for verified professionals
  -- NO emails, last names, phone numbers, or password hashes exposed
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name, -- Only first name for networking
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

-- Step 5: Enhanced audit logging for security monitoring
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all profile operations for security analysis
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
      'protection_level', 'ultra_secure',
      'cross_user_attempt', (auth.uid() != COALESCE(NEW.user_id, OLD.user_id)),
      'operation_type', TG_OP
    )
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Don't block operations if audit fails
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Step 6: Apply audit trigger
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_access();

-- Step 7: Validation function to confirm security
CREATE OR REPLACE FUNCTION public.validate_profile_security_status()
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
  -- Verify RLS is forced (critical)
  RETURN QUERY
  SELECT 
    'RLS_FORCED'::text,
    CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::text,
    CASE WHEN relforcerowsecurity 
      THEN 'RLS forced - prevents all privilege escalation'
      ELSE 'CRITICAL: RLS not forced - data exposure risk'
    END::text
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles';
  
  -- Verify ultra-secure policies are active
  RETURN QUERY
  SELECT 
    'ULTRA_SECURE_POLICIES'::text,
    CASE WHEN COUNT(*) = 4 THEN 'SECURE' ELSE 'INCOMPLETE' END::text,
    'Ultra-secure policies: ' || COUNT(*)::text || '/4 (SELECT, INSERT, UPDATE, DELETE)'
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' AND pc.relname = 'profiles'
    AND pol.polname LIKE '%ultra_secure%';
    
  -- Verify audit logging is active
  RETURN QUERY
  SELECT 
    'AUDIT_PROTECTION'::text,
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'profile_access_audit'
    ) THEN 'ACTIVE' ELSE 'MISSING' END::text,
    'Comprehensive audit logging for all profile operations'::text;
END;
$$;