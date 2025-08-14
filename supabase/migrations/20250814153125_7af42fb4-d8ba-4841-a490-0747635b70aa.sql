-- Comprehensive Security Fixes (Corrected for Views)
-- Fix user data exposure and security definer view issues

-- Step 1: Drop dependent function first
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Step 2: Drop the overly permissive policy that exposes user emails and personal data
DROP POLICY IF EXISTS "Public profile information is viewable" ON public.profiles;

-- Step 3: Create a secure policy that only allows users to view their own complete profile
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Step 4: Drop and recreate public_profiles view without SECURITY DEFINER and with only safe fields
DROP VIEW IF EXISTS public.public_profiles CASCADE;

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
FROM public.profiles
WHERE verified = true; -- Only show verified profiles publicly

-- Step 5: Recreate the get_public_profile function without SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public_profiles
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$function$;