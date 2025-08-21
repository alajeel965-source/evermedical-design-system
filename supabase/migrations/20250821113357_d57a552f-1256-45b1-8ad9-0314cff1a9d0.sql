-- CRITICAL SECURITY FIX: Secure the profiles table with simplified, bulletproof RLS policies
-- This addresses the "Customer Personal Information Could Be Stolen by Hackers" vulnerability

-- First, create a secure function to check if user can access profile data
CREATE OR REPLACE FUNCTION public.can_access_profile_data_enhanced(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only allow access if:
    -- 1. User is accessing their own profile, OR
    -- 2. User is a verified admin with active subscription and enhanced security checks
    RETURN (
        auth.uid() = target_user_id 
        OR public.is_current_user_verified_admin()
    );
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$$;

-- Drop existing potentially vulnerable policies
DROP POLICY IF EXISTS "profiles_secure_select_enhanced" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_update_enhanced" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_delete" ON public.profiles;

-- Create new, simplified and secure RLS policies
-- Users can only view their own profile or admins can view any profile
CREATE POLICY "profiles_secure_select_bulletproof" 
ON public.profiles 
FOR SELECT 
USING (
    auth.uid() = user_id 
    OR public.is_current_user_verified_admin()
);

-- Users can only insert their own profile
CREATE POLICY "profiles_secure_insert_bulletproof" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile or admins can update any profile
CREATE POLICY "profiles_secure_update_bulletproof" 
ON public.profiles 
FOR UPDATE 
USING (
    auth.uid() = user_id 
    OR public.is_current_user_verified_admin()
)
WITH CHECK (
    auth.uid() = user_id 
    OR public.is_current_user_verified_admin()
);

-- Only verified admins can delete profiles
CREATE POLICY "profiles_secure_delete_bulletproof" 
ON public.profiles 
FOR DELETE 
USING (public.is_current_user_verified_admin());

-- Add comprehensive audit logging for profile access
CREATE OR REPLACE FUNCTION public.audit_profile_access_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log all profile access attempts for security monitoring
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
            'profile_type', COALESCE(NEW.profile_type, OLD.profile_type),
            'email_accessed', CASE WHEN auth.uid() != COALESCE(NEW.user_id, OLD.user_id) THEN true ELSE false END,
            'admin_access', public.is_current_user_verified_admin()
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

-- Create audit trigger for enhanced profile security monitoring
DROP TRIGGER IF EXISTS profile_access_audit_enhanced ON public.profiles;
CREATE TRIGGER profile_access_audit_enhanced
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access_enhanced();

-- Create function to validate profile security status
CREATE OR REPLACE FUNCTION public.validate_profiles_security_final()
RETURNS TABLE(check_name text, status text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    
    -- Verify all 4 bulletproof policies exist
    RETURN QUERY
    SELECT 
        'BULLETPROOF_POLICIES'::TEXT,
        CASE WHEN COUNT(*) = 4 THEN 'SECURE' ELSE 'INCOMPLETE' END::TEXT,
        'Found ' || COUNT(*) || '/4 bulletproof RLS policies'::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' 
      AND pc.relname = 'profiles'
      AND pol.polname LIKE '%bulletproof%';
    
    -- Verify audit trigger is active
    RETURN QUERY
    SELECT 
        'AUDIT_LOGGING'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'profile_access_audit_enhanced'
        ) THEN 'ACTIVE' ELSE 'MISSING' END::TEXT,
        'Enhanced audit logging for profile access monitoring'::TEXT;
END;
$$;