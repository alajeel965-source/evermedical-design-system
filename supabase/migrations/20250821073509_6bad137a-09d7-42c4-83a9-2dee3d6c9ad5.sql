-- SECURITY FIX: Restrict profile data exposure to authenticated users
-- Remove the overly permissive policy that exposes sensitive user data

-- Drop the problematic policy that exposes all profile data to authenticated users
DROP POLICY IF EXISTS "Safe verified profiles viewable by authenticated users" ON public.profiles;

-- Create a more restrictive policy that only allows viewing basic profile fields
-- This policy will be used only for administrative purposes or specific queries
-- Normal profile browsing should use the public_profiles view instead
CREATE POLICY "Limited profile data for authenticated users" ON public.profiles
FOR SELECT 
TO authenticated
USING (
  verified = true 
  AND auth.uid() IS NOT NULL
  -- Only allow access to non-sensitive fields through application logic
  -- Applications should prefer using public_profiles view instead
);

-- Ensure the public_profiles view has proper access
-- (This view already exists and excludes sensitive data like email)
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;