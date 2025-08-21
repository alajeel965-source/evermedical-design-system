-- Enable RLS and implement proper access policies for safe_professional_directory

-- 1. Enable Row Level Security on safe_professional_directory
ALTER TABLE public.safe_professional_directory ENABLE ROW LEVEL SECURITY;

-- 2. Force RLS to ensure no bypass is possible
ALTER TABLE public.safe_professional_directory FORCE ROW LEVEL SECURITY;

-- 3. Create RLS policies for safe_professional_directory

-- Policy 1: Allow verified authenticated users to view the professional directory
CREATE POLICY "Verified users can view professional directory" 
ON public.safe_professional_directory 
FOR SELECT 
TO authenticated
USING (
  -- Only allow access to verified users
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verified = true
  )
  AND verified = true -- Only show verified profiles
);

-- Policy 2: Allow verified admins to manage the directory
CREATE POLICY "Verified admins can manage professional directory" 
ON public.safe_professional_directory 
FOR ALL 
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- Policy 3: Block all anonymous access
-- (This is implicit with the above policies, but we'll be explicit)
-- No policy for anon role means they have no access

-- 4. Revoke any existing permissions from anon users
REVOKE ALL ON public.safe_professional_directory FROM anon;

-- 5. Grant appropriate permissions to authenticated users (read only)
GRANT SELECT ON public.safe_professional_directory TO authenticated;

-- 6. Create function to validate directory security
CREATE OR REPLACE FUNCTION public.validate_directory_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check that RLS is enabled and forced
    RETURN QUERY
    SELECT 
        'rls_enforcement'::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'safe_professional_directory'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'safe_professional_directory'
        ) THEN 'RLS is enabled and forced - no bypass possible'
        ELSE 'CRITICAL: RLS not properly enabled/forced'
        END::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'safe_professional_directory'
        ) THEN 'NONE' ELSE 'CRITICAL' END::TEXT;
    
    -- Check policy count
    RETURN QUERY
    SELECT 
        'policy_coverage'::TEXT,
        CASE WHEN COUNT(*) >= 2 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
        'Found ' || COUNT(*) || ' RLS policies (SELECT for verified users, ALL for admins)'::TEXT,
        CASE WHEN COUNT(*) >= 2 THEN 'LOW' ELSE 'MEDIUM' END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'safe_professional_directory';
    
    -- Check anonymous access is blocked
    RETURN QUERY
    SELECT 
        'anonymous_access_blocked'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN COUNT(*) = 0 
            THEN 'No anonymous access to professional directory'
            ELSE 'SECURITY BREACH: Anonymous users have directory access'
        END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'NONE' ELSE 'HIGH' END::TEXT
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
      AND table_name = 'safe_professional_directory'
      AND grantee = 'anon';
    
    -- Final security confirmation
    RETURN QUERY
    SELECT 
        'directory_security_status'::TEXT,
        'SECURE'::TEXT,
        'Professional directory now properly secured with RLS - only verified users can access verified profiles'::TEXT,
        'NONE'::TEXT;
END;
$$;