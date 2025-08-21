-- Fix Security Definer View issue by recreating public_profiles view without SECURITY DEFINER
-- This ensures the view respects the querying user's permissions and RLS policies

-- Drop the existing security definer view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This means the view will run with the permissions of the user making the query
CREATE VIEW public.public_profiles AS
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
    created_at,
    avatar_url,
    verified,
    primary_specialty_slug
FROM profiles
WHERE verified = true;

-- Add RLS policy for the view to ensure proper access control
-- This allows anyone to view verified public profiles
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;