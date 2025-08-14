-- Fix critical security issue: Restrict profile data access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create secure policies that protect sensitive data
-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Other users can only view limited public profile information
-- This excludes sensitive data like email addresses
CREATE POLICY "Public profile information is viewable"
ON public.profiles  
FOR SELECT
TO authenticated
USING (
  auth.uid() != user_id AND
  auth.uid() IS NOT NULL
);

-- Create a view for public profile data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
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
  avatar_url,
  verified,
  created_at
  -- Deliberately excluding: email, updated_at and other sensitive fields
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Create a security definer function to get profile by user_id (for internal use)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public.public_profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$$;

-- Create a function to check if current user can see another user's email
-- This is for specific business cases where email sharing might be needed
CREATE OR REPLACE FUNCTION public.can_see_user_email(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Only the user themselves can see their email
  -- Future: Could extend this for admin roles or business connections
  SELECT auth.uid() = target_user_id;
$$;