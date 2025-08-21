-- Fix Security Definer View issue by recreating views with proper security context
-- The issue is likely that views are owned by postgres superuser which can bypass RLS

-- Drop and recreate public_profiles view with proper security context
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate public_profiles view
CREATE VIEW public.public_profiles 
WITH (security_barrier = false, security_invoker = true) AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
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

-- Drop and recreate public_medical_events view with proper security context  
DROP VIEW IF EXISTS public.public_medical_events CASCADE;

-- Recreate public_medical_events view
CREATE VIEW public.public_medical_events
WITH (security_barrier = false, security_invoker = true) AS
SELECT 
  id,
  title,
  title_ar,
  description,
  description_ar,
  summary,
  summary_ar,
  start_date,
  end_date,
  registration_deadline,
  timezone,
  format,
  venue_name,
  venue_address,
  venue_lat,
  venue_lng,
  country,
  city,
  online_url,
  organizer,
  organizer_website,
  specialty_slug,
  subspecialty,
  subspecialties,
  languages,
  has_cme,
  cme_hours,
  cme_points,
  cme_provider,
  accreditation_details,
  accreditation_url,
  is_free,
  price_range,
  currency,
  registration_required,
  registration_url,
  capacity,
  registered_count,
  featured_image,
  gallery_images,
  target_audience,
  status,
  view_count,
  save_count,
  share_count,
  click_count,
  created_at,
  updated_at,
  slug,
  seo_title,
  seo_description,
  source_url,
  fetched_at,
  source_id
FROM public.medical_events
WHERE status = 'approved';

-- Recreate the get_public_profile function if it was dropped
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

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

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_medical_events TO authenticated;
GRANT SELECT ON public.public_medical_events TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;

-- Add security comments
COMMENT ON VIEW public.public_profiles IS 'Public view of user profiles with security_invoker = true to respect RLS policies';
COMMENT ON VIEW public.public_medical_events IS 'Public view of medical events with security_invoker = true to respect RLS policies';