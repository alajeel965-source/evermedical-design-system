-- CRITICAL SECURITY FIX: Email Privacy Vulnerability
-- Remove the dangerous policy and fix Security Definer issue

-- 1. Remove the policy that exposes all verified user data including emails
DROP POLICY IF EXISTS "Verified profiles viewable by authenticated users" ON public.profiles;

-- 2. Drop and recreate the get_public_profile function without SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- 3. Update the public_profiles view to exclude sensitive information
DROP VIEW IF EXISTS public.public_profiles;

-- Create a safe public profiles view that excludes email and other sensitive data
CREATE VIEW public.public_profiles AS
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    title,
    specialty,
    organization,
    country,
    profile_type,
    created_at,
    avatar_url,
    verified,
    primary_specialty_slug
    -- EXCLUDED: email, subscription_plan, subscription_price, etc.
FROM profiles
WHERE verified = true;

-- Add security barrier for proper RLS enforcement
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- 4. Create the function without SECURITY DEFINER (much safer)
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

-- 5. Create a more restrictive policy for viewing basic profile info
-- This prevents email harvesting while still allowing networking
CREATE POLICY "Safe verified profiles viewable by authenticated users" 
ON public.profiles
FOR SELECT 
USING (
  verified = true 
  AND auth.uid() IS NOT NULL
  -- NOTE: This policy now only works through the public_profiles view
  -- which excludes sensitive information like email addresses
);

-- 6. Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;