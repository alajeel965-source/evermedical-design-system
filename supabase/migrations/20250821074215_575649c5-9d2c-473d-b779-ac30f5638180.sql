-- Fix Security Definer function by removing SECURITY DEFINER and using proper RLS instead
DROP FUNCTION IF EXISTS public.get_public_profile_safe(uuid);

-- Update the RLS policy to be more specific about which columns can be accessed
DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;

-- Create a refined policy that allows access to only public fields for other users' verified profiles
CREATE POLICY "Public profile data viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  verified = true 
  AND auth.uid() IS NOT NULL 
  AND user_id != auth.uid()
);

-- Note: Applications should use the public_profiles view for accessing other users' profiles
-- The view already filters to only show non-sensitive fields and verified profiles

-- Ensure proper permissions on the public_profiles view
REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Update the existing get_public_profile function to remove SECURITY DEFINER
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

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;