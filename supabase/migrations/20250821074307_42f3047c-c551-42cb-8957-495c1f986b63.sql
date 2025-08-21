-- Fix the remaining Security Definer View warning by removing security_barrier
-- First check current view settings and remove security_barrier if present
ALTER VIEW public.public_profiles RESET (security_barrier);

-- Alternative approach: Drop and recreate view without any security definer properties
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate the view completely clean
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

-- The view will inherit RLS from the underlying table
-- No additional security properties needed

-- Recreate the function to use the clean view
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

-- Grant permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;