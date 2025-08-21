-- CRITICAL SECURITY FIX: Secure profiles and public_profiles tables
-- Fix user personal information exposure

-- 1. Force RLS on public_profiles table (if not already forced)
ALTER TABLE public.public_profiles FORCE ROW LEVEL SECURITY;

-- 2. Drop the overly permissive policy that allows verified users to see all profiles
DROP POLICY IF EXISTS "public_profiles_read_access" ON public.public_profiles;

-- 3. Create secure policies for public_profiles - users can only see their own profile
CREATE POLICY "users_can_view_own_public_profile" 
ON public.public_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Admins can manage public profiles for moderation
CREATE POLICY "verified_admins_can_manage_public_profiles" 
ON public.public_profiles FOR ALL 
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 5. Create a SAFE public directory view that excludes all PII
CREATE OR REPLACE VIEW public.safe_professional_directory AS
SELECT 
  id,
  CASE 
    WHEN verified = true THEN specialty
    ELSE NULL
  END as specialty,
  CASE 
    WHEN verified = true THEN primary_specialty_slug  
    ELSE NULL
  END as primary_specialty_slug,
  CASE 
    WHEN verified = true THEN country
    ELSE NULL
  END as country,
  profile_type,
  verified,
  created_at
FROM public.public_profiles 
WHERE verified = true;

-- 6. Grant safe read access to the directory view
GRANT SELECT ON public.safe_professional_directory TO authenticated;
GRANT SELECT ON public.safe_professional_directory TO anon;

-- 7. Create function to validate complete profile security
CREATE OR REPLACE FUNCTION public.validate_complete_profile_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check profiles table RLS status
  RETURN QUERY
  SELECT 
    'profiles_table_rls_forced'::TEXT,
    CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::TEXT,
    CASE WHEN relforcerowsecurity 
      THEN 'Main profiles table has RLS forced - personal data protected'
      ELSE 'CRITICAL: Main profiles table RLS not forced - all user data exposed'
    END::TEXT,
    CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles';
  
  -- Check public_profiles table RLS status  
  RETURN QUERY
  SELECT 
    'public_profiles_rls_forced'::TEXT,
    CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::TEXT,
    CASE WHEN relforcerowsecurity 
      THEN 'Public profiles table has RLS forced - PII exposure prevented'
      ELSE 'CRITICAL: Public profiles table RLS not forced - PII can be harvested'
    END::TEXT,
    CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'public_profiles';
  
  -- Check for overly permissive policies on public_profiles
  RETURN QUERY
  SELECT 
    'public_profiles_policy_security'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No overly permissive policies found on public_profiles'
      ELSE 'Found ' || COUNT(*) || ' policies that may expose PII to other users'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'HIGH' END::TEXT
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' 
    AND pc.relname = 'public_profiles'
    AND pol.polqual::text LIKE '%verified = true%'
    AND pol.polqual::text NOT LIKE '%auth.uid()%';
    
  -- Check profiles table policy security
  RETURN QUERY
  SELECT 
    'profiles_policy_user_isolation'::TEXT,
    CASE WHEN COUNT(*) >= 1 THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
    CASE WHEN COUNT(*) >= 1 
      THEN 'Profiles table has proper user isolation policies'
      ELSE 'Profiles table lacks proper user isolation policies'
    END::TEXT,
    CASE WHEN COUNT(*) >= 1 THEN 'LOW' ELSE 'HIGH' END::TEXT
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' 
    AND pc.relname = 'profiles'
    AND pol.polqual::text LIKE '%auth.uid() = user_id%';
    
  -- Check for email/subscription exposure in any views
  RETURN QUERY
  SELECT 
    'sensitive_data_view_exposure'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No views expose sensitive user data like emails or subscriptions'
      ELSE 'Found ' || COUNT(*) || ' views that expose sensitive user data - CRITICAL PRIVACY BREACH'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'CRITICAL' END::TEXT
  FROM pg_views 
  WHERE schemaname = 'public' 
    AND (
      definition LIKE '%email%' 
      OR definition LIKE '%subscription%' 
      OR definition LIKE '%first_name%'
      OR definition LIKE '%last_name%'
    )
    AND viewname != 'safe_professional_directory';
    
  -- Check anonymous access to sensitive tables
  RETURN QUERY  
  SELECT 
    'anonymous_access_blocked'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No anonymous access to user profiles or personal data'
      ELSE 'Anonymous users have access to ' || COUNT(*) || ' sensitive tables - PRIVACY BREACH'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'CRITICAL' END::TEXT
  FROM information_schema.role_table_grants 
  WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'public_profiles')
    AND grantee = 'anon';
END;
$$;

-- 8. Create function to get safe user profile summary (non-PII)
CREATE OR REPLACE FUNCTION public.get_safe_user_summary(target_user_id UUID)
RETURNS TABLE(
  profile_exists BOOLEAN,
  is_verified BOOLEAN, 
  specialty_area TEXT,
  country_region TEXT,
  member_since DATE
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return aggregated, non-PII data
  RETURN QUERY
  SELECT 
    true::BOOLEAN,
    p.verified,
    CASE WHEN p.verified THEN p.specialty ELSE 'Private' END,
    CASE WHEN p.verified THEN p.country ELSE 'Private' END,
    p.created_at::DATE
  FROM public.public_profiles p
  WHERE p.user_id = target_user_id 
    AND p.verified = true
  LIMIT 1;
  
  -- Return false if not found or not verified
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT false::BOOLEAN, false::BOOLEAN, 'Private'::TEXT, 'Private'::TEXT, NULL::DATE;
  END IF;
END;
$$;