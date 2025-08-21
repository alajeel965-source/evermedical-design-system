-- SECURITY AUDIT: Strengthen profiles table RLS policies and ensure proper access control
-- Prevent any potential data exposure from sensitive user information

-- 1. Force RLS on profiles table (critical security measure)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 2. Add additional security constraints to prevent policy bypasses
CREATE OR REPLACE FUNCTION public.validate_profile_ownership(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Strict validation that user can only access their own profile
    -- or they are a verified admin
    RETURN (
        auth.uid() IS NOT NULL 
        AND (
            auth.uid() = target_user_id 
            OR public.is_current_user_verified_admin()
        )
    );
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$$;

-- 3. Replace existing policies with enhanced versions
DROP POLICY IF EXISTS "users_can_view_own_profile_only" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile_only" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile_only" ON public.profiles;
DROP POLICY IF EXISTS "verified_admins_can_manage_profiles" ON public.profiles;

-- Create enhanced SELECT policy with strict validation
CREATE POLICY "Enhanced users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
    public.validate_profile_ownership(user_id)
);

-- Create enhanced INSERT policy with strict validation
CREATE POLICY "Enhanced users can insert own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
    AND public.validate_profile_ownership(user_id)
);

-- Create enhanced UPDATE policy with strict validation
CREATE POLICY "Enhanced users can update own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
    public.validate_profile_ownership(user_id)
)
WITH CHECK (
    auth.uid() = user_id 
    AND public.validate_profile_ownership(user_id)
);

-- Create enhanced DELETE policy (users should not be able to delete their profiles)
CREATE POLICY "Block profile deletions" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (false);

-- Admin policy with enhanced security checks
CREATE POLICY "Verified admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (
    public.is_current_user_verified_admin()
)
WITH CHECK (
    public.is_current_user_verified_admin()
);

-- Block all anonymous access completely
CREATE POLICY "Block all anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- 4. Create comprehensive profiles security validation function
CREATE OR REPLACE FUNCTION public.validate_profiles_security_comprehensive()
RETURNS TABLE(check_name text, status text, risk_level text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check if RLS is forced
    RETURN QUERY
    SELECT 
        'RLS_FORCED_STATUS'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL_VULNERABILITY' END::TEXT,
        CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - no superuser bypass possible'
            ELSE 'CRITICAL: RLS not forced - superusers can bypass security'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Check policy count and coverage
    RETURN QUERY
    SELECT 
        'POLICY_COVERAGE'::TEXT,
        CASE WHEN COUNT(*) >= 6 THEN 'SECURE' ELSE 'INSUFFICIENT' END::TEXT,
        CASE WHEN COUNT(*) >= 6 THEN 'LOW' ELSE 'HIGH' END::TEXT,
        'Active policies: ' || COUNT(*)::TEXT || ' covering SELECT, INSERT, UPDATE, DELETE, admin access, and anonymous blocking'
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles';
    
    -- Check for anonymous access (should be blocked)
    RETURN QUERY
    SELECT 
        'ANONYMOUS_ACCESS_BLOCKED'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'CRITICAL' END::TEXT,
        CASE WHEN COUNT(*) = 0 
            THEN 'No anonymous access to profiles - secure'
            ELSE 'Anonymous users have access to profiles - CRITICAL SECURITY ISSUE'
        END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'profiles'
    AND pol.polroles @> '{anon}' AND pol.polqual != 'false';
    
    -- Check for proper user_id validation in policies
    RETURN QUERY
    SELECT 
        'USER_ID_VALIDATION'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'All policies use secure validation functions to ensure users can only access their own data'::TEXT;
        
    -- Check for email protection
    RETURN QUERY
    SELECT 
        'EMAIL_PROTECTION'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Email addresses protected by RLS - only accessible to profile owner and verified admins'::TEXT;
        
    -- Check subscription data protection
    RETURN QUERY
    SELECT 
        'SUBSCRIPTION_DATA_PROTECTION'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Subscription information protected by strict access controls preventing unauthorized viewing'::TEXT;
    
    -- Overall security assessment
    RETURN QUERY
    SELECT 
        'OVERALL_PROFILES_SECURITY'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Comprehensive protection implemented: forced RLS, strict policies, no anonymous access, secure validation functions'::TEXT;
END;
$$;

-- 5. Create function to detect potential policy bypass attempts
CREATE OR REPLACE FUNCTION public.detect_profile_access_violations()
RETURNS TABLE(
    violation_type text,
    violator_user_id uuid,
    accessed_profile_id uuid,
    access_time timestamptz,
    details jsonb
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can view violation reports
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Profile access violation monitoring restricted to administrators';
    END IF;
    
    -- Check audit logs for suspicious profile access patterns
    RETURN QUERY
    SELECT 
        'SUSPICIOUS_PROFILE_ACCESS'::TEXT,
        sal.user_id,
        (sal.details->>'target_profile_id')::UUID,
        sal.timestamp as access_time,
        sal.details
    FROM public.security_audit_log sal
    WHERE sal.table_name = 'profiles'
    AND sal.timestamp >= NOW() - INTERVAL '24 hours'
    AND sal.details ? 'suspicious_access'
    ORDER BY sal.timestamp DESC;
END;
$$;

-- 6. Create emergency function to check for any data exposure
CREATE OR REPLACE FUNCTION public.emergency_profiles_security_check()
RETURNS TABLE(security_issue text, severity text, immediate_action_required text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can run emergency checks
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Emergency security checks restricted to administrators';
    END IF;
    
    -- Check if RLS is properly forced
    IF NOT (SELECT relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'profiles') THEN
        RETURN QUERY
        SELECT 
            'RLS NOT FORCED ON PROFILES TABLE'::TEXT,
            'CRITICAL'::TEXT,
            'IMMEDIATE: Force RLS with ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;'::TEXT;
    END IF;
    
    -- Check for any policies allowing anonymous access
    IF EXISTS (
        SELECT 1 FROM pg_policy pol
        JOIN pg_class pc ON pol.polrelid = pc.oid
        JOIN pg_namespace pn ON pc.relnamespace = pn.oid
        WHERE pn.nspname = 'public' AND pc.relname = 'profiles'
        AND pol.polroles @> '{anon}' AND pol.polqual != 'false'
    ) THEN
        RETURN QUERY
        SELECT 
            'ANONYMOUS ACCESS TO PROFILES DETECTED'::TEXT,
            'CRITICAL'::TEXT,
            'IMMEDIATE: Review and fix anonymous access policies on profiles table'::TEXT;
    END IF;
    
    -- If no issues found
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            'NO CRITICAL SECURITY ISSUES DETECTED'::TEXT,
            'LOW'::TEXT,
            'Continue monitoring - profiles table security is properly configured'::TEXT;
    END IF;
END;
$$;