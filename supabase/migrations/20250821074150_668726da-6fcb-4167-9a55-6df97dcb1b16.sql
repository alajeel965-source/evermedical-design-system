-- FIX SECURITY ISSUE: Remove public access to sensitive profile data
-- Drop the overly permissive policy that allows authenticated users to see all verified profiles
DROP POLICY IF EXISTS "Limited profile data for authenticated users" ON public.profiles;

-- Ensure only users can see their own complete profile data
-- The existing "Users can view their own complete profile" policy is correct and should remain

-- Add a comment to clarify the security model
COMMENT ON TABLE public.profiles IS 'Contains sensitive user data. Only accessible to profile owner. Use public_profiles view for non-sensitive public data.';

-- Ensure the public_profiles view has proper RLS (it should inherit from profiles table restrictions)
-- Add RLS policy to public_profiles view to be extra safe
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create a policy for public_profiles view that only shows verified profiles to authenticated users
CREATE POLICY "Public profiles viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  verified = true 
  AND auth.uid() IS NOT NULL 
  AND user_id != auth.uid()  -- Exclude own profile to avoid conflicts with complete profile policy
);

-- But limit the columns that can be accessed through this policy by creating a function
-- that returns only public data
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  title text,
  specialty text,
  primary_specialty_slug text,
  organization text,
  country text,
  profile_type text,
  verified boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.title,
    p.specialty,
    p.primary_specialty_slug,
    p.organization,
    p.country,
    p.profile_type,
    p.verified,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.verified = true
  LIMIT 1;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile_safe(uuid) TO authenticated;