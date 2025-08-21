-- Fix Critical Security Issue: Infinite Recursion in RLS Policies
-- This migration resolves infinite recursion in profiles table policies

-- Step 1: Create safe SECURITY DEFINER functions to check user permissions
-- These functions can access the profiles table without triggering RLS recursion

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- This function runs with definer privileges, bypassing RLS to prevent recursion
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
      AND profile_type = 'admin' 
      AND verified = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_profile_type()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- This function runs with definer privileges, bypassing RLS to prevent recursion
  SELECT profile_type FROM profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_verified_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Check if current user is a verified admin without causing recursion
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
      AND profile_type = 'admin' 
      AND verified = true
  );
$$;

-- Step 2: Drop all existing problematic policies on profiles table
DROP POLICY IF EXISTS "profiles_owner_only_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_read_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_update_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_registration_only" ON public.profiles;

-- Step 3: Create new secure policies using the SECURITY DEFINER functions
-- These policies prevent infinite recursion by using functions that bypass RLS

-- Allow users to read their own profile + admins can read all profiles
CREATE POLICY "profiles_secure_select" ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_current_user_verified_admin()
);

-- Allow users to insert their own profile only
CREATE POLICY "profiles_secure_insert" ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile + admins can update any profile
CREATE POLICY "profiles_secure_update" ON public.profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.is_current_user_verified_admin()
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_current_user_verified_admin()
);

-- Explicitly deny DELETE operations to prevent accidental data loss
-- Only allow admin users to delete profiles in exceptional circumstances
CREATE POLICY "profiles_secure_delete" ON public.profiles
FOR DELETE
USING (public.is_current_user_verified_admin());

-- Step 4: Add security comment and verification
COMMENT ON FUNCTION public.is_current_user_admin() IS 
'SECURITY DEFINER function to check admin status without RLS recursion. Used in RLS policies.';

COMMENT ON FUNCTION public.get_current_user_profile_type() IS 
'SECURITY DEFINER function to get user profile type without RLS recursion. Used in RLS policies.';

COMMENT ON FUNCTION public.is_current_user_verified_admin() IS 
'SECURITY DEFINER function to check verified admin status without RLS recursion. Used in RLS policies.';

-- Step 5: Ensure RLS is still enabled and forced
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Step 6: Create validation function to verify the fix worked
CREATE OR REPLACE FUNCTION public.verify_profiles_rls_fix()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Verify RLS is forced
  SELECT 
    'RLS_FORCED' as check_name,
    CASE WHEN relforcerowsecurity THEN 'PASS' ELSE 'FAIL' END as status,
    CASE WHEN relforcerowsecurity 
      THEN 'RLS is properly forced on profiles table'
      ELSE 'CRITICAL: RLS not forced'
    END as details
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles'
  
  UNION ALL
  
  -- Verify policy count
  SELECT 
    'POLICY_COUNT' as check_name,
    CASE WHEN COUNT(*) = 4 THEN 'PASS' ELSE 'WARNING' END as status,
    'Found ' || COUNT(*) || ' RLS policies (expected: 4)' as details
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' AND pc.relname = 'profiles'
  
  UNION ALL
  
  -- Verify functions exist
  SELECT 
    'SECURITY_FUNCTIONS' as check_name,
    CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END as status,
    'Found ' || COUNT(*) || ' security definer functions' as details
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.proname IN ('is_current_user_admin', 'get_current_user_profile_type', 'is_current_user_verified_admin')
    AND p.prosecdef = true;
$$;