-- FIX SECURITY ISSUE: Consolidate conflicting RLS policies for better security
-- Remove redundant and potentially conflicting policies

-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own subscription info" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own subscription info" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create consolidated, clear, and secure policies
-- 1. SELECT policy - users can view their own complete profile data
CREATE POLICY "profile_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. INSERT policy - users can create their own profile
CREATE POLICY "profile_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE policy - users can update their own profile and subscription data
CREATE POLICY "profile_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DELETE policy - prevent profile deletion for data integrity
-- (No DELETE policy means users cannot delete their profiles)

-- Add comprehensive security documentation
COMMENT ON POLICY "profile_select_own" ON public.profiles IS 'Users can view their own complete profile including sensitive subscription data';
COMMENT ON POLICY "profile_insert_own" ON public.profiles IS 'Users can create their own profile during registration';
COMMENT ON POLICY "profile_update_own" ON public.profiles IS 'Users can update their own profile and subscription information';

-- Update table comment with clear security model
COMMENT ON TABLE public.profiles IS 'SECURITY: Contains sensitive PII and financial data. Access strictly limited to profile owner via consolidated RLS policies. Public access only via public_profiles view.';