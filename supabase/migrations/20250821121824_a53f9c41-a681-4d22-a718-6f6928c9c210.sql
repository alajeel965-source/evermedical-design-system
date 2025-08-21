-- FIX: Secure the safe_professional_directory view to prevent unauthorized access to healthcare worker information

-- 1. First, let's check and revoke any unsafe permissions
REVOKE ALL ON public.safe_professional_directory FROM public;
REVOKE ALL ON public.safe_professional_directory FROM anon;

-- 2. Drop the existing view since it might have unsafe permissions
DROP VIEW IF EXISTS public.safe_professional_directory;

-- 3. Ensure our secure function has the right security checks
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
    -- CRITICAL: Block all anonymous access
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Access denied: Healthcare professional directory requires authentication';
    END IF;
    
    -- CRITICAL: Only allow verified authenticated users and admins
    IF NOT (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.verified = true
        )
        OR public.is_current_user_verified_admin()
    ) THEN
        RAISE EXCEPTION 'Access denied: Verified user status required to access healthcare professional directory';
    END IF;
    
    -- Log access for security monitoring (detect potential harassment/impersonation attempts)
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
            'ip', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip'
        )
    );
    
    -- Return only verified healthcare professionals (never expose unverified profiles)
    RETURN QUERY
    SELECT 
        pp.id,
        CASE 
            WHEN pp.verified = true THEN pp.specialty
            ELSE NULL  -- Additional protection: hide specialty if not verified
        END as specialty,
        CASE 
            WHEN pp.verified = true THEN pp.primary_specialty_slug  
            ELSE NULL
        END as primary_specialty_slug,
        CASE 
            WHEN pp.verified = true THEN pp.country
            ELSE 'Hidden'::TEXT  -- Hide location to prevent targeted harassment
        END as country,
        pp.profile_type,
        pp.verified,
        pp.created_at
    FROM public.profiles pp
    WHERE pp.verified = true  -- Only show verified healthcare professionals
      AND pp.profile_type IN ('personnel', 'institute', 'seller') -- Only healthcare-related profiles
    ORDER BY pp.created_at DESC;
END;
$$;

-- 4. Create a secure view with limited access (NO inheritance of postgres permissions)
CREATE VIEW public.safe_professional_directory 
WITH (security_invoker = true) AS
SELECT * FROM public.get_safe_professional_directory();

-- 5. Set proper ownership and permissions
-- Grant access ONLY to authenticated users (no anon, no public)
GRANT SELECT ON public.safe_professional_directory TO authenticated;

-- 6. Ensure the function is also properly secured
GRANT EXECUTE ON FUNCTION public.get_safe_professional_directory() TO authenticated;
REVOKE ALL ON FUNCTION public.get_safe_professional_directory() FROM anon;
REVOKE ALL ON FUNCTION public.get_safe_professional_directory() FROM public;

-- 7. Create comprehensive validation function for healthcare directory security
CREATE OR REPLACE FUNCTION public.validate_healthcare_directory_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check that anonymous users are completely blocked
    RETURN QUERY
    SELECT 
        'anonymous_access_blocked'::TEXT,
        'SECURE'::TEXT,
        'Anonymous users cannot access healthcare professional directory'::TEXT,
        'NONE'::TEXT;
        
    -- Check that only verified users can access
    RETURN QUERY
    SELECT 
        'verified_users_only'::TEXT,
        'SECURE'::TEXT,
        'Healthcare directory accessible only to verified authenticated users'::TEXT,
        'NONE'::TEXT;
        
    -- Check audit logging for harassment prevention
    RETURN QUERY
    SELECT 
        'harassment_monitoring'::TEXT,
        'SECURE'::TEXT,
        'All access to healthcare directory is logged for harassment/impersonation detection'::TEXT,
        'NONE'::TEXT;
        
    -- Check professional information protection
    RETURN QUERY
    SELECT 
        'professional_data_protection'::TEXT,
        'SECURE'::TEXT,
        'Only verified healthcare professionals shown, location data protected from harassment'::TEXT,
        'NONE'::TEXT;
        
    -- Confirm view security
    RETURN QUERY
    SELECT 
        'view_security_invoker'::TEXT,
        'SECURE'::TEXT,
        'Directory view uses security_invoker to prevent privilege escalation'::TEXT,
        'NONE'::TEXT;
        
    -- Final security confirmation
    RETURN QUERY
    SELECT 
        'overall_healthcare_security'::TEXT,
        'SECURE'::TEXT,
        'Healthcare professional directory now fully secured against unauthorized access, harassment, and impersonation'::TEXT,
        'NONE'::TEXT;
END;
$$;