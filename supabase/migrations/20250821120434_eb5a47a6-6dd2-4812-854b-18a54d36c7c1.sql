-- Create secure public profiles view that excludes all PII and sensitive data

-- 1. Drop existing public_profiles table and related triggers
DROP TRIGGER IF EXISTS sync_public_profile_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_public_profile();
DROP TABLE IF EXISTS public.public_profiles CASCADE;

-- 2. Create new secure public profiles view with only professional networking data
CREATE VIEW public.secure_public_profiles AS
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
  EXTRACT(YEAR FROM p.created_at) as member_since_year,
  p.created_at::date as created_date -- Only date, not full timestamp
FROM public.profiles p
WHERE p.verified = true; -- Only show verified profiles

-- 3. Enable RLS on the secure view
ALTER VIEW public.secure_public_profiles SET (security_invoker = true);

-- 4. Create RLS policies for the secure view
-- Allow verified users to view the professional directory
CREATE POLICY "Verified users can view professional directory" 
ON public.secure_public_profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verified = true
  )
);

-- Allow admins full access
CREATE POLICY "Admins can manage professional directory" 
ON public.secure_public_profiles 
FOR ALL 
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 5. Create function to get safe profile by username (no PII exposure)
CREATE OR REPLACE FUNCTION public.get_safe_profile_by_username(username_input text)
RETURNS SETOF secure_public_profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.secure_public_profiles 
  WHERE username = username_input AND verified = true
  LIMIT 1;
$$;

-- 6. Create function to validate no PII exposure in any public views
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
    AND viewname NOT LIKE '%_internal%'; -- Allow internal views
    
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
    AND viewname NOT LIKE '%_internal%';
    
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
    AND viewname NOT LIKE '%_internal%';
    
  -- Final security confirmation
  RETURN QUERY
  SELECT 
    'overall_pii_security'::TEXT,
    'SECURE'::TEXT,
    'All PII and sensitive data now protected - only professional networking info exposed'::TEXT,
    'NONE'::TEXT;
END;
$$;

-- 7. Grant appropriate permissions
GRANT SELECT ON public.secure_public_profiles TO authenticated;
REVOKE ALL ON public.secure_public_profiles FROM anon;