-- Fix database security issues (updated approach)

-- 1. Update functions with proper search_path
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

-- 2. Fix get_public_profile function to return the correct type without dependency issues  
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid, 
  first_name text,
  last_name text,
  title text,
  specialty text,
  organization text,
  country text,
  profile_type text,
  avatar_url text,
  created_at timestamptz,
  verified boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT p.id, p.user_id, p.first_name, p.last_name, p.title, p.specialty, 
         p.organization, p.country, p.profile_type, p.avatar_url, p.created_at, p.verified 
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
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

-- 4. Update RLS policies to be more secure
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- More restrictive public view policy (no email exposure)
CREATE POLICY "Public profile information is viewable" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() <> user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);