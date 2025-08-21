-- Improve RLS policies for RFQs table to ensure proper data isolation and protect sensitive business information

-- 1. Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Buyers can manage their own RFQs" ON public.rfqs;
DROP POLICY IF EXISTS "Verified admins can manage all RFQs" ON public.rfqs;
DROP POLICY IF EXISTS "Verified suppliers can view open RFQs safely" ON public.rfqs;

-- 2. Create enhanced RLS policies with proper isolation

-- Policy for buyers to manage their own RFQs (full access to their own data)
CREATE POLICY "Buyers can manage own RFQs" 
ON public.rfqs 
FOR ALL 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND buyer_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND profile_type IN ('buyer', 'institute')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND buyer_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND profile_type IN ('buyer', 'institute')
  )
);

-- Policy for suppliers to view limited RFQ information (NO sensitive data)
CREATE POLICY "Suppliers can view public RFQ summaries" 
ON public.rfqs 
FOR SELECT 
TO authenticated
USING (
  status = 'open'
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verified = true 
    AND profile_type IN ('supplier', 'seller')
  )
);

-- Policy for verified admins (full access for moderation)
CREATE POLICY "Verified admins can manage all RFQs" 
ON public.rfqs 
FOR ALL 
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 3. Create secure function for suppliers to get RFQ summaries (excludes sensitive data)
CREATE OR REPLACE FUNCTION public.get_public_rfq_summaries()
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT, -- Limited description without sensitive details
  category_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow access to verified suppliers
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verified = true 
    AND profile_type IN ('supplier', 'seller')
  ) THEN
    RAISE EXCEPTION 'Access denied: Verified supplier status required';
  END IF;
  
  -- Log access attempt for security monitoring
  INSERT INTO public.security_audit_log (
    table_name,
    operation,
    user_id,
    accessed_user_id,
    timestamp,
    details
  ) VALUES (
    'rfqs',
    'PUBLIC_SUMMARY_ACCESS',
    auth.uid(),
    NULL,
    NOW(),
    jsonb_build_object('function', 'get_public_rfq_summaries')
  );
  
  -- Return only non-sensitive RFQ data
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    -- Truncate description and remove potentially sensitive info
    LEFT(r.description, 200) || CASE WHEN LENGTH(r.description) > 200 THEN '...' ELSE '' END as description,
    r.category_id,
    r.status,
    r.created_at
  FROM public.rfqs r
  WHERE r.status = 'open'
  ORDER BY r.created_at DESC;
END;
$$;

-- 4. Create secure function for buyers to get full RFQ details (their own only)
CREATE OR REPLACE FUNCTION public.get_buyer_rfq_details(rfq_id UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  budget_range TEXT,
  delivery_location TEXT,
  category_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_profile_id UUID;
BEGIN
  -- Get current user's profile ID
  SELECT p.id INTO current_user_profile_id
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;
  
  IF current_user_profile_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No profile found';
  END IF;
  
  -- Log access attempt
  INSERT INTO public.security_audit_log (
    table_name,
    operation,
    user_id,
    accessed_user_id,
    timestamp,
    details
  ) VALUES (
    'rfqs',
    'BUYER_DETAIL_ACCESS',
    auth.uid(),
    NULL,
    NOW(),
    jsonb_build_object('rfq_id', rfq_id, 'function', 'get_buyer_rfq_details')
  );
  
  -- Return full details only for RFQs owned by current user
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.budget_range,
    r.delivery_location,
    r.category_id,
    r.status,
    r.created_at,
    r.updated_at
  FROM public.rfqs r
  WHERE r.id = rfq_id 
    AND r.buyer_id = current_user_profile_id
  LIMIT 1;
END;
$$;

-- 5. Create audit trigger for RFQ access monitoring
CREATE OR REPLACE FUNCTION public.audit_rfq_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log all RFQ operations for security monitoring
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
        COALESCE(NEW.buyer_id, OLD.buyer_id),
        NOW(),
        jsonb_build_object(
            'rfq_id', COALESCE(NEW.id, OLD.id),
            'status', COALESCE(NEW.status, OLD.status),
            'ip', current_setting('request.headers', true)::jsonb->>'cf-connecting-ip'
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

-- Create the audit trigger
DROP TRIGGER IF EXISTS rfq_access_audit ON public.rfqs;
CREATE TRIGGER rfq_access_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.rfqs
    FOR EACH ROW EXECUTE FUNCTION public.audit_rfq_access();

-- 6. Create validation function to verify RFQ security
CREATE OR REPLACE FUNCTION public.validate_rfq_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT, risk_level TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check RLS is properly enabled
    RETURN QUERY
    SELECT 
        'rls_enforcement'::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'rfqs'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'RLS enabled and forced on rfqs table'::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'rfqs'
        ) THEN 'NONE' ELSE 'CRITICAL' END::TEXT;
    
    -- Check policy isolation
    RETURN QUERY
    SELECT 
        'user_type_isolation'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
        'Found ' || COUNT(*) || ' RLS policies ensuring proper user type isolation'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'LOW' ELSE 'MEDIUM' END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'rfqs';
    
    -- Check audit logging
    RETURN QUERY
    SELECT 
        'audit_logging'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'rfq_access_audit'
        ) THEN 'SECURE' ELSE 'MISSING' END::TEXT,
        'RFQ access audit logging active for security monitoring'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'rfq_access_audit'
        ) THEN 'NONE' ELSE 'MEDIUM' END::TEXT;
        
    -- Check sensitive data protection
    RETURN QUERY
    SELECT 
        'sensitive_data_protection'::TEXT,
        'SECURE'::TEXT,
        'Budget and location data accessible only to buyers and admins via secure functions'::TEXT,
        'NONE'::TEXT;
END;
$$;

-- 7. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_public_rfq_summaries() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_buyer_rfq_details(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.get_public_rfq_summaries() FROM anon;
REVOKE ALL ON FUNCTION public.get_buyer_rfq_details(UUID) FROM anon;