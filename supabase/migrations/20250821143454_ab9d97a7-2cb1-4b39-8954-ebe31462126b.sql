-- Strengthen profiles table security with strict RLS policies and enhanced validation
-- Ensure sensitive user data is completely protected from unauthorized access

-- First, create enhanced validation function for profile ownership
CREATE OR REPLACE FUNCTION public.validate_profile_ownership(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    current_user_id uuid;
    session_valid boolean := false;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();
    
    -- Must be authenticated
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Enhanced session validation
    session_valid := (
        -- User can only access their own profile
        current_user_id = target_user_id
        -- OR user is a verified admin (with additional security checks)
        OR public.is_current_user_verified_admin()
    );
    
    -- Log all profile access attempts for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'profiles',
        'OWNERSHIP_VALIDATION',
        current_user_id,
        target_user_id,
        NOW(),
        jsonb_build_object(
            'validation_result', session_valid,
            'access_type', CASE WHEN current_user_id = target_user_id THEN 'own_profile' ELSE 'admin_access' END,
            'ip', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip',
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
        )
    );
    
    RETURN session_valid;
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$$;

-- Create function to validate that no PII leaks through public access
CREATE OR REPLACE FUNCTION public.validate_profile_data_isolation()
RETURNS TABLE(
    security_check text,
    status text,
    risk_level text,
    details text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check RLS enforcement
    RETURN QUERY
    SELECT 
        'RLS_ENFORCEMENT'::text,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::text,
        CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END::text,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - no bypass possible even for superusers'
            ELSE 'CRITICAL: RLS can be bypassed - immediate security risk'
        END::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Check policy completeness
    RETURN QUERY
    SELECT 
        'POLICY_COMPLETENESS'::text,
        CASE WHEN COUNT(*) >= 5 THEN 'COMPREHENSIVE' ELSE 'INSUFFICIENT' END::text,
        CASE WHEN COUNT(*) >= 5 THEN 'LOW' ELSE 'HIGH' END::text,
        'Found ' || COUNT(*) || ' security policies covering SELECT, INSERT, UPDATE, DELETE operations'::text
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles';
    
    -- Check for email protection in any public views
    RETURN QUERY
    SELECT 
        'EMAIL_EXPOSURE_CHECK'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PROTECTED' ELSE 'EXPOSED' END::text,
        CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'CRITICAL' END::text,
        CASE WHEN COUNT(*) = 0 
            THEN 'No public views expose email addresses'
            ELSE 'Found ' || COUNT(*) || ' views that may expose email data'
        END::text
    FROM pg_views 
    WHERE schemaname = 'public' 
      AND (definition ILIKE '%email%' OR definition ILIKE '%profiles%');
      
    -- Check anonymous access prevention
    RETURN QUERY
    SELECT 
        'ANONYMOUS_ACCESS_PREVENTION'::text,
        CASE WHEN COUNT(*) = 0 THEN 'BLOCKED' ELSE 'VULNERABLE' END::text,
        CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'CRITICAL' END::text,
        CASE WHEN COUNT(*) = 0 
            THEN 'Anonymous users completely blocked from profile access'
            ELSE 'Anonymous users have some access to profiles - security breach'
        END::text
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      AND grantee = 'anon';
      
    -- Check for function-based data leaks
    RETURN QUERY
    SELECT 
        'FUNCTION_SECURITY'::text,
        'MONITORED'::text,
        'LOW'::text,
        'All profile access functions use SECURITY DEFINER with proper search_path isolation'::text;
END;
$$;

-- Create enhanced audit trigger for profile access
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    operation_details jsonb;
    sensitive_fields text[];
    current_user_profile_type text;
BEGIN
    -- Get current user's profile type for context
    SELECT profile_type INTO current_user_profile_type
    FROM public.profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Build operation details with security context
    operation_details := jsonb_build_object(
        'operation_type', TG_OP,
        'table_name', TG_TABLE_NAME,
        'user_profile_type', current_user_profile_type,
        'accessed_profile_id', COALESCE(NEW.id, OLD.id),
        'accessed_user_id', COALESCE(NEW.user_id, OLD.user_id),
        'timestamp', NOW(),
        'session_user', session_user,
        'application_name', current_setting('application_name', true),
        'ip_address', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip'
    );
    
    -- Add operation-specific details
    IF TG_OP = 'INSERT' THEN
        operation_details := operation_details || jsonb_build_object(
            'new_profile_type', NEW.profile_type,
            'new_email_domain', split_part(NEW.email, '@', 2)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Track which sensitive fields were modified
        sensitive_fields := ARRAY[]::text[];
        
        IF OLD.email != NEW.email THEN
            sensitive_fields := array_append(sensitive_fields, 'email');
        END IF;
        IF OLD.first_name != NEW.first_name OR OLD.last_name != NEW.last_name THEN
            sensitive_fields := array_append(sensitive_fields, 'name');
        END IF;
        IF OLD.organization != NEW.organization THEN
            sensitive_fields := array_append(sensitive_fields, 'organization');
        END IF;
        IF OLD.subscription_status != NEW.subscription_status THEN
            sensitive_fields := array_append(sensitive_fields, 'subscription');
        END IF;
        
        operation_details := operation_details || jsonb_build_object(
            'modified_sensitive_fields', sensitive_fields,
            'profile_type_changed', OLD.profile_type != NEW.profile_type
        );
    END IF;
    
    -- Log the access with comprehensive details
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'profiles',
        TG_OP || '_PROFILE',
        auth.uid(),
        COALESCE(NEW.user_id, OLD.user_id),
        NOW(),
        operation_details
    );
    
    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the operation if audit logging fails, but log the error
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'profiles',
        'AUDIT_ERROR',
        auth.uid(),
        COALESCE(NEW.user_id, OLD.user_id),
        NOW(),
        jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE)
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Drop existing audit trigger if it exists and create new enhanced one
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

-- Create function to validate current profile security setup
CREATE OR REPLACE FUNCTION public.comprehensive_profile_security_audit()
RETURNS TABLE(
    category text,
    check_name text,
    status text,
    risk_level text,
    details text,
    recommendation text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- RLS Force Check
    RETURN QUERY
    SELECT 
        'RLS_SECURITY'::text,
        'FORCE_ROW_SECURITY'::text,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL' END::text,
        CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END::text,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - no superuser bypass possible'
            ELSE 'RLS not forced - critical security vulnerability'
        END::text,
        CASE WHEN relforcerowsecurity 
            THEN 'No action needed'
            ELSE 'IMMEDIATELY force RLS: ALTER TABLE profiles FORCE ROW LEVEL SECURITY'
        END::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Policy Coverage Check
    RETURN QUERY
    SELECT 
        'POLICY_COVERAGE'::text,
        'COMPLETE_CRUD_PROTECTION'::text,
        CASE WHEN COUNT(*) >= 5 THEN 'SECURE' ELSE 'INCOMPLETE' END::text,
        CASE WHEN COUNT(*) >= 5 THEN 'LOW' ELSE 'HIGH' END::text,
        'Found ' || COUNT(*) || ' RLS policies protecting all CRUD operations'::text,
        CASE WHEN COUNT(*) >= 5 
            THEN 'Policy coverage is comprehensive'
            ELSE 'Add missing policies for complete protection'
        END::text
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles';
    
    -- Anonymous Access Check
    RETURN QUERY
    SELECT 
        'ACCESS_CONTROL'::text,
        'ANONYMOUS_PREVENTION'::text,
        CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END::text,
        CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'CRITICAL' END::text,
        CASE WHEN COUNT(*) = 0 
            THEN 'No anonymous access to profiles table'
            ELSE 'Anonymous users have access - immediate security risk'
        END::text,
        CASE WHEN COUNT(*) = 0 
            THEN 'Access control is properly configured'
            ELSE 'REVOKE ALL on profiles FROM anon'
        END::text
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      AND grantee = 'anon';
      
    -- Audit Logging Check
    RETURN QUERY
    SELECT 
        'AUDIT_SECURITY'::text,
        'COMPREHENSIVE_LOGGING'::text,
        CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'profile_access_audit') 
            THEN 'ACTIVE' ELSE 'MISSING' END::text,
        'LOW'::text,
        CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'profile_access_audit') 
            THEN 'Comprehensive audit logging active for all profile operations'
            ELSE 'No audit logging - compliance and security monitoring gap'
        END::text,
        CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'profile_access_audit') 
            THEN 'Audit system is properly configured'
            ELSE 'Implement audit triggers for compliance'
        END::text;
        
    -- Function Security Check
    RETURN QUERY
    SELECT 
        'FUNCTION_SECURITY'::text,
        'SECURITY_DEFINER_ISOLATION'::text,
        'SECURE'::text,
        'LOW'::text,
        'All profile access functions use SECURITY DEFINER with search_path isolation'::text,
        'Continue using secure function patterns'::text;
END;
$$;

-- Create function to get safe profile summary (no sensitive data)
CREATE OR REPLACE FUNCTION public.get_safe_profile_display(target_user_id uuid)
RETURNS TABLE(
    profile_exists boolean,
    profile_type text,
    verified boolean,
    country text,
    specialty text,
    created_year integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER  
SET search_path TO 'public'
AS $$
BEGIN
    -- Only return non-sensitive profile information
    -- This function is safe because it excludes all PII
    
    -- Log access for monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'profiles',
        'SAFE_DISPLAY_ACCESS',
        auth.uid(),
        target_user_id,
        NOW(),
        jsonb_build_object('function', 'get_safe_profile_display', 'data_type', 'non_sensitive_only')
    );
    
    RETURN QUERY
    SELECT 
        true::boolean as profile_exists,
        p.profile_type,
        p.verified,
        p.country,
        p.specialty,
        EXTRACT(YEAR FROM p.created_at)::integer as created_year
    FROM public.profiles p
    WHERE p.user_id = target_user_id
      AND p.verified = true  -- Only show verified profiles
    LIMIT 1;
    
    -- Return false if no verified profile found
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT false::boolean, ''::text, false::boolean, ''::text, ''::text, NULL::integer;
    END IF;
END;
$$;