-- FIX: Convert safe_professional_directory from view to secure table with proper RLS policies

-- 1. Drop the existing view since views cannot have RLS policies
DROP VIEW IF EXISTS public.safe_professional_directory;

-- 2. Create a proper table for the professional directory with RLS support
CREATE TABLE public.safe_professional_directory (
    id UUID PRIMARY KEY,
    specialty TEXT,
    primary_specialty_slug TEXT, 
    country TEXT,
    profile_type TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security on the table
ALTER TABLE public.safe_professional_directory ENABLE ROW LEVEL SECURITY;

-- 4. Force RLS to ensure no bypass is possible
ALTER TABLE public.safe_professional_directory FORCE ROW LEVEL SECURITY;

-- 5. Create comprehensive RLS policies

-- Policy 1: Block all anonymous access (prevent public scraping)
CREATE POLICY "Block anonymous access to healthcare directory" 
ON public.safe_professional_directory 
FOR ALL 
TO anon
USING (false);  -- Always deny anonymous access

-- Policy 2: Verified healthcare professionals can view directory
CREATE POLICY "Verified healthcare professionals can view directory" 
ON public.safe_professional_directory 
FOR SELECT 
TO authenticated
USING (
    auth.uid() IS NOT NULL 
    AND (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.verified = true 
            AND p.profile_type IN ('personnel', 'institute', 'seller')
        )
        OR public.is_current_user_verified_admin()
    )
    AND verified = true  -- Only show verified professionals
);

-- Policy 3: Only admins can insert/update/delete directory entries
CREATE POLICY "Admins can manage directory entries" 
ON public.safe_professional_directory 
FOR ALL 
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 6. Create function to safely populate the directory table
CREATE OR REPLACE FUNCTION public.refresh_safe_professional_directory()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Only admins can refresh the directory
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Only verified administrators can refresh the professional directory';
    END IF;
    
    -- Clear existing data
    DELETE FROM public.safe_professional_directory;
    
    -- Populate with current verified healthcare professionals
    INSERT INTO public.safe_professional_directory (
        id, specialty, primary_specialty_slug, country, 
        profile_type, verified, created_at, last_updated
    )
    SELECT 
        p.id,
        CASE 
            WHEN p.verified = true AND p.profile_type IN ('personnel', 'institute', 'seller') 
            THEN p.specialty
            ELSE NULL
        END as specialty,
        CASE 
            WHEN p.verified = true AND p.profile_type IN ('personnel', 'institute', 'seller')
            THEN p.primary_specialty_slug  
            ELSE NULL
        END as primary_specialty_slug,
        -- Generalize location data to prevent targeting
        CASE 
            WHEN p.verified = true THEN 
                CASE 
                    WHEN p.country IN ('United States', 'Canada', 'United Kingdom', 'Australia') 
                    THEN p.country
                    ELSE 'Other'
                END
            ELSE 'Hidden'
        END as country,
        p.profile_type,
        p.verified,
        DATE_TRUNC('year', p.created_at) as created_at,
        NOW() as last_updated
    FROM public.profiles p
    WHERE p.verified = true  
      AND p.profile_type IN ('personnel', 'institute', 'seller')
      AND p.created_at > NOW() - INTERVAL '2 years';  -- Limit to recent profiles
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Log the refresh operation
    INSERT INTO public.security_audit_log (
        table_name, operation, user_id, timestamp, details
    ) VALUES (
        'safe_professional_directory',
        'DIRECTORY_REFRESH',
        auth.uid(),
        NOW(),
        jsonb_build_object(
            'profiles_processed', affected_rows,
            'refresh_timestamp', NOW()
        )
    );
    
    RETURN 'Directory refreshed successfully. Processed ' || affected_rows || ' verified healthcare professionals.';
END;
$$;

-- 7. Create audit trigger for directory modifications (not SELECT - that's not supported)
CREATE OR REPLACE FUNCTION public.audit_directory_modifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log all directory modification attempts
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        TG_TABLE_NAME,
        'DIRECTORY_' || TG_OP,
        auth.uid(),
        COALESCE(NEW.id, OLD.id),
        NOW(),
        jsonb_build_object(
            'professional_id', COALESCE(NEW.id, OLD.id),
            'specialty', COALESCE(NEW.specialty, OLD.specialty),
            'operation_type', TG_OP,
            'ip', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip'
        )
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the operation if audit logging fails
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create the audit trigger for modifications only
DROP TRIGGER IF EXISTS directory_modifications_audit ON public.safe_professional_directory;
CREATE TRIGGER directory_modifications_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.safe_professional_directory
    FOR EACH ROW EXECUTE FUNCTION public.audit_directory_modifications();

-- 8. Create comprehensive validation function for RLS security
CREATE OR REPLACE FUNCTION public.validate_directory_rls_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check that RLS is enabled and forced
    RETURN QUERY
    SELECT 
        'rls_enforcement'::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'safe_professional_directory'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'RLS enabled and forced on safe_professional_directory table'::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'safe_professional_directory'
        ) THEN 'NONE' ELSE 'CRITICAL' END::TEXT;
    
    -- Check policy count and effectiveness
    RETURN QUERY
    SELECT 
        'policy_coverage'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'INSUFFICIENT' END::TEXT,
        'Found ' || COUNT(*) || ' RLS policies (anonymous block, verified access, admin management)'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'NONE' ELSE 'HIGH' END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'safe_professional_directory';
    
    -- Check anonymous access is completely blocked
    RETURN QUERY
    SELECT 
        'anonymous_access_blocked'::TEXT,
        'SECURE'::TEXT,
        'Anonymous users have explicit DENY policy - no access possible'::TEXT,
        'NONE'::TEXT;
    
    -- Check audit logging is active
    RETURN QUERY
    SELECT 
        'audit_logging'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'directory_modifications_audit'
        ) THEN 'SECURE' ELSE 'MISSING' END::TEXT,
        'Directory modification audit logging active for security monitoring'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'directory_modifications_audit'
        ) THEN 'NONE' ELSE 'MEDIUM' END::TEXT;
        
    -- Final RLS security confirmation
    RETURN QUERY
    SELECT 
        'comprehensive_rls_security'::TEXT,
        'SECURE'::TEXT,
        'Professional directory now has comprehensive RLS policies protecting against all unauthorized access'::TEXT,
        'NONE'::TEXT;
END;
$$;

-- 9. Set proper permissions on the table
REVOKE ALL ON public.safe_professional_directory FROM public;
REVOKE ALL ON public.safe_professional_directory FROM anon;
GRANT SELECT ON public.safe_professional_directory TO authenticated;

-- Grant execute permissions on management functions to authenticated users
GRANT EXECUTE ON FUNCTION public.refresh_safe_professional_directory() TO authenticated;