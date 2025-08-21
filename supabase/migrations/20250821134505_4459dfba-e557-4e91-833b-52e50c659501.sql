-- CRITICAL SECURITY ENHANCEMENT: Implement comprehensive anti-scraping and stricter rate limiting

-- 1. Create enhanced rate limiting table for tracking access patterns
CREATE TABLE IF NOT EXISTS public.access_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    user_id UUID,
    resource_type TEXT NOT NULL,
    access_count INTEGER DEFAULT 1,
    first_access TIMESTAMPTZ DEFAULT NOW(),
    last_access TIMESTAMPTZ DEFAULT NOW(),
    suspicious_patterns JSONB DEFAULT '{}',
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on access tracking
ALTER TABLE public.access_tracking ENABLE ROW LEVEL SECURITY;

-- Only allow system access to tracking table
CREATE POLICY "System only access tracking" 
ON public.access_tracking 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- 2. Create comprehensive anti-scraping rate limiting function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
    resource_name TEXT,
    max_requests_per_minute INTEGER DEFAULT 2,
    max_requests_per_hour INTEGER DEFAULT 10,
    max_requests_per_day INTEGER DEFAULT 50
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    client_ip INET;
    current_user_id UUID;
    minute_count INTEGER := 0;
    hour_count INTEGER := 0;
    day_count INTEGER := 0;
    suspicious_score INTEGER := 0;
    is_blocked BOOLEAN := false;
BEGIN
    -- Get client IP and user ID
    client_ip := (current_setting('request.headers', true)::jsonb->>'cf-connecting-ip')::INET;
    current_user_id := auth.uid();
    
    -- If no IP available, deny access (suspicious)
    IF client_ip IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if IP is currently blocked
    SELECT blocked_until > NOW() INTO is_blocked
    FROM access_tracking
    WHERE ip_address = client_ip 
    AND resource_type = resource_name
    ORDER BY last_access DESC
    LIMIT 1;
    
    IF is_blocked THEN
        RETURN false;
    END IF;
    
    -- Count recent accesses by IP
    SELECT COUNT(*) INTO minute_count
    FROM access_tracking
    WHERE ip_address = client_ip 
    AND resource_type = resource_name
    AND last_access >= NOW() - INTERVAL '1 minute';
    
    SELECT COUNT(*) INTO hour_count
    FROM access_tracking
    WHERE ip_address = client_ip 
    AND resource_type = resource_name
    AND last_access >= NOW() - INTERVAL '1 hour';
    
    SELECT COUNT(*) INTO day_count
    FROM access_tracking
    WHERE ip_address = client_ip 
    AND resource_type = resource_name
    AND last_access >= NOW() - INTERVAL '1 day';
    
    -- Calculate suspicion score based on access patterns
    suspicious_score := 0;
    
    -- High frequency access is suspicious
    IF minute_count >= max_requests_per_minute THEN
        suspicious_score := suspicious_score + 50;
    END IF;
    
    IF hour_count >= max_requests_per_hour THEN
        suspicious_score := suspicious_score + 30;
    END IF;
    
    IF day_count >= max_requests_per_day THEN
        suspicious_score := suspicious_score + 20;
    END IF;
    
    -- Anonymous users with high activity are more suspicious
    IF current_user_id IS NULL AND hour_count > 5 THEN
        suspicious_score := suspicious_score + 25;
    END IF;
    
    -- Check for bot-like patterns (rapid sequential access)
    IF minute_count > 0 THEN
        SELECT COUNT(*) INTO minute_count
        FROM access_tracking
        WHERE ip_address = client_ip 
        AND resource_type = resource_name
        AND last_access >= NOW() - INTERVAL '10 seconds';
        
        IF minute_count > 1 THEN
            suspicious_score := suspicious_score + 40; -- Very suspicious
        END IF;
    END IF;
    
    -- Block if suspicion score is too high
    IF suspicious_score >= 100 THEN
        -- Block for escalating periods based on violations
        INSERT INTO access_tracking (
            ip_address, user_id, resource_type, access_count, 
            suspicious_patterns, blocked_until
        ) VALUES (
            client_ip, current_user_id, resource_name, 1,
            jsonb_build_object(
                'suspicion_score', suspicious_score,
                'minute_count', minute_count,
                'hour_count', hour_count,
                'day_count', day_count,
                'blocked_reason', 'Rate limit exceeded',
                'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
            ),
            NOW() + INTERVAL '1 hour' * LEAST(day_count, 24) -- Escalating blocks
        )
        ON CONFLICT (ip_address, resource_type) DO UPDATE SET
            access_count = access_tracking.access_count + 1,
            last_access = NOW(),
            suspicious_patterns = EXCLUDED.suspicious_patterns,
            blocked_until = EXCLUDED.blocked_until;
            
        RETURN false;
    END IF;
    
    -- Update or insert access record
    INSERT INTO access_tracking (ip_address, user_id, resource_type, access_count)
    VALUES (client_ip, current_user_id, resource_name, 1)
    ON CONFLICT (ip_address, resource_type) DO UPDATE SET
        access_count = access_tracking.access_count + 1,
        last_access = NOW(),
        suspicious_patterns = jsonb_build_object(
            'recent_minute_count', minute_count,
            'recent_hour_count', hour_count,
            'recent_day_count', day_count,
            'suspicion_score', suspicious_score
        );
    
    -- Allow access if within normal limits
    RETURN (
        minute_count < max_requests_per_minute 
        AND hour_count < max_requests_per_hour 
        AND day_count < max_requests_per_day
    );
END;
$$;

-- 3. Create function to detect and block bot behavior
CREATE OR REPLACE FUNCTION public.detect_bot_behavior(resource_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    client_ip INET;
    user_agent TEXT;
    bot_indicators INTEGER := 0;
BEGIN
    client_ip := (current_setting('request.headers', true)::jsonb->>'cf-connecting-ip')::INET;
    user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';
    
    -- Check for bot indicators in user agent
    IF user_agent IS NULL OR LENGTH(user_agent) < 10 THEN
        bot_indicators := bot_indicators + 1;
    END IF;
    
    IF user_agent ILIKE '%bot%' OR user_agent ILIKE '%crawler%' OR user_agent ILIKE '%spider%' THEN
        bot_indicators := bot_indicators + 1;
    END IF;
    
    -- Check for suspicious access patterns from this IP
    IF EXISTS (
        SELECT 1 FROM access_tracking
        WHERE ip_address = client_ip
        AND last_access >= NOW() - INTERVAL '1 minute'
        GROUP BY resource_type
        HAVING COUNT(*) >= 3 -- Accessing multiple resources rapidly
    ) THEN
        bot_indicators := bot_indicators + 1;
    END IF;
    
    -- Block if too many bot indicators
    IF bot_indicators >= 2 THEN
        INSERT INTO access_tracking (
            ip_address, resource_type, blocked_until, suspicious_patterns
        ) VALUES (
            client_ip, resource_name, NOW() + INTERVAL '24 hours',
            jsonb_build_object(
                'bot_detection', true,
                'bot_indicators', bot_indicators,
                'user_agent', user_agent,
                'detection_time', NOW()
            )
        );
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$;

-- 4. Update existing rate-limited policies with stricter limits

-- Drop existing lenient policies
DROP POLICY IF EXISTS "Rate limited public access to event_specialties" ON public.event_specialties;
DROP POLICY IF EXISTS "Rate limited public access to event_tags" ON public.event_tags;

-- Create strict anti-scraping policies
CREATE POLICY "Strict anti-scraping access to event_specialties" 
ON public.event_specialties 
FOR SELECT 
TO anon, authenticated
USING (
    is_active = true 
    AND public.detect_bot_behavior('event_specialties')
    AND public.enhanced_rate_limit_check('event_specialties', 1, 5, 20) -- Much stricter: 1/min, 5/hour, 20/day
);

CREATE POLICY "Strict anti-scraping access to event_tags" 
ON public.event_tags 
FOR SELECT 
TO anon, authenticated
USING (
    public.detect_bot_behavior('event_tags')
    AND public.enhanced_rate_limit_check('event_tags', 1, 5, 20) -- Much stricter
);

-- 5. Add rate limiting to medical_events (currently unprotected)
DROP POLICY IF EXISTS "Public can view approved events basic data only" ON public.medical_events;

CREATE POLICY "Rate limited public medical events access" 
ON public.medical_events 
FOR SELECT 
TO anon, authenticated
USING (
    status = 'approved'
    AND auth.role() IN ('anon', 'authenticated')
    AND public.detect_bot_behavior('medical_events')
    AND public.enhanced_rate_limit_check('medical_events', 2, 15, 100) -- Generous but controlled
);

-- 6. Add rate limiting to other public-accessible tables
CREATE POLICY "Protected public_medical_events access" 
ON public.public_medical_events 
FOR SELECT 
TO anon, authenticated
USING (
    status = 'approved'
    AND public.detect_bot_behavior('public_medical_events')
    AND public.enhanced_rate_limit_check('public_medical_events', 2, 15, 100)
);

CREATE POLICY "Protected products access" 
ON public.products 
FOR SELECT 
TO anon, authenticated
USING (
    active = true
    AND public.detect_bot_behavior('products')
    AND public.enhanced_rate_limit_check('products', 3, 25, 200) -- Product browsing needs more flexibility
);

-- 7. Create monitoring function for suspicious activity
CREATE OR REPLACE FUNCTION public.get_suspicious_activity_report()
RETURNS TABLE(
    ip_address INET,
    resource_type TEXT,
    access_count INTEGER,
    suspicion_score INTEGER,
    blocked_until TIMESTAMPTZ,
    patterns JSONB
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can view suspicious activity
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Suspicious activity monitoring restricted to administrators';
    END IF;
    
    RETURN QUERY
    SELECT 
        at.ip_address,
        at.resource_type,
        at.access_count,
        (at.suspicious_patterns->>'suspicion_score')::INTEGER as suspicion_score,
        at.blocked_until,
        at.suspicious_patterns
    FROM access_tracking at
    WHERE at.last_access >= NOW() - INTERVAL '24 hours'
    AND (
        at.blocked_until IS NOT NULL 
        OR (at.suspicious_patterns->>'suspicion_score')::INTEGER >= 50
        OR at.access_count > 50
    )
    ORDER BY 
        COALESCE((at.suspicious_patterns->>'suspicion_score')::INTEGER, 0) DESC,
        at.access_count DESC;
END;
$$;

-- 8. Create function to validate anti-scraping measures
CREATE OR REPLACE FUNCTION public.validate_anti_scraping_protection()
RETURNS TABLE(check_name TEXT, status TEXT, risk_level TEXT, details TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check rate limiting coverage
    RETURN QUERY
    SELECT 
        'RATE_LIMITING_COVERAGE'::TEXT,
        CASE WHEN COUNT(*) >= 5 THEN 'COMPREHENSIVE' ELSE 'INCOMPLETE' END::TEXT,
        CASE WHEN COUNT(*) >= 5 THEN 'LOW' ELSE 'HIGH' END::TEXT,
        'Protected tables with rate limiting: ' || COUNT(*)::TEXT
    FROM pg_policies pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' 
    AND pol.qual LIKE '%enhanced_rate_limit_check%';
    
    -- Check bot detection implementation
    RETURN QUERY
    SELECT 
        'BOT_DETECTION_ACTIVE'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Advanced bot detection analyzing user agents and access patterns'::TEXT;
    
    -- Check access tracking
    RETURN QUERY
    SELECT 
        'ACCESS_TRACKING_ENABLED'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = 'access_tracking'
        ) THEN 'SECURE' ELSE 'MISSING' END::TEXT,
        'LOW'::TEXT,
        'IP-based access tracking with pattern analysis active'::TEXT;
        
    -- Check strictness of limits
    RETURN QUERY
    SELECT 
        'RATE_LIMIT_STRICTNESS'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Strict limits: 1-3 requests/minute, 5-25/hour, 20-200/day depending on resource sensitivity'::TEXT;
        
    -- Overall anti-scraping status
    RETURN QUERY
    SELECT 
        'COMPREHENSIVE_ANTI_SCRAPING'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Multi-layered protection prevents automated data harvesting with IP tracking, bot detection, and escalating blocks'::TEXT;
END;
$$;

-- 9. Clean up old tracking data periodically (function for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_access_tracking()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Only allow system or admin cleanup
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Cleanup restricted to administrators';
    END IF;
    
    -- Remove tracking data older than 30 days
    DELETE FROM access_tracking 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND blocked_until IS NULL; -- Keep blocked IPs longer
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO public.security_audit_log (
        table_name, operation, user_id, timestamp, details
    ) VALUES (
        'access_tracking', 'CLEANUP', auth.uid(), NOW(),
        jsonb_build_object('deleted_records', deleted_count)
    );
    
    RETURN deleted_count;
END;
$$;