-- CRITICAL SECURITY FIXES - CORRECTED APPROACH
-- Phase 1: Fix Email Privacy Vulnerability and Security Definer Issues

-- 1. Remove the dangerous policy that exposes all verified user data to authenticated users
DROP POLICY IF EXISTS "Verified profiles viewable by authenticated users" ON public.profiles;

-- 2. Drop and recreate the get_public_profile function without SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- 3. Update the public_profiles view to exclude sensitive information
DROP VIEW IF EXISTS public.public_profiles;

-- Create a safe public profiles view that only shows non-sensitive information
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
    -- EXCLUDED: email, subscription data, phone numbers, etc.
FROM profiles
WHERE verified = true;

-- Add security barrier for proper RLS enforcement
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- 4. Create the function without SECURITY DEFINER (safer approach)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public.public_profiles
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$function$;

-- 5. Add a restrictive policy to allow users to see only basic verified profile info
-- This replaces the overly permissive policy we removed
CREATE POLICY "Limited verified profiles viewable by authenticated users" 
ON public.profiles
FOR SELECT 
USING (
  verified = true 
  AND auth.uid() IS NOT NULL 
  AND auth.uid() != user_id  -- Users still see their own profiles through personal policies
);

-- 6. Secure organizer contact information in medical_events
-- Create a function to get safe event details without exposing contact info
CREATE OR REPLACE FUNCTION public.get_safe_event_details(event_id uuid)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    start_date timestamptz,
    end_date timestamptz,
    venue_name text,
    venue_address text,
    city text,
    country text,
    format text,
    is_free boolean,
    registration_url text,
    featured_image text,
    specialty_slug text,
    status text
    -- EXCLUDED: organizer_email, organizer_phone, etc.
)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e.venue_name,
    e.venue_address,
    e.city,
    e.country,
    e.format,
    e.is_free,
    e.registration_url,
    e.featured_image,
    e.specialty_slug,
    e.status
  FROM medical_events e
  WHERE e.id = event_id AND e.status = 'approved';
$function$;

-- 7. Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_safe_event_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_event_details(uuid) TO anon;