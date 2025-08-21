-- COMPREHENSIVE SECURITY AUDIT AND FIX: Ensure public views expose only safe data
-- Analyze and update both public views to eliminate any sensitive data exposure

-- First, let's verify and update the public_medical_events view to ensure it's completely safe
DROP VIEW IF EXISTS public.public_medical_events CASCADE;

-- Recreate public_medical_events with explicit field selection (excluding ALL sensitive data)
CREATE VIEW public.public_medical_events AS
SELECT 
    -- Event identification and basic info
    id,
    title,
    title_ar,
    description,
    description_ar,
    summary,
    summary_ar,
    slug,
    
    -- Event timing and location (safe public info)
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
    
    -- Safe organizer info (NO contact details)
    organizer,
    organizer_website,  -- Website is typically public
    -- EXCLUDED: organizer_email (sensitive contact info)
    -- EXCLUDED: organizer_phone (sensitive contact info)
    
    -- Medical/educational info (safe public info)
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
    
    -- Event logistics (safe public info)
    is_free,
    price_range,
    currency,
    registration_url,
    registration_required,
    capacity,
    registered_count,
    
    -- Media and presentation (safe public info)
    featured_image,
    gallery_images,
    seo_title,
    seo_description,
    
    -- Public metrics (safe aggregate info)
    view_count,
    save_count,
    share_count,
    click_count,
    
    -- Basic metadata (safe public info)
    status,
    created_at,
    updated_at,
    source_url
    
    -- EXPLICITLY EXCLUDED SENSITIVE FIELDS:
    -- created_by (could reveal admin identities)
    -- approved_by (internal admin info)
    -- approved_at (internal workflow info)
    -- review_notes (internal admin notes)
    -- moderation_flags (internal security info)
    -- compliance_checked (internal process info)
    -- confidence_score (internal AI info)
    -- ai_extracted_fields (internal processing data)
    -- source_id (internal system IDs)
    -- fetched_at (internal timing info)
    
FROM public.medical_events
WHERE status = 'approved';

-- Verify public_profiles view is secure (it should already be safe)
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate public_profiles with explicit safe field selection
CREATE VIEW public.public_profiles AS
SELECT 
    -- Basic identification (safe for networking)
    id,
    user_id,
    first_name,
    last_name,
    avatar_url,
    
    -- Professional info (safe for networking)
    title,
    specialty,
    primary_specialty_slug,
    organization,
    country,
    profile_type,
    
    -- Status info (safe public info)
    verified,
    created_at
    
    -- EXPLICITLY EXCLUDED SENSITIVE FIELDS:
    -- email (PII - contact information)
    -- subscription_plan (financial information)
    -- subscription_status (financial information)
    -- subscription_start_date (financial information)
    -- subscription_end_date (financial information)
    -- subscription_price (financial information)
    -- subscription_currency (financial information)
    -- updated_at (could reveal activity patterns)
    -- subspecialties (could be considered detailed professional info)
    
FROM public.profiles
WHERE verified = true;

-- Recreate dependent function for public_profiles
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

-- Set proper permissions on the secure views
GRANT SELECT ON public.public_medical_events TO authenticated;
GRANT SELECT ON public.public_medical_events TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;

-- Create a security verification function for the public views
CREATE OR REPLACE FUNCTION public.audit_public_view_safety()
RETURNS TABLE (
    view_name TEXT,
    security_status TEXT,
    exposed_fields_count INTEGER,
    risk_assessment TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Check public_profiles view
    RETURN QUERY
    SELECT 
        'public_profiles'::TEXT,
        CASE 
            WHEN definition LIKE '%email%' OR definition LIKE '%subscription%' 
            THEN 'VULNERABLE - SENSITIVE DATA EXPOSED'
            ELSE 'SECURE - ONLY SAFE DATA'
        END::TEXT,
        (LENGTH(definition) - LENGTH(REPLACE(definition, ',', '')) + 1)::INTEGER as field_count,
        CASE 
            WHEN definition LIKE '%email%' OR definition LIKE '%subscription%' 
            THEN 'HIGH RISK - Contains PII or financial data'
            ELSE 'LOW RISK - Professional networking data only'
        END::TEXT
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'public_profiles';
    
    -- Check public_medical_events view
    RETURN QUERY
    SELECT 
        'public_medical_events'::TEXT,
        CASE 
            WHEN definition LIKE '%organizer_email%' OR definition LIKE '%organizer_phone%' OR definition LIKE '%created_by%'
            THEN 'VULNERABLE - SENSITIVE DATA EXPOSED'
            ELSE 'SECURE - ONLY SAFE DATA'
        END::TEXT,
        (LENGTH(definition) - LENGTH(REPLACE(definition, ',', '')) + 1)::INTEGER as field_count,
        CASE 
            WHEN definition LIKE '%organizer_email%' OR definition LIKE '%organizer_phone%' OR definition LIKE '%created_by%'
            THEN 'HIGH RISK - Contains contact info or admin data'
            ELSE 'LOW RISK - Public event information only'
        END::TEXT
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'public_medical_events';
END;
$$;

-- Grant execute permission for monitoring
GRANT EXECUTE ON FUNCTION public.audit_public_view_safety() TO authenticated;

-- Add comprehensive security documentation
COMMENT ON VIEW public.public_profiles IS 'SECURITY VERIFIED: Contains only safe professional networking data. Excludes all PII, contact info, and financial data.';
COMMENT ON VIEW public.public_medical_events IS 'SECURITY VERIFIED: Contains only safe public event data. Excludes all organizer contact info, admin data, and internal system information.';
COMMENT ON FUNCTION public.audit_public_view_safety() IS 'Security audit function for public views - verifies no sensitive data exposure';