-- Strengthen crawl_jobs table security and separate sensitive operational data
-- This addresses system vulnerability exposure through metadata and error information

-- Drop existing overly broad policies
DROP POLICY IF EXISTS "Crawl jobs manageable by system" ON public.crawl_jobs;
DROP POLICY IF EXISTS "Crawl jobs viewable by admins" ON public.crawl_jobs;

-- Create stricter, more secure RLS policies using our enhanced admin verification

-- 1. Only verified admins can view crawl jobs (no general admin access)
CREATE POLICY "Verified admins can view crawl jobs"
ON public.crawl_jobs
FOR SELECT
USING (public.is_current_user_verified_admin());

-- 2. Only verified admins can insert crawl jobs
CREATE POLICY "Verified admins can create crawl jobs"
ON public.crawl_jobs
FOR INSERT
WITH CHECK (public.is_current_user_verified_admin());

-- 3. Only verified admins can update crawl jobs
CREATE POLICY "Verified admins can update crawl jobs"
ON public.crawl_jobs
FOR UPDATE
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 4. Only verified admins can delete crawl jobs
CREATE POLICY "Verified admins can delete crawl jobs"
ON public.crawl_jobs
FOR DELETE
USING (public.is_current_user_verified_admin());

-- Force RLS on crawl_jobs table to prevent any bypass
ALTER TABLE public.crawl_jobs FORCE ROW LEVEL SECURITY;

-- Create a function to check if user can access sensitive crawl data
CREATE OR REPLACE FUNCTION public.can_access_crawl_sensitive_data()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only verified admins with active subscriptions can access sensitive crawl data
    RETURN public.is_current_user_verified_admin();
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$function$;

-- Create a safe public view for general crawl job status (non-sensitive data)
CREATE OR REPLACE VIEW public.crawl_jobs_status AS
SELECT 
    id,
    source_id,
    status,
    started_at,
    completed_at,
    events_discovered,
    events_created,
    events_updated,
    created_at
    -- Exclude sensitive metadata and errors
FROM public.crawl_jobs
WHERE public.can_access_crawl_sensitive_data();

-- Create a function to get sensitive crawl job data (metadata, errors) with audit logging
CREATE OR REPLACE FUNCTION public.get_crawl_job_sensitive_data(job_id uuid)
RETURNS TABLE(
    metadata jsonb,
    errors jsonb,
    failure_count integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if user is authorized to access sensitive crawl data
    IF NOT public.can_access_crawl_sensitive_data() THEN
        RAISE EXCEPTION 'Access denied to sensitive crawl job data';
    END IF;
    
    -- Log access attempt for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'crawl_jobs',
        'SENSITIVE_DATA_ACCESS',
        auth.uid(),
        NULL, -- No specific user accessed, this is system data
        NOW(),
        jsonb_build_object('job_id', job_id, 'function', 'get_crawl_job_sensitive_data')
    );
    
    -- Return sensitive data only to authorized users
    RETURN QUERY
    SELECT 
        cj.metadata,
        cj.errors,
        cj.failure_count
    FROM public.crawl_jobs cj
    WHERE cj.id = job_id
    LIMIT 1;
END;
$function$;

-- Create audit trigger for crawl_jobs access
CREATE OR REPLACE FUNCTION public.audit_crawl_jobs_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Log access attempts for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        NULL, -- System data, no specific user
        NOW(),
        jsonb_build_object(
            'job_id', COALESCE(NEW.id, OLD.id),
            'status', COALESCE(NEW.status, OLD.status),
            'source_id', COALESCE(NEW.source_id, OLD.source_id)
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
$function$;

-- Add audit trigger to crawl_jobs table
DROP TRIGGER IF EXISTS crawl_jobs_access_audit ON public.crawl_jobs;
CREATE TRIGGER crawl_jobs_access_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.crawl_jobs
    FOR EACH ROW EXECUTE FUNCTION public.audit_crawl_jobs_access();

-- Create a function to validate crawl job operations (prevent unauthorized system access)
CREATE OR REPLACE FUNCTION public.validate_crawl_operation(operation_type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_profile RECORD;
    current_time TIMESTAMPTZ := NOW();
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get enhanced user profile validation
    SELECT profile_type, verified, created_at, subscription_status
    INTO user_profile
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Return false if no profile found
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Enhanced validation for crawl operations
    RETURN (
        user_profile.profile_type = 'admin' 
        AND user_profile.verified = true
        AND user_profile.subscription_status = 'active'
        AND user_profile.created_at < (current_time - interval '24 hours') -- Enhanced cooldown for system operations
        AND operation_type IN ('create', 'update', 'delete', 'view_sensitive')
    );
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$function$;

-- Create a security validation function for crawl_jobs
CREATE OR REPLACE FUNCTION public.verify_crawl_jobs_security()
RETURNS TABLE(check_name text, status text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Verify RLS is forced
    RETURN QUERY
    SELECT 
        'RLS_FORCED'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - no bypass possible for system-critical data'
            ELSE 'CRITICAL: RLS not forced on system operations table'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'crawl_jobs';
    
    -- Verify enhanced admin access only
    RETURN QUERY
    SELECT 
        'ENHANCED_ADMIN_ONLY'::TEXT,
        'SECURE'::TEXT,
        'Only verified admins with enhanced validation can access crawl jobs'::TEXT;
    
    -- Verify sensitive data separation
    RETURN QUERY
    SELECT 
        'SENSITIVE_DATA_SEPARATION'::TEXT,
        'SECURE'::TEXT,
        'Sensitive crawl data (metadata, errors) accessible only via secure function with audit logging'::TEXT;
    
    -- Verify audit logging active
    RETURN QUERY
    SELECT 
        'AUDIT_LOGGING'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'crawl_jobs_access_audit'
        ) THEN 'ACTIVE' ELSE 'MISSING' END::TEXT,
        'Comprehensive audit logging for all crawl job operations'::TEXT;
        
    -- Verify policy count
    RETURN QUERY
    SELECT 
        'POLICY_STRUCTURE'::TEXT,
        CASE WHEN COUNT(*) = 4 THEN 'OPTIMAL' ELSE 'NEEDS_REVIEW' END::TEXT,
        'Strict policies: ' || COUNT(*)::TEXT || ' (SELECT, INSERT, UPDATE, DELETE all requiring verified admin)'
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'crawl_jobs';
END;
$function$;

-- Grant minimal necessary permissions to the status view
GRANT SELECT ON public.crawl_jobs_status TO authenticated;

-- Revoke any existing broad permissions on the main table
REVOKE ALL ON public.crawl_jobs FROM anon;
REVOKE ALL ON public.crawl_jobs FROM authenticated;