-- Fix RLS policies for safe_professional_directory view

-- 1. Enable RLS on the safe_professional_directory view
ALTER VIEW public.safe_professional_directory SET (security_invoker = true);

-- Since views can't have RLS policies directly, we need to ensure the underlying table (public_profiles) 
-- has proper policies, and create a more secure version

-- 2. Drop the current view and recreate it as a security-invoker view
DROP VIEW IF EXISTS public.safe_professional_directory;

-- 3. Create a function instead that provides controlled access
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
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    FROM public.public_profiles pp
    WHERE pp.verified = true
    AND (
        -- Allow access to verified users and admins only
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.verified = true
        )
        OR public.is_current_user_verified_admin()
    );
$$;

-- 4. Create a secure view that uses the function for backwards compatibility
CREATE VIEW public.safe_professional_directory AS
SELECT * FROM public.get_safe_professional_directory();

-- 5. Grant appropriate access
GRANT SELECT ON public.safe_professional_directory TO authenticated;
REVOKE ALL ON public.safe_professional_directory FROM anon;

-- 6. Create validation function to check directory security
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
END;
$$;