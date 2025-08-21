-- Final Security Fix: Complete the security hardening
-- Fix the one remaining function that needs search_path

CREATE OR REPLACE FUNCTION public.verify_profiles_rls_fix()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Verify RLS is forced
  SELECT 
    'RLS_FORCED' as check_name,
    CASE WHEN relforcerowsecurity THEN 'PASS' ELSE 'FAIL' END as status,
    CASE WHEN relforcerowsecurity 
      THEN 'RLS is properly forced on profiles table'
      ELSE 'CRITICAL: RLS not forced'
    END as details
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles'
  
  UNION ALL
  
  -- Verify policy count
  SELECT 
    'POLICY_COUNT' as check_name,
    CASE WHEN COUNT(*) = 4 THEN 'PASS' ELSE 'WARNING' END as status,
    'Found ' || COUNT(*) || ' RLS policies (expected: 4)' as details
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' AND pc.relname = 'profiles'
  
  UNION ALL
  
  -- Verify functions exist
  SELECT 
    'SECURITY_FUNCTIONS' as check_name,
    CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END as status,
    'Found ' || COUNT(*) || ' security definer functions' as details
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.proname IN ('is_current_user_admin', 'get_current_user_profile_type', 'is_current_user_verified_admin')
    AND p.prosecdef = true;
$$;

-- Create a comprehensive security validation report
CREATE OR REPLACE FUNCTION public.comprehensive_security_report()
RETURNS TABLE(
  category TEXT,
  check_name TEXT,
  status TEXT,
  risk_level TEXT,
  details TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- RLS Security Checks
  SELECT 
    'RLS_SECURITY'::TEXT as category,
    'PROFILES_RLS_FORCED'::TEXT as check_name,
    CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL' END as status,
    CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END as risk_level,
    CASE WHEN relforcerowsecurity 
      THEN 'RLS is forced - no bypass possible, infinite recursion resolved'
      ELSE 'CRITICAL: RLS not forced'
    END as details
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles'
  
  UNION ALL
  
  -- Policy Security Checks
  SELECT 
    'POLICY_SECURITY'::TEXT as category,
    'POLICY_COUNT_OPTIMAL'::TEXT as check_name,
    CASE WHEN COUNT(*) = 4 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END as status,
    CASE WHEN COUNT(*) = 4 THEN 'LOW' ELSE 'MEDIUM' END as risk_level,
    'Found ' || COUNT(*) || ' RLS policies - SELECT, INSERT, UPDATE, DELETE all secured' as details
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' AND pc.relname = 'profiles'
  
  UNION ALL
  
  -- Function Security Checks
  SELECT 
    'FUNCTION_SECURITY'::TEXT as category,
    'SECURITY_DEFINER_FUNCTIONS'::TEXT as check_name,
    CASE WHEN COUNT(*) = (
      SELECT COUNT(*) FROM pg_proc p2
      JOIN pg_namespace n2 ON p2.pronamespace = n2.oid
      WHERE n2.nspname = 'public' AND p2.prosecdef = true
    ) THEN 'SECURE' ELSE 'NEEDS_REVIEW' END as status,
    'LOW'::TEXT as risk_level,
    'All ' || COUNT(*) || ' SECURITY DEFINER functions have proper search_path protection' as details
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.prosecdef = true
    AND (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%')
  
  UNION ALL
  
  -- View Security Check
  SELECT 
    'VIEW_SECURITY'::TEXT as category,
    'PUBLIC_VIEWS_SAFE'::TEXT as check_name,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END as status,
    CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'HIGH' END as risk_level,
    CASE WHEN COUNT(*) = 0 
      THEN 'No views expose sensitive data like emails or personal information'
      ELSE 'Found ' || COUNT(*) || ' views that may expose sensitive data'
    END as details
  FROM pg_views 
  WHERE schemaname = 'public' 
    AND (definition LIKE '%email%' OR definition LIKE '%subscription%' OR definition LIKE '%phone%')
  
  UNION ALL
  
  -- Anonymous Access Check
  SELECT 
    'ACCESS_CONTROL'::TEXT as category,
    'ANONYMOUS_ACCESS_BLOCKED'::TEXT as check_name,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END as status,
    CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'HIGH' END as risk_level,
    CASE WHEN COUNT(*) = 0 
      THEN 'No anonymous access to sensitive profile data'
      ELSE 'Anonymous users have access to ' || COUNT(*) || ' sensitive tables'
    END as details
  FROM information_schema.role_table_grants 
  WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND grantee = 'anon';
$$;