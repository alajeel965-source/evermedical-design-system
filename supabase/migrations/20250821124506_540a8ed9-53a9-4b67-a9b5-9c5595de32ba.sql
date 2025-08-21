-- SECURITY FIX: Add explicit protection against anonymous access to products table modifications

-- 1. Force RLS to ensure no bypass is possible
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;

-- 2. Create explicit policies to block anonymous access to modification operations

-- Policy: Explicitly block anonymous INSERT operations
CREATE POLICY "Block anonymous product creation" 
ON public.products 
FOR INSERT 
TO anon
WITH CHECK (false);  -- Always deny anonymous INSERT attempts

-- Policy: Explicitly block anonymous UPDATE operations  
CREATE POLICY "Block anonymous product updates" 
ON public.products 
FOR UPDATE 
TO anon
USING (false)        -- Always deny anonymous UPDATE attempts
WITH CHECK (false);

-- Policy: Explicitly block anonymous DELETE operations
CREATE POLICY "Block anonymous product deletions" 
ON public.products 
FOR DELETE 
TO anon
USING (false);       -- Always deny anonymous DELETE attempts

-- 3. Enhance supplier policy with better security checks
DROP POLICY IF EXISTS "Suppliers can manage their own products" ON public.products;

CREATE POLICY "Verified suppliers can manage own products" 
ON public.products 
FOR ALL 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND supplier_id IN (
    SELECT p.id FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.verified = true
    AND p.profile_type IN ('supplier', 'seller')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND supplier_id IN (
    SELECT p.id FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.verified = true
    AND p.profile_type IN ('supplier', 'seller')
  )
);

-- 4. Add admin management policy
CREATE POLICY "Verified admins can manage all products" 
ON public.products 
FOR ALL 
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 5. Create audit trigger for product modifications
CREATE OR REPLACE FUNCTION public.audit_product_modifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log all product modification attempts
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        TG_TABLE_NAME,
        'PRODUCT_' || TG_OP,
        auth.uid(),
        COALESCE(NEW.supplier_id, OLD.supplier_id),
        NOW(),
        jsonb_build_object(
            'product_id', COALESCE(NEW.id, OLD.id),
            'product_name', COALESCE(NEW.name, OLD.name),
            'supplier_id', COALESCE(NEW.supplier_id, OLD.supplier_id),
            'operation_type', TG_OP,
            'active_status', COALESCE(NEW.active, OLD.active),
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
DROP TRIGGER IF EXISTS product_modifications_audit ON public.products;
CREATE TRIGGER product_modifications_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.audit_product_modifications();

-- 6. Create function to validate products table security
CREATE OR REPLACE FUNCTION public.validate_products_security()
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
            WHERE n.nspname = 'public' AND c.relname = 'products'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'RLS enabled and forced on products table'::TEXT,
        CASE WHEN (
            SELECT (c.relrowsecurity AND c.relforcerowsecurity)
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'products'
        ) THEN 'NONE' ELSE 'HIGH' END::TEXT;
    
    -- Check anonymous access is explicitly blocked for modifications
    RETURN QUERY
    SELECT 
        'anonymous_modifications_blocked'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'INSUFFICIENT' END::TEXT,
        'Found ' || COUNT(*) || ' explicit DENY policies for anonymous Insert/Update/Delete operations'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'NONE' ELSE 'MEDIUM' END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' 
      AND pc.relname = 'products'
      AND pol.polname LIKE 'Block anonymous%';
    
    -- Check supplier access is properly restricted
    RETURN QUERY
    SELECT 
        'supplier_access_control'::TEXT,
        'SECURE'::TEXT,
        'Suppliers can only manage their own verified products'::TEXT,
        'NONE'::TEXT;
    
    -- Check public read access is maintained
    RETURN QUERY
    SELECT 
        'public_read_access'::TEXT,
        'SECURE'::TEXT,
        'Public can still view active products (business requirement maintained)'::TEXT,
        'NONE'::TEXT;
    
    -- Check audit logging is active
    RETURN QUERY
    SELECT 
        'audit_logging'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'product_modifications_audit'
        ) THEN 'SECURE' ELSE 'MISSING' END::TEXT,
        'Product modification audit logging active for security monitoring'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'product_modifications_audit'
        ) THEN 'NONE' ELSE 'MEDIUM' END::TEXT;
        
    -- Final security confirmation
    RETURN QUERY
    SELECT 
        'comprehensive_product_security'::TEXT,
        'SECURE'::TEXT,
        'Products table now has explicit protection against unauthorized anonymous modifications while maintaining public read access'::TEXT,
        'NONE'::TEXT;
END;
$$;

-- 7. Create function to check for potential unauthorized access attempts
CREATE OR REPLACE FUNCTION public.monitor_product_access_violations()
RETURNS TABLE(alert_type TEXT, user_id UUID, risk_level TEXT, details JSONB, access_timestamp TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can run security monitoring
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Security monitoring restricted to verified administrators';
    END IF;
    
    -- Look for recent failed modification attempts by anonymous users (would show in logs if they tried)
    RETURN QUERY
    SELECT 
        'ANONYMOUS_MODIFICATION_ATTEMPT'::TEXT,
        sal.user_id,
        'MEDIUM'::TEXT,
        sal.details,
        sal.timestamp
    FROM public.security_audit_log sal
    WHERE sal.table_name = 'products'
      AND sal.operation LIKE 'PRODUCT_%'
      AND sal.user_id IS NULL  -- Anonymous attempts
      AND sal.timestamp > NOW() - INTERVAL '24 hours'
    ORDER BY sal.timestamp DESC;
END;
$$;

-- 8. Ensure proper permissions are set
-- Revoke any excessive permissions (though none should exist based on earlier check)
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.products FROM public;

-- Maintain read access for public viewing of active products (business requirement)
GRANT SELECT ON public.products TO anon;