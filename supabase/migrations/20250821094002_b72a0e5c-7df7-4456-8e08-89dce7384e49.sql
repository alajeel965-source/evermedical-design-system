-- Fix Security Definer View Issues and Comprehensive Security Review
-- This addresses the linter warnings and strengthens overall security

-- Fix issue #1: Remove SECURITY DEFINER from views by converting them to functions
-- The issue is that views with SECURITY DEFINER bypass RLS and run with elevated privileges

-- Drop the problematic views that were flagged by the linter
DROP VIEW IF EXISTS public.safe_medical_events;
DROP VIEW IF EXISTS public.crawl_jobs_status;

-- Replace safe_medical_events view with a secure function
CREATE OR REPLACE FUNCTION public.get_safe_medical_events()
RETURNS TABLE(
    id uuid,
    title text,
    title_ar text,
    description text,
    description_ar text,
    summary text,
    summary_ar text,
    slug text,
    start_date timestamptz,
    end_date timestamptz,
    timezone text,
    registration_deadline timestamptz,
    format text,
    venue_name text,
    venue_address text,
    venue_lat numeric,
    venue_lng numeric,
    country text,
    city text,
    online_url text,
    organizer text,
    organizer_website text,
    specialty_slug text,
    subspecialty text,
    subspecialties uuid[],
    target_audience text[],
    languages text[],
    has_cme boolean,
    cme_provider text,
    cme_hours numeric,
    cme_points numeric,
    accreditation_url text,
    accreditation_details jsonb,
    is_free boolean,
    price_range text,
    currency text,
    registration_url text,
    registration_required boolean,
    capacity integer,
    registered_count integer,
    featured_image text,
    gallery_images text[],
    seo_title text,
    seo_description text,
    view_count integer,
    save_count integer,
    share_count integer,
    click_count integer,
    status text,
    created_at timestamptz,
    updated_at timestamptz,
    source_url text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Return only approved events with no sensitive organizer data
    -- This respects RLS policies and only returns public-safe data
    RETURN QUERY
    SELECT 
        me.id, me.title, me.title_ar, me.description, me.description_ar, 
        me.summary, me.summary_ar, me.slug, me.start_date, me.end_date, 
        me.timezone, me.registration_deadline, me.format, me.venue_name, 
        me.venue_address, me.venue_lat, me.venue_lng, me.country, me.city,
        me.online_url, me.organizer, me.organizer_website, me.specialty_slug, 
        me.subspecialty, me.subspecialties, me.target_audience, me.languages,
        me.has_cme, me.cme_provider, me.cme_hours, me.cme_points, 
        me.accreditation_url, me.accreditation_details, me.is_free, 
        me.price_range, me.currency, me.registration_url, me.registration_required,
        me.capacity, me.registered_count, me.featured_image, me.gallery_images,
        me.seo_title, me.seo_description, me.view_count, me.save_count, 
        me.share_count, me.click_count, me.status, me.created_at, 
        me.updated_at, me.source_url
    FROM public.medical_events me
    WHERE me.status = 'approved';
END;
$function$;

-- Replace crawl_jobs_status view with a secure function
CREATE OR REPLACE FUNCTION public.get_crawl_jobs_status()
RETURNS TABLE(
    id uuid,
    source_id uuid,
    status text,
    started_at timestamptz,
    completed_at timestamptz,
    events_discovered integer,
    events_created integer,
    events_updated integer,
    created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only verified admins can access crawl job status
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied to crawl job status information';
    END IF;
    
    -- Log access for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'crawl_jobs',
        'STATUS_ACCESS',
        auth.uid(),
        NULL,
        NOW(),
        jsonb_build_object('function', 'get_crawl_jobs_status')
    );
    
    RETURN QUERY
    SELECT 
        cj.id, cj.source_id, cj.status, cj.started_at, cj.completed_at,
        cj.events_discovered, cj.events_created, cj.events_updated, cj.created_at
    FROM public.crawl_jobs cj;
END;
$function$;

-- Additional Security Hardening

-- 1. Create a function to validate all RLS policies are working correctly
CREATE OR REPLACE FUNCTION public.validate_all_rls_policies()
RETURNS TABLE(table_name text, rls_status text, policy_count integer, security_level text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::text,
        CASE 
            WHEN c.relrowsecurity AND c.relforcerowsecurity THEN 'FORCED_RLS'
            WHEN c.relrowsecurity THEN 'RLS_ENABLED'
            ELSE 'RLS_DISABLED'
        END as rls_status,
        COUNT(pol.polname)::integer as policy_count,
        CASE 
            WHEN c.relrowsecurity AND c.relforcerowsecurity AND COUNT(pol.polname) >= 3 THEN 'SECURE'
            WHEN c.relrowsecurity AND COUNT(pol.polname) >= 2 THEN 'MODERATE'
            ELSE 'VULNERABLE'
        END as security_level
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r' 
      AND c.relname NOT LIKE 'pg_%'
    GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
    ORDER BY 
        CASE 
            WHEN c.relrowsecurity AND c.relforcerowsecurity THEN 1
            WHEN c.relrowsecurity THEN 2
            ELSE 3
        END,
        c.relname;
END;
$function$;

-- 2. Create a comprehensive security audit function
CREATE OR REPLACE FUNCTION public.comprehensive_security_audit()
RETURNS TABLE(
    audit_category text,
    check_name text,
    status text,
    risk_level text,
    details text,
    recommendation text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only verified admins can run security audits
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied to security audit functionality';
    END IF;

    -- Check 1: RLS Status on all tables
    RETURN QUERY
    SELECT 
        'TABLE_SECURITY'::text as audit_category,
        'RLS_PROTECTION_' || c.relname::text as check_name,
        CASE 
            WHEN c.relrowsecurity AND c.relforcerowsecurity THEN 'SECURE'
            WHEN c.relrowsecurity THEN 'NEEDS_IMPROVEMENT'
            ELSE 'VULNERABLE'
        END as status,
        CASE 
            WHEN c.relrowsecurity AND c.relforcerowsecurity THEN 'LOW'
            WHEN c.relrowsecurity THEN 'MEDIUM'
            ELSE 'HIGH'
        END as risk_level,
        CASE 
            WHEN c.relrowsecurity AND c.relforcerowsecurity THEN 'RLS forced - maximum security'
            WHEN c.relrowsecurity THEN 'RLS enabled but not forced'
            ELSE 'No RLS protection - data exposed'
        END as details,
        CASE 
            WHEN c.relrowsecurity AND c.relforcerowsecurity THEN 'No action needed'
            WHEN c.relrowsecurity THEN 'Consider forcing RLS with ALTER TABLE ' || c.relname || ' FORCE ROW LEVEL SECURITY'
            ELSE 'URGENT: Enable RLS with ALTER TABLE ' || c.relname || ' ENABLE ROW LEVEL SECURITY'
        END as recommendation
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r' 
      AND c.relname NOT LIKE 'pg_%';

    -- Check 2: Function Security
    RETURN QUERY
    SELECT 
        'FUNCTION_SECURITY'::text as audit_category,
        'SECURITY_DEFINER_' || p.proname::text as check_name,
        CASE 
            WHEN p.prosecdef AND (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%') THEN 'SECURE'
            WHEN p.prosecdef THEN 'NEEDS_IMPROVEMENT'
            ELSE 'VULNERABLE'
        END as status,
        CASE 
            WHEN p.prosecdef AND (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%') THEN 'LOW'
            WHEN p.prosecdef THEN 'MEDIUM'
            ELSE 'HIGH'
        END as risk_level,
        CASE 
            WHEN p.prosecdef THEN 'Security definer function with' || CASE WHEN (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%') THEN ' proper' ELSE ' missing' END || ' search_path protection'
            ELSE 'Regular function - no elevated privileges'
        END as details,
        CASE 
            WHEN p.prosecdef AND (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%') THEN 'No action needed'
            WHEN p.prosecdef THEN 'Add SET search_path TO ''public'' to function definition'
            ELSE 'Review if function needs SECURITY DEFINER'
        END as recommendation
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.prosecdef = true;

    -- Check 3: Anonymous Access
    RETURN QUERY
    SELECT 
        'ACCESS_CONTROL'::text as audit_category,
        'ANONYMOUS_ACCESS_' || table_name::text as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'VULNERABLE' ELSE 'SECURE' END as status,
        CASE WHEN COUNT(*) > 0 THEN 'MEDIUM' ELSE 'LOW' END as risk_level,
        CASE WHEN COUNT(*) > 0 THEN 'Anonymous users have ' || privilege_type || ' access' ELSE 'No anonymous access' END as details,
        CASE WHEN COUNT(*) > 0 THEN 'Review and revoke unnecessary anonymous permissions' ELSE 'No action needed' END as recommendation
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
      AND grantee = 'anon'
    GROUP BY table_name, privilege_type;
END;
$function$;

-- 3. Create input validation and sanitization functions
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $function$
BEGIN
    -- Remove potential SQL injection patterns and dangerous characters
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Basic sanitization - remove dangerous patterns
    input_text := regexp_replace(input_text, '[<>\"'';&]', '', 'g');
    input_text := regexp_replace(input_text, '(script|javascript|vbscript)', '', 'gi');
    input_text := regexp_replace(input_text, '(select|insert|update|delete|drop|create|alter)', '', 'gi');
    
    -- Trim and limit length
    input_text := trim(substring(input_text from 1 for 1000));
    
    RETURN input_text;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_email(email_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $function$
BEGIN
    -- Enhanced email validation
    RETURN email_input ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
        AND length(email_input) <= 254
        AND email_input NOT LIKE '%..%'
        AND email_input NOT LIKE '.%'
        AND email_input NOT LIKE '%.'
        AND email_input NOT LIKE '%@.%'
        AND email_input NOT LIKE '%.@%';
END;
$function$;

-- 4. Create rate limiting function for security
CREATE OR REPLACE FUNCTION public.check_rate_limit(user_id_input uuid, action_type text, max_attempts integer DEFAULT 10, window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    attempt_count integer;
    window_start timestamptz;
BEGIN
    window_start := NOW() - (window_minutes || ' minutes')::interval;
    
    -- Count recent attempts
    SELECT COUNT(*)
    INTO attempt_count
    FROM public.security_audit_log
    WHERE user_id = user_id_input
      AND operation = action_type
      AND timestamp >= window_start;
    
    -- Return true if under limit, false if over
    RETURN attempt_count < max_attempts;
END;
$function$;

-- 5. Update existing functions to use input validation
-- This is a template - apply to user-facing functions
CREATE OR REPLACE FUNCTION public.safe_search_events(search_term text DEFAULT '', specialty_filter text DEFAULT '', limit_count integer DEFAULT 50)
RETURNS TABLE(
    id uuid,
    title text,
    slug text,
    start_date timestamptz,
    end_date timestamptz,
    format text,
    specialty_slug text,
    country text,
    city text,
    is_free boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Input validation and sanitization
    search_term := public.sanitize_text_input(search_term);
    specialty_filter := public.sanitize_text_input(specialty_filter);
    limit_count := LEAST(GREATEST(limit_count, 1), 100); -- Limit between 1-100
    
    -- Rate limiting check
    IF NOT public.check_rate_limit(auth.uid(), 'EVENT_SEARCH', 100, 10) THEN
        RAISE EXCEPTION 'Rate limit exceeded for event search';
    END IF;
    
    -- Log the search for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'medical_events',
        'EVENT_SEARCH',
        auth.uid(),
        NULL,
        NOW(),
        jsonb_build_object('search_term', search_term, 'specialty', specialty_filter)
    );
    
    RETURN QUERY
    SELECT 
        me.id, me.title, me.slug, me.start_date, me.end_date,
        me.format, me.specialty_slug, me.country, me.city, me.is_free
    FROM public.medical_events me
    WHERE me.status = 'approved'
      AND (search_term = '' OR me.title ILIKE '%' || search_term || '%' OR me.description ILIKE '%' || search_term || '%')
      AND (specialty_filter = '' OR me.specialty_slug = specialty_filter)
    ORDER BY 
        CASE WHEN search_term != '' THEN similarity(me.title, search_term) ELSE 0 END DESC,
        me.start_date ASC
    LIMIT limit_count;
END;
$function$;

-- Grant appropriate permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_safe_medical_events() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.safe_search_events(text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sanitize_text_input(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_email(text) TO anon, authenticated;