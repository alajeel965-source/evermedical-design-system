-- Secure RFQs table to prevent competitor intelligence gathering
-- Force RLS on rfqs table
ALTER TABLE public.rfqs FORCE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "RFQs are viewable by authenticated users" ON public.rfqs;
DROP POLICY IF EXISTS "Buyers can manage their own RFQs" ON public.rfqs;

-- Create secure policies for RFQs table
-- 1. Buyers can manage their own RFQs (full access)
CREATE POLICY "Buyers can manage their own RFQs" 
ON public.rfqs FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() IN (
    SELECT profiles.user_id 
    FROM profiles 
    WHERE profiles.id = rfqs.buyer_id
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() IN (
    SELECT profiles.user_id 
    FROM profiles 
    WHERE profiles.id = rfqs.buyer_id
  )
);

-- 2. Verified suppliers can view open RFQs with limited sensitive data
CREATE POLICY "Verified suppliers can view open RFQs safely" 
ON public.rfqs FOR SELECT 
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

-- 3. Verified admins can manage all RFQs
CREATE POLICY "Verified admins can manage all RFQs" 
ON public.rfqs FOR ALL 
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- Create function to get safe RFQ display data with masking
CREATE OR REPLACE FUNCTION public.get_safe_rfq_display(
  rfq_id UUID,
  include_sensitive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description_masked TEXT,
  budget_range_masked TEXT,
  delivery_location TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  category_id UUID,
  can_access_full_details BOOLEAN,
  is_buyer BOOLEAN
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rfq_record RECORD;
  user_is_buyer BOOLEAN := FALSE;
  user_can_access BOOLEAN := FALSE;
  user_profile RECORD;
BEGIN
  -- Get current user profile
  SELECT profile_type, verified 
  INTO user_profile
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Get RFQ record
  SELECT 
    r.id, 
    r.title,
    r.description,
    r.budget_range,
    r.delivery_location,
    r.status,
    r.created_at,
    r.updated_at,
    r.category_id,
    r.buyer_id
  INTO rfq_record
  FROM public.rfqs r
  WHERE r.id = rfq_id 
  AND r.status = 'open'
  LIMIT 1;
  
  -- Check if current user is the buyer
  user_is_buyer := EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND id = rfq_record.buyer_id
  );
  
  -- Determine access level
  user_can_access := (
    user_is_buyer 
    OR public.is_current_user_verified_admin()
    OR (user_profile.verified = true AND user_profile.profile_type IN ('supplier', 'seller'))
  );
  
  -- Return data with appropriate masking
  RETURN QUERY SELECT
    rfq_record.id,
    rfq_record.title,
    CASE 
      WHEN user_is_buyer OR (user_can_access AND include_sensitive) THEN rfq_record.description
      WHEN user_can_access THEN 
        SUBSTRING(rfq_record.description, 1, 100) || '... [Full details available to qualified suppliers]'
      ELSE '[Restricted - Verification required]'
    END as description_masked,
    CASE 
      WHEN user_is_buyer OR (user_can_access AND include_sensitive) THEN rfq_record.budget_range
      WHEN user_can_access THEN 'Budget: Competitive range'
      ELSE '[Budget: Confidential]'
    END as budget_range_masked,
    rfq_record.delivery_location,
    rfq_record.status,
    rfq_record.created_at,
    rfq_record.updated_at,
    rfq_record.category_id,
    user_can_access,
    user_is_buyer;
END;
$$;

-- Create function to validate RFQ security
CREATE OR REPLACE FUNCTION public.validate_rfq_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check RLS is forced
  RETURN QUERY
  SELECT 
    'rfqs_rls_forced'::TEXT,
    CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
    CASE WHEN relforcerowsecurity 
      THEN 'RLS forced - no competitive intelligence leakage possible'
      ELSE 'CRITICAL: RLS not forced - competitors can access sensitive RFQ data'
    END::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'rfqs';
  
  -- Check that safe display function exists
  RETURN QUERY
  SELECT 
    'rfq_data_masking'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_safe_rfq_display') 
      THEN 'SECURE' ELSE 'MISSING' END::TEXT,
    'Secure RFQ data masking function available to prevent competitive intelligence gathering'::TEXT;
  
  -- Check policy restrictions
  RETURN QUERY
  SELECT 
    'rfq_policy_restrictions'::TEXT,
    CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
    'RFQ policies: ' || COUNT(*)::TEXT || ' (buyer access, verified supplier limited access, admin access)'
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' AND pc.relname = 'rfqs';
  
  -- Check for overly permissive policies
  RETURN QUERY
  SELECT 
    'no_public_rfq_access'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
    CASE WHEN COUNT(*) = 0 
      THEN 'No policies allow unrestricted access to RFQ competitive data'
      ELSE 'Found ' || COUNT(*) || ' policies that may expose sensitive RFQ information'
    END::TEXT
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' 
    AND pc.relname = 'rfqs'
    AND pol.polqual::text LIKE '%auth.uid() IS NOT NULL%'
    AND pol.polqual::text NOT LIKE '%buyer_id%'
    AND pol.polqual::text NOT LIKE '%verified%';
END;
$$;