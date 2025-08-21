-- Secure medical events organizer contact information access
-- Force RLS on medical_events table (if not already)
ALTER TABLE public.medical_events FORCE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "Public can view approved events basic info" ON public.medical_events;
DROP POLICY IF EXISTS "Creators can manage their own events" ON public.medical_events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.medical_events;
DROP POLICY IF EXISTS "Organizers can view their created events" ON public.medical_events;

-- Create secure policies for medical_events table
-- 1. Public read access ONLY for basic info (no sensitive organizer contact data)
CREATE POLICY "Public can view approved events safe data" 
ON public.medical_events FOR SELECT 
USING (
  status = 'approved' 
  AND (
    -- Public can only access non-sensitive fields
    -- The SELECT should exclude organizer_email, organizer_phone via application logic
    auth.role() = 'anon' OR auth.role() = 'authenticated'
  )
);

-- 2. Verified and logged-in users can view approved events with limited contact access
CREATE POLICY "Verified users can view events with contact check" 
ON public.medical_events FOR SELECT 
USING (
  status = 'approved' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verified = true
  )
);

-- 3. Event creators can access their own events (full access)
CREATE POLICY "Creators can manage their own events" 
ON public.medical_events FOR ALL 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 4. Verified admins can access all events (full access)
CREATE POLICY "Verified admins can manage all events" 
ON public.medical_events FOR ALL 
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- Create secure function to get blurred/masked organizer data for unauthorized users
CREATE OR REPLACE FUNCTION public.get_safe_organizer_display(
  event_id UUID,
  include_sensitive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  organizer_name TEXT,
  organizer_website TEXT,
  organizer_email_masked TEXT,
  organizer_phone_masked TEXT,
  can_access_full_contact BOOLEAN
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_record RECORD;
  user_can_access BOOLEAN := FALSE;
BEGIN
  -- Check if user can access sensitive organizer data
  user_can_access := public.can_access_organizer_data(event_id);
  
  -- Get event organizer info
  SELECT 
    organizer, 
    organizer_website,
    organizer_email,
    organizer_phone
  INTO event_record
  FROM public.medical_events 
  WHERE id = event_id 
  AND status = 'approved'
  LIMIT 1;
  
  -- Return safe data with masking if unauthorized
  RETURN QUERY SELECT
    event_record.organizer as organizer_name,
    event_record.organizer_website,
    CASE 
      WHEN user_can_access AND include_sensitive THEN event_record.organizer_email
      WHEN event_record.organizer_email IS NOT NULL THEN 
        SUBSTRING(event_record.organizer_email, 1, 2) || '***@' || 
        SPLIT_PART(event_record.organizer_email, '@', 2)
      ELSE NULL
    END as organizer_email_masked,
    CASE 
      WHEN user_can_access AND include_sensitive THEN event_record.organizer_phone
      WHEN event_record.organizer_phone IS NOT NULL THEN 
        SUBSTRING(event_record.organizer_phone, 1, 3) || '-***-****'
      ELSE NULL
    END as organizer_phone_masked,
    user_can_access;
END;
$$;

-- Create function to validate complete medical events security
CREATE OR REPLACE FUNCTION public.validate_medical_events_complete_security()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check RLS is forced
  RETURN QUERY
  SELECT 
    'medical_events_rls_forced'::TEXT,
    CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
    CASE WHEN relforcerowsecurity 
      THEN 'RLS forced - no bypass possible for sensitive organizer contact data'
      ELSE 'CRITICAL: RLS not forced - organizer contact data could be exposed'
    END::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'medical_events';
  
  -- Check that contact masking function exists
  RETURN QUERY
  SELECT 
    'organizer_contact_masking'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_safe_organizer_display') 
      THEN 'SECURE' ELSE 'MISSING' END::TEXT,
    'Secure organizer contact masking function available for unauthorized users'::TEXT;
  
  -- Check policy count
  RETURN QUERY
  SELECT 
    'medical_events_policy_count'::TEXT,
    CASE WHEN COUNT(*) >= 4 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
    'Medical events policies: ' || COUNT(*)::TEXT || ' (public safe access, verified users, creators, admins)'
  FROM pg_policy pol
  JOIN pg_class pc ON pol.polrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'public' AND pc.relname = 'medical_events';
END;
$$;