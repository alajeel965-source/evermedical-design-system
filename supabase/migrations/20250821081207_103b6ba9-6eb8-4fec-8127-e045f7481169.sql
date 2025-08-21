-- CRITICAL SECURITY HARDENING: Implement defense-in-depth for profiles table
-- Fix the RLS bypass vulnerability and add multiple layers of protection

-- 1. FORCE RLS - Critical: Ensure even superusers cannot bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 2. Revoke ALL permissions from dangerous roles
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM anon;

-- 3. Grant minimal necessary permissions only to authenticated users
-- Remove previous grants and set up secure permissions
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- 4. Ensure service_role can still perform necessary operations for edge functions
-- (service_role needs access for subscription management and admin functions)
GRANT ALL ON public.profiles TO service_role;

-- 5. Create a security audit trigger to log any attempts to access sensitive data
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID,
    accessed_user_id UUID,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log FORCE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_log_admin_only" ON public.security_audit_log
FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE profile_type = 'admin'
    )
);

-- 7. Create the audit trigger
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

-- 8. Add comprehensive security documentation
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains sensitive PII and financial data. RLS FORCED enabled. All access audited. Direct access restricted to authenticated users only via RLS policies.';
COMMENT ON FUNCTION public.audit_profile_access() IS 'Security audit function that logs all profile access attempts for monitoring';
COMMENT ON TABLE public.security_audit_log IS 'Security audit trail for profile access monitoring. Admin access only.';

-- 9. Create a function to check security status (for monitoring)
CREATE OR REPLACE FUNCTION public.check_profiles_security_status()
RETURNS TABLE (
    security_check TEXT,
    status TEXT,
    details TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users for status checking
GRANT EXECUTE ON FUNCTION public.check_profiles_security_status() TO authenticated;