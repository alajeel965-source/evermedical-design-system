-- Fix security definer view issue by converting to regular view

-- Drop the security definer view and recreate as regular view
DROP VIEW IF EXISTS public.safe_public_profiles;

-- Create regular view (not security definer) for basic profile information
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

-- Grant appropriate permissions to the view
GRANT SELECT ON public.safe_public_profiles TO authenticated;
GRANT SELECT ON public.safe_public_profiles TO anon;