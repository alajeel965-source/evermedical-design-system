-- Fix database security issues

-- 1. Fix Security Definer View (if exists)
DROP VIEW IF EXISTS public_profiles;

-- 2. Update functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public.profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id, user_id, display_name, avatar_url, bio, created_at, updated_at 
  FROM public.profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.can_see_user_email(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  -- Only the user themselves can see their email
  SELECT auth.uid() = target_user_id;
$function$;

-- 3. Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create secure policies for profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Reduce OTP expiry time for better security
ALTER SYSTEM SET "auth.otp_expiry" TO '300'; -- 5 minutes instead of default

-- Reload configuration
SELECT pg_reload_conf();