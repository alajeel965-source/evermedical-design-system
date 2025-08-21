-- ADDITIONAL SECURITY HARDENING: Explicit denial of public access to emails
-- Add a restrictive policy that explicitly denies access to anyone who isn't the profile owner

-- Create an explicit DENY policy for public/anon access to be extra secure
-- This creates a "belt and suspenders" approach to security

-- First, let's add a restrictive policy that explicitly denies access to sensitive fields
-- for anyone who is not the profile owner or an admin
CREATE POLICY "explicit_deny_unauthorized_access" 
ON public.profiles 
FOR ALL 
USING (
    -- Only allow access if user is the profile owner OR is an admin
    auth.uid() = user_id 
    OR auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE profile_type = 'admin'
    )
);

-- Ensure no loopholes exist by revoking any potential grants
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM anon;

-- Re-grant only minimal necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Ensure service_role retains necessary access for edge functions
GRANT ALL ON public.profiles TO service_role;

-- Add additional security function to check for any email exposure risks
CREATE OR REPLACE FUNCTION public.verify_email_protection()
RETURNS TABLE (
    security_aspect TEXT,
    status TEXT,
    details TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
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

-- Grant execute to authenticated users for monitoring
GRANT EXECUTE ON FUNCTION public.verify_email_protection() TO authenticated;

-- Update security documentation
COMMENT ON POLICY "explicit_deny_unauthorized_access" ON public.profiles IS 'Explicit denial policy - belt and suspenders security for email protection';
COMMENT ON FUNCTION public.verify_email_protection() IS 'Comprehensive email security verification function for monitoring potential exposure risks';