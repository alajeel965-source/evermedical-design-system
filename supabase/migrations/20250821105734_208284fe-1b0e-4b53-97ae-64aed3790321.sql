-- Fix the security definer view issue and implement proper contact info protection
-- Remove the problematic view and implement a better approach

-- Drop the problematic view
DROP VIEW IF EXISTS public.safe_medical_events;

-- Create the safe trigger instead and make sure the sync is properly secured
CREATE TRIGGER safe_medical_events_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_events
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_safe_medical_events();

-- Verify the organizer contact access function is working correctly
-- This function already exists and provides secure access to organizer data
CREATE OR REPLACE FUNCTION public.verify_organizer_contact_security()
RETURNS TABLE(check_name text, status text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Verify organizer contact function exists and is secure
    RETURN QUERY
    SELECT 
        'ORGANIZER_CONTACT_FUNCTION'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_organizer_contact_info' 
              AND prosecdef = true
        ) THEN 'SECURE' ELSE 'MISSING' END::TEXT,
        'Secure function for authorized organizer contact access exists and uses SECURITY DEFINER'::TEXT;
    
    -- Verify public table excludes sensitive data
    RETURN QUERY
    SELECT 
        'PUBLIC_TABLE_SAFETY'::TEXT,
        CASE WHEN NOT EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = 'public_medical_events'
            AND column_name IN ('organizer_email', 'organizer_phone')
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'Public medical events table excludes sensitive organizer contact fields'::TEXT;
        
    -- Verify anon access is properly restricted
    RETURN QUERY
    SELECT 
        'ANON_ACCESS_RESTRICTION'::TEXT,
        CASE WHEN NOT EXISTS(
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE table_schema = 'public' 
            AND table_name = 'medical_events'
            AND grantee = 'anon'
            AND privilege_type = 'SELECT'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'Anonymous users cannot directly access medical_events table with sensitive data'::TEXT;
END;
$$;

-- Run the verification
SELECT public.verify_organizer_contact_security();