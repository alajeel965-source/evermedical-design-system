-- Comprehensive Security Fixes (Fixed Order)
-- Handle dependencies correctly by dropping function first

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

-- Step 5: Enable RLS on the public_profiles view
ALTER VIEW public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create secure policy for public profile access (no email exposure)
CREATE POLICY "Verified profiles viewable by authenticated users"
ON public.public_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Step 7: Recreate the get_public_profile function to use the secure view
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public_profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$function$;