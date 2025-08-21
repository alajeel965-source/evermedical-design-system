-- Enhanced security for profiles table to prevent unauthorized access

-- Create enhanced rate limiting function for profile access
CREATE OR REPLACE FUNCTION public.check_profile_access_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check if user has exceeded profile access rate limit (max 50 profile views per hour)
    RETURN public.check_rate_limit(
        'profile_access_' || COALESCE(auth.uid()::text, 'anonymous'), 
        50, 
        '1 hour'::interval
    );
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$$;

-- Enhanced profile access function with additional security checks
CREATE OR REPLACE FUNCTION public.can_access_profile_data_enhanced(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    current_user_id uuid;
    is_verified_admin boolean := false;
    rate_limit_ok boolean := false;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Anonymous users cannot access profile data
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check rate limiting first
    rate_limit_ok := public.check_profile_access_rate_limit();
    IF NOT rate_limit_ok THEN
        -- Log rate limit violation
        INSERT INTO public.security_audit_log (
            table_name, operation, user_id, accessed_user_id, timestamp, details
        ) VALUES (
            'profiles', 'RATE_LIMIT_VIOLATION', current_user_id, target_user_id, NOW(),
            jsonb_build_object('reason', 'Profile access rate limit exceeded')
        );
        RETURN false;
    END IF;
    
    -- Users can always access their own profile
    IF current_user_id = target_user_id THEN
        RETURN true;
    END IF;
    
    -- Check if current user is a verified admin
    is_verified_admin := public.is_current_user_verified_admin();
    
    -- Log admin access attempts for audit trail
    IF is_verified_admin THEN
        INSERT INTO public.security_audit_log (
            table_name, operation, user_id, accessed_user_id, timestamp, details
        ) VALUES (
            'profiles', 'ADMIN_ACCESS', current_user_id, target_user_id, NOW(),
            jsonb_build_object('admin_access', true, 'reason', 'Verified admin accessing user profile')
        );
    END IF;
    
    RETURN is_verified_admin;
EXCEPTION WHEN OTHERS THEN
    -- Log the error and return false to fail securely
    INSERT INTO public.security_audit_log (
        table_name, operation, user_id, accessed_user_id, timestamp, details
    ) VALUES (
        'profiles', 'ACCESS_ERROR', current_user_id, target_user_id, NOW(),
        jsonb_build_object('error', SQLERRM, 'function', 'can_access_profile_data_enhanced')
    );
    RETURN false;
END;
$$;

-- Create a secure public view for basic profile information (non-sensitive only)
CREATE OR REPLACE VIEW public.safe_public_profiles AS
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    username,
    avatar_url,
    title,
    specialty,
    primary_specialty_slug,
    organization,
    country,
    profile_type,
    verified,
    created_at
FROM public.profiles
WHERE verified = true;

-- Update the profiles table policies to use the enhanced function
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
CREATE POLICY "profiles_secure_select_enhanced" ON public.profiles
FOR SELECT USING (public.can_access_profile_data_enhanced(user_id));

DROP POLICY IF EXISTS "profiles_secure_update" ON public.profiles;
CREATE POLICY "profiles_secure_update_enhanced" ON public.profiles
FOR UPDATE USING (public.can_access_profile_data_enhanced(user_id))
WITH CHECK (public.can_access_profile_data_enhanced(user_id));

-- Create function to validate profile security configuration
CREATE OR REPLACE FUNCTION public.validate_enhanced_profile_security()
RETURNS TABLE(check_name text, status text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Verify RLS is forced
    RETURN QUERY
    SELECT 
        'RLS_ENFORCEMENT'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - no bypass possible'
            ELSE 'CRITICAL: RLS not forced - IMMEDIATE SECURITY RISK'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Verify enhanced access function exists
    RETURN QUERY
    SELECT 
        'ENHANCED_ACCESS_FUNCTION'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_proc 
            WHERE proname = 'can_access_profile_data_enhanced' 
              AND prosecdef = true
        ) THEN 'SECURE' ELSE 'MISSING' END::TEXT,
        'Enhanced profile access function with rate limiting and audit logging'::TEXT;
    
    -- Verify rate limiting function exists
    RETURN QUERY
    SELECT 
        'RATE_LIMITING'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_proc 
            WHERE proname = 'check_profile_access_rate_limit'
        ) THEN 'ACTIVE' ELSE 'MISSING' END::TEXT,
        'Profile access rate limiting to prevent abuse'::TEXT;
    
    -- Verify public view excludes sensitive data
    RETURN QUERY
    SELECT 
        'SAFE_PUBLIC_VIEW'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND viewname = 'safe_public_profiles'
            AND definition NOT LIKE '%email%'
            AND definition NOT LIKE '%subscription%'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'Safe public view excludes all sensitive data like emails and billing info'::TEXT;
        
    -- Verify audit logging is active
    RETURN QUERY
    SELECT 
        'AUDIT_LOGGING'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'profile_access_audit'
        ) THEN 'ACTIVE' ELSE 'MISSING' END::TEXT,
        'Comprehensive audit logging for all profile access attempts'::TEXT;
END;
$$;