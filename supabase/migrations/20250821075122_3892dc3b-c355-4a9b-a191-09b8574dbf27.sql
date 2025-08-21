-- FIX CRITICAL SECURITY ISSUE: Remove access to sensitive profile data by other users
-- Drop the dangerous policy that allows authenticated users to see other users' profiles
DROP POLICY IF EXISTS "Public profile data viewable by authenticated users" ON public.profiles;

-- Remove any direct access permissions to the profiles table for authenticated/anon users
REVOKE ALL ON public.profiles FROM authenticated;
REVOKE ALL ON public.profiles FROM anon;

-- Grant only the minimum necessary permissions for users to manage their own profiles
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Ensure the public_profiles view is still accessible for legitimate public profile viewing
-- (This view only shows non-sensitive fields and is safe for public access)
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Add security comment
COMMENT ON TABLE public.profiles IS 'SECURITY: Contains sensitive user data including emails and subscription info. Only accessible by profile owner. Use public_profiles view for non-sensitive public data.';

-- Verify that users can still access their own profiles through existing policies:
-- - "Users can view their own complete profile" 
-- - "Users can insert their own profile"
-- - "Users can update their own profile"
-- These policies remain active and secure