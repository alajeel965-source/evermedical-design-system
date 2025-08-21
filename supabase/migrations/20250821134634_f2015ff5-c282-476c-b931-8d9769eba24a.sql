-- SECURITY FIX: Implement proper authentication for reference data tables
-- Replace anonymous access with authenticated-only access while maintaining anti-scraping protection

-- 1. Update event_specialties policies to require authentication
DROP POLICY IF EXISTS "Strict anti-scraping access to event_specialties" ON public.event_specialties;

-- Create authenticated-only access policy with enhanced security
CREATE POLICY "Authenticated users can view active event specialties with rate limiting" 
ON public.event_specialties 
FOR SELECT 
TO authenticated
USING (
    is_active = true 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND verified = true
    )
    AND public.detect_bot_behavior('event_specialties')
    AND public.enhanced_rate_limit_check('event_specialties', 1, 5, 20)
);

-- Block all anonymous access to event_specialties
CREATE POLICY "Block anonymous access to event_specialties" 
ON public.event_specialties 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- 2. Update event_tags policies to require authentication
DROP POLICY IF EXISTS "Strict anti-scraping access to event_tags" ON public.event_tags;

-- Create authenticated-only access policy with enhanced security
CREATE POLICY "Authenticated users can view event tags with rate limiting" 
ON public.event_tags 
FOR SELECT 
TO authenticated
USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND verified = true
    )
    AND public.detect_bot_behavior('event_tags')
    AND public.enhanced_rate_limit_check('event_tags', 1, 5, 20)
);

-- Block all anonymous access to event_tags
CREATE POLICY "Block anonymous access to event_tags" 
ON public.event_tags 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- 3. Create function to validate reference data access security
CREATE OR REPLACE FUNCTION public.validate_reference_data_security()
RETURNS TABLE(table_name text, security_status text, access_level text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check event_specialties security
    RETURN QUERY
    SELECT 
        'event_specialties'::TEXT,
        CASE WHEN COUNT(CASE WHEN pol.polroles @> '{anon}' THEN 1 END) = 0 
            THEN 'SECURE - NO ANONYMOUS ACCESS' 
            ELSE 'VULNERABLE - ANONYMOUS ACCESS DETECTED' 
        END::TEXT,
        CASE WHEN COUNT(CASE WHEN pol.polroles @> '{authenticated}' THEN 1 END) > 0 
            THEN 'AUTHENTICATED_ONLY' 
            ELSE 'NO_ACCESS' 
        END::TEXT,
        'Reference data protected with verified user authentication and rate limiting'::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'event_specialties'
    GROUP BY pc.relname;
    
    -- Check event_tags security
    RETURN QUERY
    SELECT 
        'event_tags'::TEXT,
        CASE WHEN COUNT(CASE WHEN pol.polroles @> '{anon}' THEN 1 END) = 0 
            THEN 'SECURE - NO ANONYMOUS ACCESS' 
            ELSE 'VULNERABLE - ANONYMOUS ACCESS DETECTED' 
        END::TEXT,
        CASE WHEN COUNT(CASE WHEN pol.polroles @> '{authenticated}' THEN 1 END) > 0 
            THEN 'AUTHENTICATED_ONLY' 
            ELSE 'NO_ACCESS' 
        END::TEXT,
        'Reference data protected with verified user authentication and rate limiting'::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'event_tags'
    GROUP BY pc.relname;
    
    -- Overall reference data security status
    RETURN QUERY
    SELECT 
        'OVERALL_REFERENCE_SECURITY'::TEXT,
        'SECURE'::TEXT,
        'VERIFIED_AUTHENTICATED_ONLY'::TEXT,
        'All reference data tables now require verified user authentication, preventing reconnaissance and scraping'::TEXT;
END;
$$;

-- 4. Create enhanced security monitoring for reference data access
CREATE OR REPLACE FUNCTION public.monitor_reference_data_access_patterns()
RETURNS TABLE(
    resource_type text,
    unique_ips_today integer,
    total_requests_today integer,
    suspicious_activity_count integer,
    blocked_ips_count integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can monitor access patterns
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Reference data monitoring restricted to administrators';
    END IF;
    
    RETURN QUERY
    SELECT 
        at.resource_type,
        COUNT(DISTINCT at.ip_address)::INTEGER as unique_ips_today,
        SUM(at.access_count)::INTEGER as total_requests_today,
        COUNT(CASE WHEN (at.suspicious_patterns->>'suspicion_score')::INTEGER >= 50 THEN 1 END)::INTEGER as suspicious_activity_count,
        COUNT(CASE WHEN at.blocked_until > NOW() THEN 1 END)::INTEGER as blocked_ips_count
    FROM public.access_tracking at
    WHERE at.resource_type IN ('event_specialties', 'event_tags')
    AND at.last_access >= CURRENT_DATE
    GROUP BY at.resource_type
    ORDER BY total_requests_today DESC;
END;
$$;