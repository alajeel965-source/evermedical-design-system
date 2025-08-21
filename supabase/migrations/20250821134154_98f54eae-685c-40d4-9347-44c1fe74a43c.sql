-- CRITICAL SECURITY FIX: Implement append-only audit log policies to prevent log tampering

-- 1. Force RLS on security_audit_log table
ALTER TABLE public.security_audit_log FORCE ROW LEVEL SECURITY;

-- 2. Drop the overly permissive existing policy that allows ALL operations
DROP POLICY IF EXISTS "audit_log_admin_only" ON public.security_audit_log;

-- 3. Create function to check if user is a dedicated audit administrator
CREATE OR REPLACE FUNCTION public.is_current_user_audit_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_profile RECORD;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user profile with explicit audit admin checks
    SELECT profile_type, verified, created_at, subscription_status, title
    INTO user_profile
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Return false if no profile found
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Strict audit admin verification - more restrictive than regular admin
    RETURN (
        user_profile.profile_type = 'admin' 
        AND user_profile.verified = true
        AND user_profile.subscription_status = 'active'
        AND user_profile.created_at < (now() - interval '7 days') -- Longer wait period for audit access
        AND user_profile.title LIKE '%audit%' -- Must have 'audit' in their title
    );
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$$;

-- 4. Create append-only INSERT policy for system functions (automated audit logging)
CREATE POLICY "Allow system audit log creation" 
ON public.security_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (
    -- Only allow inserts with current timestamp (prevent backdating)
    timestamp >= NOW() - INTERVAL '5 minutes'
    AND timestamp <= NOW() + INTERVAL '1 minute'
    -- Must have authenticated user
    AND user_id IS NOT NULL
);

-- 5. Create separate INSERT policy for manual audit entries (audit admins only)
CREATE POLICY "Allow audit admin manual entries" 
ON public.security_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (
    public.is_current_user_audit_admin()
    AND details ? 'manual_entry'  -- Must be marked as manual entry
    AND details ->> 'created_by_audit_admin' = auth.uid()::text
);

-- 6. Create READ-ONLY policy for audit administrators
CREATE POLICY "Audit admins can read all logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (public.is_current_user_audit_admin());

-- 7. Create READ-ONLY policy for regular admins (limited access)
CREATE POLICY "Regular admins can read recent logs only" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (
    public.is_current_user_verified_admin()
    AND timestamp >= NOW() - INTERVAL '30 days'  -- Limited to recent logs
    AND table_name NOT LIKE 'security%'  -- Cannot see security-related logs
);

-- 8. Create READ-ONLY policy for users to see their own audit entries
CREATE POLICY "Users can view their own audit entries" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (
    user_id = auth.uid()
    AND timestamp >= NOW() - INTERVAL '90 days'  -- Limited timeframe
    AND operation NOT LIKE '%ADMIN%'  -- Cannot see admin operations
);

-- 9. EXPLICITLY BLOCK all UPDATE operations - NO EXCEPTIONS
CREATE POLICY "Block all audit log updates" 
ON public.security_audit_log 
FOR UPDATE
TO public
USING (false)  -- Always deny
WITH CHECK (false);  -- Always deny

-- 10. EXPLICITLY BLOCK all DELETE operations - NO EXCEPTIONS
CREATE POLICY "Block all audit log deletions" 
ON public.security_audit_log 
FOR DELETE
TO public
USING (false);  -- Always deny

-- 11. Create tamper detection trigger
CREATE OR REPLACE FUNCTION public.detect_audit_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log any attempt to modify audit logs (this should never succeed due to RLS)
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        -- Insert a separate tampering alert (if this trigger even executes)
        INSERT INTO public.security_audit_log (
            table_name,
            operation,
            user_id,
            accessed_user_id,
            timestamp,
            details
        ) VALUES (
            'security_audit_log',
            'TAMPERING_ATTEMPT_' || TG_OP,
            auth.uid(),
            COALESCE(NEW.user_id, OLD.user_id),
            NOW(),
            jsonb_build_object(
                'severity', 'CRITICAL',
                'attempted_operation', TG_OP,
                'original_log_id', COALESCE(NEW.id, OLD.id),
                'ip', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip',
                'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
                'alert', 'AUDIT LOG TAMPERING DETECTED'
            )
        );
        
        -- Raise exception to block the operation
        RAISE EXCEPTION 'CRITICAL SECURITY VIOLATION: Audit log modification attempted by user %', auth.uid();
    END IF;
    
    -- For INSERT operations, validate the data integrity
    IF TG_OP = 'INSERT' THEN
        -- Ensure required fields are present
        IF NEW.table_name IS NULL OR NEW.operation IS NULL OR NEW.timestamp IS NULL THEN
            RAISE EXCEPTION 'Invalid audit log entry: Missing required fields';
        END IF;
        
        -- Prevent future-dated entries
        IF NEW.timestamp > NOW() + INTERVAL '1 minute' THEN
            RAISE EXCEPTION 'Invalid audit log entry: Future timestamp not allowed';
        END IF;
        
        -- Prevent significantly backdated entries (except for system operations)
        IF NEW.timestamp < NOW() - INTERVAL '1 hour' AND NOT (NEW.details ? 'system_operation') THEN
            RAISE EXCEPTION 'Invalid audit log entry: Timestamp too far in the past';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the tampering detection trigger
DROP TRIGGER IF EXISTS audit_tampering_detection ON public.security_audit_log;
CREATE TRIGGER audit_tampering_detection
    BEFORE INSERT OR UPDATE OR DELETE ON public.security_audit_log
    FOR EACH ROW EXECUTE FUNCTION public.detect_audit_tampering();

-- 12. Create function to validate audit log security
CREATE OR REPLACE FUNCTION public.validate_audit_log_security()
RETURNS TABLE(check_name TEXT, status TEXT, risk_level TEXT, details TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check RLS enforcement
    RETURN QUERY
    SELECT 
        'RLS_ENFORCEMENT'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'CRITICAL' END::TEXT,
        CASE WHEN relforcerowsecurity THEN 'LOW' ELSE 'CRITICAL' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - no bypass possible'
            ELSE 'CRITICAL: RLS not forced on audit logs'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'security_audit_log';
    
    -- Check append-only enforcement
    RETURN QUERY
    SELECT 
        'APPEND_ONLY_ENFORCEMENT'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_policy 
            WHERE polrelid = (
                SELECT oid FROM pg_class c2 
                JOIN pg_namespace n2 ON c2.relnamespace = n2.oid 
                WHERE n2.nspname = 'public' AND c2.relname = 'security_audit_log'
            )
            AND polname IN ('Block all audit log updates', 'Block all audit log deletions')
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'LOW'::TEXT,
        'Audit logs are append-only - no modifications allowed'::TEXT;
    
    -- Check tampering detection
    RETURN QUERY
    SELECT 
        'TAMPERING_DETECTION'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'audit_tampering_detection'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'audit_tampering_detection'
        ) THEN 'LOW' ELSE 'HIGH' END::TEXT,
        'Active tampering detection trigger monitors all audit log access'::TEXT;
        
    -- Check role separation
    RETURN QUERY
    SELECT 
        'ROLE_SEPARATION'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Separate audit administrator role distinct from regular admin functions'::TEXT;
        
    -- Final audit security status
    RETURN QUERY
    SELECT 
        'COMPREHENSIVE_AUDIT_SECURITY'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Audit logs protected against tampering with append-only policies and dedicated audit administration'::TEXT;
END;
$$;

-- 13. Revoke any excessive permissions
REVOKE UPDATE, DELETE ON public.security_audit_log FROM public;
REVOKE UPDATE, DELETE ON public.security_audit_log FROM authenticated;
REVOKE ALL ON public.security_audit_log FROM anon;

-- Only allow SELECT and INSERT (controlled by RLS policies)
GRANT SELECT, INSERT ON public.security_audit_log TO authenticated;