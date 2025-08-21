-- FIX SECURITY DEFINER VIEW ISSUE
-- Check if public_profiles view is using SECURITY DEFINER and fix it

-- Drop and recreate public_profiles view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

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

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;