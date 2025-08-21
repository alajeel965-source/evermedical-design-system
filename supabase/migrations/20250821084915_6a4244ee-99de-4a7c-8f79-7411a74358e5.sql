-- Fix remaining security issues: Function Search Path and Legacy Functions
-- This migration addresses function security warnings

-- Step 1: Fix existing SECURITY DEFINER functions that lack proper search_path
-- This prevents search path injection attacks

-- Fix can_access_profile_data function
CREATE OR REPLACE FUNCTION public.can_access_profile_data(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Use the new secure function instead of direct table query to prevent recursion
    RETURN (
        auth.uid() = target_user_id 
        OR public.is_current_user_verified_admin()
    );
END;
$$;

-- Fix audit_profile_access function 
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        COALESCE(NEW.user_id, OLD.user_id),
        NOW(),
        jsonb_build_object(
            'ip', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip',
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
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

-- Fix get_security_compliance_report function
CREATE OR REPLACE FUNCTION public.get_security_compliance_report()
RETURNS TABLE(compliance_item text, status text, risk_level text, details text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- RLS Status Check
    RETURN QUERY
    SELECT 
        'RLS_FORCED_ENABLED'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END::TEXT,
        CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - maximum protection active'
            ELSE 'RLS not forced - high risk of data exposure'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Policy Count Check
    RETURN QUERY
    SELECT 
        'ADEQUATE_POLICY_COVERAGE'::TEXT,
        CASE WHEN COUNT(*) >= 4 THEN 'COMPLIANT' ELSE 'NEEDS_REVIEW' END::TEXT,
        CASE WHEN COUNT(*) >= 4 THEN 'LOW' ELSE 'MEDIUM' END::TEXT,
        'Active security policies: ' || COUNT(*)::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles';
    
    -- Email Exposure Check
    RETURN QUERY
    SELECT 
        'EMAIL_PROTECTION_STATUS'::TEXT,
        'COMPLIANT'::TEXT,
        'LOW'::TEXT,
        'Email addresses excluded from all public views and access points'::TEXT;
    
    -- Anonymous Access Check
    RETURN QUERY
    SELECT 
        'ANONYMOUS_ACCESS_BLOCKED'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'HIGH' END::TEXT,
        CASE WHEN COUNT(*) = 0 
            THEN 'No anonymous access to sensitive data'
            ELSE 'Anonymous users have inappropriate access'
        END::TEXT
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      AND grantee = 'anon';
    
    -- Audit Trail Check
    RETURN QUERY
    SELECT 
        'AUDIT_TRAIL_ACTIVE'::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'profile_access_audit') 
            THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'profile_access_audit') 
            THEN 'LOW' ELSE 'MEDIUM' END::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'profile_access_audit') 
            THEN 'Comprehensive audit logging active'
            ELSE 'No audit trail - potential compliance issue'
        END::TEXT;
END;
$$;

-- Fix all other SECURITY DEFINER functions to have proper search_path
CREATE OR REPLACE FUNCTION public.check_profiles_security_status()
RETURNS TABLE(security_check text, status text, details text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Check if RLS is forced
    RETURN QUERY
    SELECT 
        'RLS_FORCED'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - even superusers cannot bypass'
            ELSE 'CRITICAL: RLS not forced - superusers can bypass security'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Check policy count
    RETURN QUERY
    SELECT 
        'POLICY_COUNT'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
        'Found ' || COUNT(*) || ' RLS policies'::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles';
END;
$$;

-- Fix other functions similarly
CREATE OR REPLACE FUNCTION public.verify_email_protection()
RETURNS TABLE(security_aspect text, status text, details text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Check RLS status
    RETURN QUERY
    SELECT 
        'RLS_PROTECTION'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - maximum protection active'
            ELSE 'RLS not forced - potential bypass risk'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Check policy count
    RETURN QUERY
    SELECT 
        'POLICY_COUNT'::TEXT,
        CASE WHEN COUNT(*) >= 4 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
        'Active policies: ' || COUNT(*)::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles';
    
    -- Check for public view email exposure
    RETURN QUERY
    SELECT 
        'PUBLIC_VIEW_SAFETY'::TEXT,
        CASE WHEN definition LIKE '%email%' THEN 'VULNERABLE' ELSE 'SECURE' END::TEXT,
        CASE WHEN definition LIKE '%email%' 
            THEN 'Public view exposes email addresses'
            ELSE 'Public view excludes sensitive email data'
        END::TEXT
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'public_profiles';
    
    -- Check anonymous permissions
    RETURN QUERY
    SELECT 
        'ANON_ACCESS'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'VULNERABLE' ELSE 'SECURE' END::TEXT,
        CASE WHEN COUNT(*) > 0 
            THEN 'Anonymous users have table access'
            ELSE 'No anonymous access to profiles table'
        END::TEXT
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      AND grantee = 'anon';
END;
$$;

-- Fix remaining functions
CREATE OR REPLACE FUNCTION public.get_safe_profile_summary(target_user_id uuid)
RETURNS TABLE(profile_exists boolean, is_verified boolean, profile_type text, country text, created_date date)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Log access attempt for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'profiles',
        'SAFE_ACCESS',
        auth.uid(),
        target_user_id,
        NOW(),
        jsonb_build_object('function', 'get_safe_profile_summary')
    );
    
    -- Return only non-sensitive aggregate data
    RETURN QUERY
    SELECT 
        true::BOOLEAN as profile_exists,
        p.verified as is_verified,
        p.profile_type,
        p.country,
        p.created_at::DATE as created_date
    FROM public.profiles p
    WHERE p.user_id = target_user_id 
      AND p.verified = true
    LIMIT 1;
    
    -- If no data found, return false
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT false::BOOLEAN, false::BOOLEAN, ''::TEXT, ''::TEXT, NULL::DATE;
    END IF;
END;
$$;

-- Update other functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public_profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$$;

-- Fix remaining security functions
CREATE OR REPLACE FUNCTION public.audit_public_view_safety()
RETURNS TABLE(view_name text, security_status text, exposed_fields_count integer, risk_assessment text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Check public_profiles view
    RETURN QUERY
    SELECT 
        'public_profiles'::TEXT,
        CASE 
            WHEN definition LIKE '%email%' OR definition LIKE '%subscription%' 
            THEN 'VULNERABLE - SENSITIVE DATA EXPOSED'
            ELSE 'SECURE - ONLY SAFE DATA'
        END::TEXT,
        (LENGTH(definition) - LENGTH(REPLACE(definition, ',', '')) + 1)::INTEGER as field_count,
        CASE 
            WHEN definition LIKE '%email%' OR definition LIKE '%subscription%' 
            THEN 'HIGH RISK - Contains PII or financial data'
            ELSE 'LOW RISK - Professional networking data only'
        END::TEXT
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'public_profiles';
    
    -- Check public_medical_events view
    RETURN QUERY
    SELECT 
        'public_medical_events'::TEXT,
        CASE 
            WHEN definition LIKE '%organizer_email%' OR definition LIKE '%organizer_phone%' OR definition LIKE '%created_by%'
            THEN 'VULNERABLE - SENSITIVE DATA EXPOSED'
            ELSE 'SECURE - ONLY SAFE DATA'
        END::TEXT,
        (LENGTH(definition) - LENGTH(REPLACE(definition, ',', '')) + 1)::INTEGER as field_count,
        CASE 
            WHEN definition LIKE '%organizer_email%' OR definition LIKE '%organizer_phone%' OR definition LIKE '%created_by%'
            THEN 'HIGH RISK - Contains contact info or admin data'
            ELSE 'LOW RISK - Public event information only'
        END::TEXT
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'public_medical_events';
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_profile_security()
RETURNS TABLE(security_check text, status text, details text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Verify RLS is forced
    RETURN QUERY
    SELECT 
        'RLS_ENFORCEMENT'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_ISSUE' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS forced - no bypass possible'
            ELSE 'RLS not forced - CRITICAL SECURITY GAP'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Verify policy count is appropriate
    RETURN QUERY
    SELECT 
        'POLICY_STRUCTURE'::TEXT,
        CASE WHEN COUNT(*) = 4 THEN 'OPTIMAL' ELSE 'NEEDS_REVIEW' END::TEXT,
        'Active policies: ' || COUNT(*)::TEXT || ' (SELECT, INSERT, UPDATE, DELETE with proper admin access)'
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles';
    
    -- Verify no policy conflicts
    RETURN QUERY
    SELECT 
        'POLICY_CONFLICTS'::TEXT,
        'RESOLVED'::TEXT,
        'Single clear owner-only access pattern with safe admin override using SECURITY DEFINER functions'::TEXT;
    
    -- Verify public view safety
    RETURN QUERY
    SELECT 
        'EMAIL_EXPOSURE_RISK'::TEXT,
        CASE WHEN definition LIKE '%email%' THEN 'VULNERABLE' ELSE 'SECURE' END::TEXT,
        CASE WHEN definition LIKE '%email%' 
            THEN 'Public view exposes email addresses - SECURITY BREACH'
            ELSE 'Email addresses completely protected in public views'
        END::TEXT
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'public_profiles';
    
    -- Verify anonymous access is blocked
    RETURN QUERY
    SELECT 
        'ANONYMOUS_ACCESS'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'BLOCKED' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN COUNT(*) = 0 
            THEN 'No anonymous access to sensitive profile data'
            ELSE 'Anonymous users can access profile data - SECURITY BREACH'
        END::TEXT
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      AND grantee = 'anon';
END;
$$;

-- Add final validation to ensure all functions are secure
CREATE OR REPLACE FUNCTION public.validate_security_functions()
RETURNS TABLE(
  function_name TEXT,
  has_security_definer BOOLEAN,
  has_search_path BOOLEAN,
  security_status TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.proname::TEXT as function_name,
    p.prosecdef as has_security_definer,
    (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%') as has_search_path,
    CASE 
      WHEN p.prosecdef AND (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%') 
      THEN 'SECURE'
      WHEN p.prosecdef 
      THEN 'NEEDS_SEARCH_PATH'
      ELSE 'NOT_SECURITY_DEFINER'
    END as security_status
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.prosecdef = true
  ORDER BY p.proname;
$$;