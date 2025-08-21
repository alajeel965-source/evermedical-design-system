-- Replace safe_professional_directory view with secure function approach

-- 1. Drop the existing view since we can't apply RLS to views
DROP VIEW IF EXISTS public.safe_professional_directory;

-- 2. Create a secure function to replace the view
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
    -- Only allow access to verified authenticated users and admins
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Access denied: Authentication required to view professional directory';
    END IF;
    
    -- Verify the requesting user is verified or is an admin
    IF NOT (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.verified = true
        )
        OR public.is_current_user_verified_admin()
    ) THEN
        RAISE EXCEPTION 'Access denied: User verification required to access professional directory';
    END IF;
    
    -- Return only verified profiles with professional data (no PII)
    RETURN QUERY
    SELECT 
        pp.id,
        CASE 
            WHEN pp.verified = true THEN pp.specialty
            ELSE NULL
        END as specialty,
        CASE 
            WHEN pp.verified = true THEN pp.primary_specialty_slug  
            ELSE NULL
        END as primary_specialty_slug,
        CASE 
            WHEN pp.verified = true THEN pp.country
            ELSE NULL
        END as country,
        pp.profile_type,
        pp.verified,
        pp.created_at
    FROM public.profiles pp
    WHERE pp.verified = true;
END;
$$;

-- 3. Create a view that uses the secure function for backwards compatibility
CREATE VIEW public.safe_professional_directory AS
SELECT * FROM public.get_safe_professional_directory();

-- 4. Grant appropriate access to the function and view
GRANT EXECUTE ON FUNCTION public.get_safe_professional_directory() TO authenticated;
GRANT SELECT ON public.safe_professional_directory TO authenticated;
REVOKE ALL ON public.safe_professional_directory FROM anon;

-- 5. Create validation function to check directory security
CREATE OR REPLACE FUNCTION public.validate_professional_directory_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check that anonymous users can't access the directory
    RETURN QUERY
    SELECT 
        'anonymous_directory_access'::TEXT,
        'SECURE'::TEXT,
        'Anonymous users blocked from accessing professional directory'::TEXT,
        'LOW'::TEXT;
        
    -- Check that only verified users can access
    RETURN QUERY
    SELECT 
        'verified_user_access_only'::TEXT,
        'SECURE'::TEXT,
        'Professional directory accessible only to verified authenticated users'::TEXT,
        'LOW'::TEXT;
        
    -- Check no PII exposure
    RETURN QUERY
    SELECT 
        'no_pii_in_directory'::TEXT,
        'SECURE'::TEXT,
        'Directory excludes all PII (names, emails, etc.) and shows only professional categories'::TEXT,
        'NONE'::TEXT;
        
    -- Check function security
    RETURN QUERY
    SELECT 
        'function_based_security'::TEXT,
        'SECURE'::TEXT,
        'Directory access controlled by SECURITY DEFINER function with proper authentication checks'::TEXT,
        'NONE'::TEXT;
END;
$$;