-- FIX SECURITY DEFINER VIEW ISSUE
-- Handle dependencies properly before recreating view

-- First, drop the dependent function
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Drop and recreate public_profiles view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate the public_profiles view safely (without SECURITY DEFINER)
-- This view should only expose non-sensitive profile information
CREATE VIEW public.public_profiles AS
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
FROM public.profiles
WHERE verified = true;

-- Recreate the get_public_profile function to use the new view
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

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;