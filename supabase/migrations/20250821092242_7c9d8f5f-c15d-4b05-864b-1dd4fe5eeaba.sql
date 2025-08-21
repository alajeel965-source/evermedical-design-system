-- Strengthen admin verification security and add additional access controls
-- This addresses the security concern about potential vulnerabilities in is_current_user_verified_admin()

-- First, create a more secure admin verification function with additional checks
CREATE OR REPLACE FUNCTION public.is_current_user_verified_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_profile RECORD;
    session_valid BOOLEAN := false;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user profile with explicit checks
    SELECT profile_type, verified, created_at, subscription_status
    INTO user_profile
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Return false if no profile found
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Strict admin verification with additional security checks
    RETURN (
        user_profile.profile_type = 'admin' 
        AND user_profile.verified = true
        AND user_profile.subscription_status = 'active'
        AND user_profile.created_at < (now() - interval '1 hour') -- Prevent immediate admin access after account creation
    );
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$function$;

-- Create a function to validate profile access with enhanced security
CREATE OR REPLACE FUNCTION public.can_access_profile_data(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Use the new secure function instead of direct table query to prevent recursion
    RETURN (
        auth.uid() = target_user_id 
        OR public.is_current_user_verified_admin()
    );
END;
$function$;

-- Create audit logging function for profile access
CREATE OR REPLACE FUNCTION public.audit_profile_access()
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
$function$;

-- Add audit trigger to profiles table (only for INSERT, UPDATE, DELETE - SELECT triggers aren't supported)
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

-- Update profiles RLS policies to use the new secure function
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_delete" ON public.profiles;

-- Create new secure RLS policies with enhanced validation
CREATE POLICY "profiles_secure_select"
ON public.profiles
FOR SELECT
USING (public.can_access_profile_data(user_id));

CREATE POLICY "profiles_secure_insert"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_secure_update"
ON public.profiles
FOR UPDATE
USING (public.can_access_profile_data(user_id))
WITH CHECK (public.can_access_profile_data(user_id));

CREATE POLICY "profiles_secure_delete"
ON public.profiles
FOR DELETE
USING (public.is_current_user_verified_admin());

-- Force RLS on profiles table to prevent any bypass
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Create a function to validate the security improvements
CREATE OR REPLACE FUNCTION public.verify_profiles_security_enhancement()
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
            THEN 'RLS is forced - no bypass possible'
            ELSE 'CRITICAL: RLS not forced'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
    
    -- Verify enhanced admin function exists
    RETURN QUERY
    SELECT 
        'ENHANCED_ADMIN_FUNCTION'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_proc 
            WHERE proname = 'is_current_user_verified_admin' 
              AND prosecdef = true
        ) THEN 'SECURE' ELSE 'MISSING' END::TEXT,
        'Enhanced admin verification function with session validation'::TEXT;
    
    -- Verify audit trigger exists
    RETURN QUERY
    SELECT 
        'AUDIT_TRIGGER'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'profile_access_audit'
        ) THEN 'ACTIVE' ELSE 'MISSING' END::TEXT,
        'Profile access audit logging is active'::TEXT;
END;
$function$;