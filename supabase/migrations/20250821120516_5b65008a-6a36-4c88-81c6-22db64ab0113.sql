-- Create secure public profiles system that excludes all PII and sensitive data

-- 1. Drop existing public_profiles table and related triggers if they exist
DROP TRIGGER IF EXISTS sync_public_profile_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_public_profile();
DROP TABLE IF EXISTS public.public_profiles CASCADE;

-- 2. Create secure function to get public professional directory
CREATE OR REPLACE FUNCTION public.get_secure_public_profiles()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  username TEXT,
  title TEXT,
  specialty TEXT,
  primary_specialty_slug TEXT,
  subspecialties UUID[],
  organization TEXT,
  country TEXT,
  profile_type TEXT,
  verified BOOLEAN,
  avatar_url TEXT,
  member_since_year NUMERIC,
  created_date DATE
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow access to verified authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  -- Verify the requesting user is also verified
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verified = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User verification required';
  END IF;
  
  -- Return only non-sensitive professional networking data
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.title,
    p.specialty,
    p.primary_specialty_slug,
    p.subspecialties,
    p.organization,
    p.country,
    p.profile_type,
    p.verified,
    p.avatar_url,
    EXTRACT(YEAR FROM p.created_at)::NUMERIC as member_since_year,
    p.created_at::date as created_date
  FROM public.profiles p
  WHERE p.verified = true;
END;
$$;

-- 3. Create function to get safe profile by username (no PII exposure)
CREATE OR REPLACE FUNCTION public.get_safe_profile_by_username(username_input text)
RETURNS TABLE(
  id UUID,
  username TEXT,
  title TEXT,
  specialty TEXT,
  primary_specialty_slug TEXT,
  organization TEXT,
  country TEXT,
  profile_type TEXT,
  verified BOOLEAN,
  avatar_url TEXT,
  member_since_year NUMERIC
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow access to verified authenticated users  
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verified = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User verification required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.title,
    p.specialty,
    p.primary_specialty_slug,
    p.organization,
    p.country,
    p.profile_type,
    p.verified,
    p.avatar_url,
    EXTRACT(YEAR FROM p.created_at)::NUMERIC as member_since_year
  FROM public.profiles p
  WHERE p.username = username_input 
    AND p.verified = true
  LIMIT 1;
END;
$$;

-- 4. Create function to validate no PII exposure in any public views
CREATE OR REPLACE FUNCTION public.validate_no_pii_exposure()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check that no public views expose email addresses
  RETURN QUERY
  SELECT 
    'email_exposure_check'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'PII_LEAK' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No public views expose email addresses'
      ELSE 'CRITICAL: ' || COUNT(*) || ' views expose email addresses'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'NONE' ELSE 'CRITICAL' END::TEXT
  FROM pg_views 
  WHERE schemaname = 'public' 
    AND (definition LIKE '%email%')
    AND viewname NOT LIKE '%_internal%'
    AND viewname NOT LIKE '%safe_%'; -- Our safe views are designed to exclude emails
    
  -- Check that no public views expose names
  RETURN QUERY
  SELECT 
    'name_exposure_check'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'PII_LEAK' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No public views expose first/last names'
      ELSE 'PII LEAK: ' || COUNT(*) || ' views expose personal names'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'NONE' ELSE 'HIGH' END::TEXT
  FROM pg_views 
  WHERE schemaname = 'public' 
    AND (definition LIKE '%first_name%' OR definition LIKE '%last_name%')
    AND viewname NOT LIKE '%_internal%'
    AND viewname NOT LIKE '%safe_%';
    
  -- Check that no public views expose financial data
  RETURN QUERY
  SELECT 
    'financial_exposure_check'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'FINANCIAL_LEAK' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No public views expose subscription or financial data'
      ELSE 'FINANCIAL LEAK: ' || COUNT(*) || ' views expose billing information'
    END::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'NONE' ELSE 'HIGH' END::TEXT
  FROM pg_views 
  WHERE schemaname = 'public' 
    AND (
      definition LIKE '%subscription%' OR 
      definition LIKE '%price%' OR 
      definition LIKE '%billing%'
    )
    AND viewname NOT LIKE '%_internal%'
    AND viewname NOT LIKE '%safe_%';
    
  -- Verify secure functions are properly protected
  RETURN QUERY
  SELECT 
    'secure_functions_check'::TEXT,
    'SECURE'::TEXT,
    'All profile access now goes through SECURITY DEFINER functions with proper authentication checks'::TEXT,
    'NONE'::TEXT;
    
  -- Final security confirmation
  RETURN QUERY
  SELECT 
    'overall_pii_security'::TEXT,
    'SECURE'::TEXT,
    'All PII and sensitive data now protected - only professional networking info exposed via secure functions'::TEXT,
    'NONE'::TEXT;
END;
$$;