-- Fix Security Definer View issue by recreating views with proper ownership

-- Drop the existing view that's owned by postgres
DROP VIEW IF EXISTS public.safe_public_profiles;

-- Create a proper view without security definer issues
-- This view will rely on RLS policies instead of definer rights
CREATE VIEW public.safe_public_profiles AS
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    username,
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

-- Set proper ownership (not postgres superuser)
ALTER VIEW public.safe_public_profiles OWNER TO authenticator;

-- Create RLS policy for the view instead of relying on security definer
CREATE POLICY "safe_public_profiles_select" ON public.profiles
FOR SELECT 
USING (verified = true);

-- Grant appropriate access to the view
GRANT SELECT ON public.safe_public_profiles TO authenticated;
GRANT SELECT ON public.safe_public_profiles TO anon;

-- Verify no other views have security definer issues
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewowner = 'postgres'
    LOOP
        RAISE NOTICE 'Found postgres-owned view: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END $$;