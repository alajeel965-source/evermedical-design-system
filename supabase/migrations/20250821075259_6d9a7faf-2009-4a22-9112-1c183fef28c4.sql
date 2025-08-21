-- FIX CRITICAL SECURITY ISSUE: Ensure subscription/payment data is only accessible to profile owner
-- The current RLS policies look correct, but let's verify and strengthen them

-- First, let's check if there are any overly permissive grants on the profiles table
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Grant only the minimum necessary permissions 
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Ensure the public_profiles view absolutely does NOT expose any subscription data
-- Drop and recreate it to be extra safe
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate public_profiles view with explicit exclusion of ALL sensitive data
CREATE VIEW public.public_profiles 
WITH (security_barrier = false, security_invoker = true) AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  avatar_url,
  title,
  specialty,
  primary_specialty_slug,
  organization,
  country,
  profile_type,
  verified,
  created_at
  -- EXPLICITLY EXCLUDED for security:
  -- email (PII)
  -- subscription_plan (financial data)
  -- subscription_status (financial data) 
  -- subscription_start_date (financial data)
  -- subscription_end_date (financial data)
  -- subscription_price (financial data)
  -- subscription_currency (financial data)
FROM public.profiles
WHERE verified = true;

-- Recreate the get_public_profile function
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public.public_profiles
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$function$;

-- Grant permissions only on the safe public view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;

-- Add security documentation
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains sensitive financial subscription data. Access restricted to profile owner only. Use public_profiles view for non-sensitive data.';
COMMENT ON VIEW public.public_profiles IS 'Safe public view excluding all PII and financial subscription data';

-- Verify existing RLS policies are still in place and secure
-- The following policies should remain active:
-- - "Users can view their own complete profile" (allows users to see their own subscription data)
-- - "Users can view their own subscription info" (allows users to manage their own billing) 
-- - "Users can update their own profile" (allows profile updates)
-- - "Users can update their own subscription info" (allows subscription management)
-- - "Users can insert their own profile" (allows profile creation)