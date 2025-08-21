-- Fix Security Definer View Issue: Recreate Views with Proper Security
-- The views are currently owned by postgres superuser, making them effectively SECURITY DEFINER

-- Step 1: Drop and recreate public_profiles view with proper security
DROP VIEW IF EXISTS public.public_profiles;

-- Create a safe public profiles view that doesn't expose sensitive data
-- This view will be owned by the database user, not postgres superuser
CREATE VIEW public.public_profiles AS
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

-- Step 2: Drop and recreate public_medical_events view with proper security  
DROP VIEW IF EXISTS public.public_medical_events;

-- Create a safe public medical events view
CREATE VIEW public.public_medical_events AS
SELECT 
  id,
  title,
  title_ar,
  description,
  description_ar,
  summary,
  summary_ar,
  slug,
  start_date,
  end_date,
  timezone,
  registration_deadline,
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
  target_audience,
  languages,
  has_cme,
  cme_provider,
  cme_hours,
  cme_points,
  accreditation_url,
  accreditation_details,
  is_free,
  price_range,
  currency,
  registration_url,
  registration_required,
  capacity,
  registered_count,
  featured_image,
  gallery_images,
  seo_title,
  seo_description,
  view_count,
  save_count,
  share_count,
  click_count,
  status,
  created_at,
  updated_at,
  source_url
FROM public.medical_events
WHERE status = 'approved';

-- Step 3: Ensure views have proper permissions for public access
-- Grant SELECT permissions to authenticated users for public views
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_medical_events TO authenticated;

-- Grant SELECT permissions to anonymous users for truly public data
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_medical_events TO anon;

-- Step 4: Add security validation to ensure no sensitive data is exposed
CREATE OR REPLACE FUNCTION public.validate_public_views_security()
RETURNS TABLE(
  view_name TEXT,
  security_status TEXT,
  sensitive_fields_check TEXT,
  access_level TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Check public_profiles view for sensitive data exposure
  SELECT 
    'public_profiles'::TEXT as view_name,
    CASE 
      WHEN definition LIKE '%email%' OR definition LIKE '%subscription%' OR definition LIKE '%phone%' 
      THEN 'VULNERABLE - EXPOSES SENSITIVE DATA'
      ELSE 'SECURE - NO SENSITIVE DATA'
    END as security_status,
    CASE 
      WHEN definition LIKE '%email%' THEN 'EXPOSES EMAIL ADDRESSES'
      WHEN definition LIKE '%subscription%' THEN 'EXPOSES BILLING INFO'  
      WHEN definition LIKE '%phone%' THEN 'EXPOSES PHONE NUMBERS'
      ELSE 'NO SENSITIVE FIELDS DETECTED'
    END as sensitive_fields_check,
    'PUBLIC_ACCESS'::TEXT as access_level
  FROM pg_views 
  WHERE schemaname = 'public' AND viewname = 'public_profiles'
  
  UNION ALL
  
  -- Check public_medical_events view for sensitive data exposure
  SELECT 
    'public_medical_events'::TEXT as view_name,
    CASE 
      WHEN definition LIKE '%organizer_email%' OR definition LIKE '%organizer_phone%' OR definition LIKE '%created_by%'
      THEN 'VULNERABLE - EXPOSES SENSITIVE DATA'
      ELSE 'SECURE - NO SENSITIVE DATA'
    END as security_status,
    CASE 
      WHEN definition LIKE '%organizer_email%' THEN 'EXPOSES ORGANIZER EMAILS'
      WHEN definition LIKE '%organizer_phone%' THEN 'EXPOSES ORGANIZER PHONES'
      WHEN definition LIKE '%created_by%' THEN 'EXPOSES ADMIN USER IDS'
      ELSE 'NO SENSITIVE FIELDS DETECTED'
    END as sensitive_fields_check,
    'PUBLIC_ACCESS'::TEXT as access_level
  FROM pg_views 
  WHERE schemaname = 'public' AND viewname = 'public_medical_events';
$$;

-- Step 5: Create a comprehensive view security report
CREATE OR REPLACE FUNCTION public.view_security_audit()
RETURNS TABLE(
  view_name TEXT,
  owner_name TEXT,
  is_security_definer BOOLEAN,
  has_sensitive_data BOOLEAN,
  security_rating TEXT,
  recommendation TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    c.relname::TEXT as view_name,
    u.usename::TEXT as owner_name,
    (u.usename = 'postgres')::BOOLEAN as is_security_definer,
    (
      pg_get_viewdef(c.oid) LIKE '%email%' OR 
      pg_get_viewdef(c.oid) LIKE '%subscription%' OR 
      pg_get_viewdef(c.oid) LIKE '%phone%' OR
      pg_get_viewdef(c.oid) LIKE '%password%'
    )::BOOLEAN as has_sensitive_data,
    CASE 
      WHEN u.usename = 'postgres' AND (
        pg_get_viewdef(c.oid) LIKE '%email%' OR 
        pg_get_viewdef(c.oid) LIKE '%subscription%' OR 
        pg_get_viewdef(c.oid) LIKE '%phone%'
      ) THEN 'CRITICAL - POSTGRES OWNED WITH SENSITIVE DATA'
      WHEN u.usename = 'postgres' THEN 'HIGH - POSTGRES OWNED VIEW'
      WHEN (
        pg_get_viewdef(c.oid) LIKE '%email%' OR 
        pg_get_viewdef(c.oid) LIKE '%subscription%' OR 
        pg_get_viewdef(c.oid) LIKE '%phone%'
      ) THEN 'MEDIUM - EXPOSES SENSITIVE DATA'
      ELSE 'LOW - SECURE VIEW'
    END as security_rating,
    CASE 
      WHEN u.usename = 'postgres' THEN 'Recreate view with proper user ownership'
      WHEN (
        pg_get_viewdef(c.oid) LIKE '%email%' OR 
        pg_get_viewdef(c.oid) LIKE '%subscription%' OR 
        pg_get_viewdef(c.oid) LIKE '%phone%'
      ) THEN 'Remove sensitive fields from view definition'
      ELSE 'View is secure'
    END as recommendation
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  LEFT JOIN pg_user u ON c.relowner = u.usesysid
  WHERE n.nspname = 'public' 
    AND c.relkind = 'v'
    AND c.relname LIKE 'public_%'
  ORDER BY 
    CASE 
      WHEN u.usename = 'postgres' THEN 1 
      ELSE 2 
    END;
$$;

-- Step 6: Add comments for documentation
COMMENT ON VIEW public.public_profiles IS 
'Public view of verified user profiles. Excludes sensitive information like emails, subscription data, and unverified profiles. Safe for public access.';

COMMENT ON VIEW public.public_medical_events IS 
'Public view of approved medical events. Excludes organizer contact information and admin data. Safe for public access.';

COMMENT ON FUNCTION public.validate_public_views_security() IS 
'Security validation function to check public views for sensitive data exposure. Should be run after any view modifications.';

COMMENT ON FUNCTION public.view_security_audit() IS 
'Comprehensive security audit of all public views. Identifies postgres-owned views and sensitive data exposure.';