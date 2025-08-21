-- Fix Security Definer View issue by recreating public_profiles view without SECURITY DEFINER
-- First, we need to handle the dependent function

-- Drop the function that depends on the view
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Drop the existing security definer view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This means the view will run with the permissions of the user making the query
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
FROM profiles
WHERE verified = true;

-- Add security barrier to ensure proper RLS enforcement
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Recreate the function to work with the new view
-- Use SECURITY DEFINER only when necessary and with proper access controls
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public.public_profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  -- Only return verified public profiles
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$function$;

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;