-- Fix function search path security warnings
-- Update functions to have immutable search paths

-- Fix audit function search path
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
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

-- Fix security status check function search path
CREATE OR REPLACE FUNCTION public.check_profiles_security_status()
RETURNS TABLE (
    security_check TEXT,
    status TEXT,
    details TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
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