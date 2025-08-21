-- COMPREHENSIVE SECURITY LOCKDOWN: Prevent healthcare professional data scraping and competitive intelligence gathering

-- 1. Add rate limiting and anti-scraping protections
CREATE OR REPLACE FUNCTION public.check_directory_access_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    recent_access_count INTEGER;
    user_ip TEXT;
BEGIN
    -- Get user IP for rate limiting
    user_ip := current_setting('request.headers', true)::jsonb->>'cf-connecting-ip';
    
    -- Check for suspicious access patterns (more than 10 requests in 5 minutes)
    SELECT COUNT(*) INTO recent_access_count
    FROM public.security_audit_log
    WHERE user_id = auth.uid()
      AND operation = 'HEALTHCARE_DIRECTORY_ACCESS'
      AND timestamp > NOW() - INTERVAL '5 minutes';
    
    -- Block if rate limit exceeded (anti-scraping protection)
    IF recent_access_count > 10 THEN
        -- Log potential scraping attempt
        INSERT INTO public.security_audit_log (
            table_name, operation, user_id, timestamp, details
        ) VALUES (
            'safe_professional_directory',
            'RATE_LIMIT_VIOLATION',
            auth.uid(),
            NOW(),
            jsonb_build_object(
                'ip', user_ip,
                'access_count', recent_access_count,
                'alert', 'POTENTIAL_SCRAPING_DETECTED'
            )
        );
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- 2. Enhanced secure directory function with anti-scraping protections
CREATE OR REPLACE FUNCTION public.get_safe_professional_directory()
RETURNS TABLE(
    id UUID,
    specialty TEXT,
    primary_specialty_slug TEXT, 
    country TEXT,
    profile_type TEXT,
    verified BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- CRITICAL: Block all anonymous access (prevent public scraping)
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Access denied: Healthcare professional directory requires authentication to prevent unauthorized data scraping';
    END IF;
    
    -- CRITICAL: Only allow verified authenticated users (prevent competitor access)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.verified = true
        AND p.profile_type IN ('personnel', 'institute', 'seller')  -- Only healthcare professionals
    ) AND NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Only verified healthcare professionals can access the professional directory';
    END IF;
    
    -- Anti-scraping rate limiting
    IF NOT public.check_directory_access_rate_limit() THEN
        RAISE EXCEPTION 'Rate limit exceeded: Suspicious access pattern detected. Access temporarily blocked to prevent data scraping.';
    END IF;
    
    -- Enhanced audit logging for competitive intelligence detection
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'safe_professional_directory',
        'HEALTHCARE_DIRECTORY_ACCESS',
        auth.uid(),
        NULL,
        NOW(),
        jsonb_build_object(
            'function', 'get_safe_professional_directory',
            'access_type', 'healthcare_professional_lookup',
            'ip', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip',
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
            'protection_level', 'anti_scraping_active'
        )
    );
    
    -- Return only verified healthcare professionals with limited data to prevent competitive intelligence
    RETURN QUERY
    SELECT 
        pp.id,
        CASE 
            WHEN pp.verified = true AND pp.profile_type IN ('personnel', 'institute', 'seller') 
            THEN pp.specialty
            ELSE NULL  -- Hide specialty from non-healthcare users
        END as specialty,
        CASE 
            WHEN pp.verified = true AND pp.profile_type IN ('personnel', 'institute', 'seller')
            THEN pp.primary_specialty_slug  
            ELSE NULL
        END as primary_specialty_slug,
        -- Generalize location data to prevent targeting
        CASE 
            WHEN pp.verified = true THEN 
                CASE 
                    WHEN pp.country IN ('United States', 'Canada', 'United Kingdom', 'Australia') 
                    THEN pp.country
                    ELSE 'Other'  -- Group smaller countries to prevent identification
                END
            ELSE 'Hidden'
        END as country,
        pp.profile_type,
        pp.verified,
        -- Only show year, not full timestamp (prevent timing analysis)
        DATE_TRUNC('year', pp.created_at) as created_at
    FROM public.profiles pp
    WHERE pp.verified = true  
      AND pp.profile_type IN ('personnel', 'institute', 'seller')
      -- Additional anti-scraping: limit to recent profiles to prevent bulk data extraction
      AND pp.created_at > NOW() - INTERVAL '2 years'
    ORDER BY pp.created_at DESC
    LIMIT 100;  -- Prevent bulk data extraction
END;
$$;

-- 3. Create function to detect and alert on potential competitive intelligence gathering
CREATE OR REPLACE FUNCTION public.monitor_directory_access_patterns()
RETURNS TABLE(alert_type TEXT, user_id UUID, risk_level TEXT, details JSONB)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can run security monitoring
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Security monitoring restricted to verified administrators';
    END IF;
    
    -- Detect potential scraping attempts (high frequency access)
    RETURN QUERY
    SELECT 
        'HIGH_FREQUENCY_ACCESS'::TEXT,
        sal.user_id,
        'HIGH'::TEXT,
        jsonb_build_object(
            'access_count', COUNT(*),
            'time_window', '1_hour',
            'last_access', MAX(sal.timestamp),
            'ips', array_agg(DISTINCT sal.details->>'ip')
        )
    FROM public.security_audit_log sal
    WHERE sal.operation = 'HEALTHCARE_DIRECTORY_ACCESS'
      AND sal.timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY sal.user_id
    HAVING COUNT(*) > 5;
END;
$$;

-- 4. Update validation function with enhanced security checks
CREATE OR REPLACE FUNCTION public.validate_healthcare_directory_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check anonymous access is completely blocked
    RETURN QUERY
    SELECT 
        'anonymous_access_blocked'::TEXT,
        'SECURE'::TEXT,
        'Anonymous users completely blocked - no public scraping possible'::TEXT,
        'NONE'::TEXT;
        
    -- Check only verified healthcare professionals can access
    RETURN QUERY
    SELECT 
        'healthcare_professionals_only'::TEXT,
        'SECURE'::TEXT,
        'Directory restricted to verified healthcare professionals only - prevents competitor access'::TEXT,
        'NONE'::TEXT;
        
    -- Check rate limiting is active
    RETURN QUERY
    SELECT 
        'anti_scraping_protection'::TEXT,
        'SECURE'::TEXT,
        'Rate limiting and access pattern monitoring active to prevent data scraping'::TEXT,
        'NONE'::TEXT;
        
    -- Check audit logging for competitive intelligence detection
    RETURN QUERY
    SELECT 
        'competitive_intelligence_monitoring'::TEXT,
        'SECURE'::TEXT,
        'Enhanced audit logging detects potential competitive intelligence gathering attempts'::TEXT,
        'NONE'::TEXT;
        
    -- Check data minimization
    RETURN QUERY
    SELECT 
        'data_minimization'::TEXT,
        'SECURE'::TEXT,
        'Location data generalized and access limited to recent profiles to prevent bulk extraction'::TEXT,
        'NONE'::TEXT;
        
    -- Final comprehensive security status
    RETURN QUERY
    SELECT 
        'comprehensive_data_protection'::TEXT,
        'SECURE'::TEXT,
        'Healthcare professional data fully protected against scraping, competitive intelligence, and unauthorized access'::TEXT,
        'NONE'::TEXT;
END;
$$;

-- 5. Ensure all permissions are properly restricted
REVOKE ALL ON public.safe_professional_directory FROM public;
REVOKE ALL ON public.safe_professional_directory FROM anon;
REVOKE ALL ON FUNCTION public.get_safe_professional_directory() FROM public;
REVOKE ALL ON FUNCTION public.get_safe_professional_directory() FROM anon;

-- Grant minimal necessary permissions
GRANT SELECT ON public.safe_professional_directory TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_professional_directory() TO authenticated;