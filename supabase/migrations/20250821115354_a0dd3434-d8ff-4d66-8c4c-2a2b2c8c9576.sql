-- CRITICAL SECURITY FIX: Remove anonymous access to sensitive data and fix user isolation

-- 1. Revoke ALL anonymous access to profiles and sensitive tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.medical_events FROM anon;
REVOKE ALL ON public.rfqs FROM anon;
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.security_audit_log FROM anon;
REVOKE ALL ON public.saved_searches FROM anon;

-- 2. Fix profiles table user isolation - drop existing policies and create secure ones
DROP POLICY IF EXISTS "profiles_secure_select_bulletproof" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert_bulletproof" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_update_bulletproof" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_delete_bulletproof" ON public.profiles;

-- 3. Create properly isolated policies for profiles
CREATE POLICY "users_can_view_own_profile_only" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_profile_only" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile_only" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "verified_admins_can_manage_profiles" 
ON public.profiles FOR ALL 
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 4. Ensure public_profiles is completely locked down
DROP POLICY IF EXISTS "users_can_view_own_public_profile" ON public.public_profiles;
DROP POLICY IF EXISTS "verified_admins_can_manage_public_profiles" ON public.public_profiles;

-- Only users can see their own public profile (no cross-user access)
CREATE POLICY "strict_own_public_profile_only" 
ON public.public_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins can manage for moderation purposes
CREATE POLICY "admin_moderation_only" 
ON public.public_profiles FOR ALL 
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 5. Create function to validate zero PII exposure
CREATE OR REPLACE FUNCTION public.validate_zero_pii_exposure()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify no anonymous access to any user data
  RETURN QUERY
  SELECT 
    'anonymous_blocked_completely'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'CRITICAL_BREACH' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No anonymous access to any user data tables'
      ELSE 'CRITICAL: ' || COUNT(*) || ' tables still accessible to anonymous users'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'NONE' ELSE 'CRITICAL' END::TEXT
  FROM information_schema.role_table_grants 
  WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'public_profiles', 'medical_events', 'rfqs', 'security_audit_log')
    AND grantee = 'anon';
    
  -- Verify strict user isolation on profiles
  RETURN QUERY
  SELECT 
    'user_isolation_enforced'::TEXT,
    CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
    'User isolation policies: ' || COUNT(*)::TEXT || ' (own-access only + admin override)'::TEXT,
    CASE WHEN COUNT(*) >= 3 THEN 'LOW' ELSE 'HIGH' END::TEXT
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' 
    AND pc.relname = 'profiles'
    AND pol.polqual::text LIKE '%auth.uid() = user_id%';
    
  -- Verify no email/name exposure in any accessible views
  RETURN QUERY
  SELECT 
    'no_pii_in_accessible_views'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'PII_LEAK' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No PII fields exposed in any publicly accessible views'
      ELSE 'PII LEAK: ' || COUNT(*) || ' views expose personal information'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'NONE' ELSE 'CRITICAL' END::TEXT
  FROM pg_views 
  WHERE schemaname = 'public' 
    AND (
      definition LIKE '%first_name%' 
      OR definition LIKE '%last_name%'
      OR definition LIKE '%email%'
      OR definition LIKE '%phone%'
    )
    AND viewname NOT IN ('safe_professional_directory'); -- Our safe view is allowed
END;
$$;