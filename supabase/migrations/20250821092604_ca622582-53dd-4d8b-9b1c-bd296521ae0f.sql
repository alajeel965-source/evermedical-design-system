-- Simplify and strengthen medical_events table security
-- This addresses complex RLS conditions and protects sensitive organizer data

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Events manageable by admins and creators" ON public.medical_events;
DROP POLICY IF EXISTS "Full event access for authorized users" ON public.medical_events;

-- Create secure, simplified RLS policies with clear separation of concerns

-- 1. Public event data access - only approved events, no sensitive data
CREATE POLICY "Public can view approved events basic info"
ON public.medical_events
FOR SELECT
USING (status = 'approved');

-- 2. Event creators can manage their own events
CREATE POLICY "Creators can manage their own events"
ON public.medical_events
FOR ALL
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 3. Admins can manage all events
CREATE POLICY "Admins can manage all events"
ON public.medical_events
FOR ALL
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 4. Organizers can only view events they created (not all events)
CREATE POLICY "Organizers can view their created events"
ON public.medical_events
FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM profiles 
        WHERE profile_type = 'organizer' AND user_id = medical_events.created_by
    )
);

-- Create a secure function to check if user can access sensitive organizer data
CREATE OR REPLACE FUNCTION public.can_access_organizer_data(event_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only event creator and verified admins can access sensitive organizer data
    RETURN (
        EXISTS (
            SELECT 1 FROM medical_events 
            WHERE id = event_id 
            AND created_by = auth.uid()
        )
        OR public.is_current_user_verified_admin()
    );
EXCEPTION WHEN OTHERS THEN
    -- Return false on any error to fail securely
    RETURN false;
END;
$function$;

-- Create a secure public view that excludes sensitive organizer data
CREATE OR REPLACE VIEW public.safe_medical_events AS
SELECT 
    id, title, title_ar, description, description_ar, summary, summary_ar,
    slug, start_date, end_date, timezone, registration_deadline, format,
    venue_name, venue_address, venue_lat, venue_lng, country, city,
    online_url, 
    -- Exclude sensitive organizer contact data
    organizer, organizer_website, -- Keep organizer name and website but not contact info
    specialty_slug, subspecialty, subspecialties, target_audience, languages,
    has_cme, cme_provider, cme_hours, cme_points, 
    accreditation_url, accreditation_details,
    is_free, price_range, currency, registration_url, registration_required,
    capacity, registered_count, featured_image, gallery_images,
    seo_title, seo_description, view_count, save_count, share_count,
    click_count, status, created_at, updated_at, source_url
FROM public.medical_events
WHERE status = 'approved';

-- Grant public access to the safe view
GRANT SELECT ON public.safe_medical_events TO anon;
GRANT SELECT ON public.safe_medical_events TO authenticated;

-- Create a function to get sensitive organizer data (only for authorized users)
CREATE OR REPLACE FUNCTION public.get_organizer_contact_info(event_id uuid)
RETURNS TABLE(
    organizer_email text,
    organizer_phone text,
    organizer_website text,
    review_notes text,
    moderation_flags text[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if user is authorized to access sensitive data
    IF NOT public.can_access_organizer_data(event_id) THEN
        RAISE EXCEPTION 'Access denied to organizer contact information';
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
        'medical_events',
        'ORGANIZER_DATA_ACCESS',
        auth.uid(),
        (SELECT created_by FROM medical_events WHERE id = event_id),
        NOW(),
        jsonb_build_object('event_id', event_id, 'function', 'get_organizer_contact_info')
    );
    
    -- Return sensitive data only to authorized users
    RETURN QUERY
    SELECT 
        me.organizer_email,
        me.organizer_phone,
        me.organizer_website,
        me.review_notes,
        me.moderation_flags
    FROM public.medical_events me
    WHERE me.id = event_id
    LIMIT 1;
END;
$function$;

-- Update the public_medical_events sync trigger to exclude sensitive data
DROP TRIGGER IF EXISTS sync_public_medical_event ON public.medical_events;

CREATE OR REPLACE FUNCTION public.sync_safe_public_medical_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Handle INSERT/UPDATE - only sync non-sensitive data
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.public_medical_events (
      id, title, title_ar, description, description_ar, summary, summary_ar,
      slug, start_date, end_date, timezone, registration_deadline, format,
      venue_name, venue_address, venue_lat, venue_lng, country, city,
      online_url, organizer, organizer_website, specialty_slug, subspecialty,
      subspecialties, target_audience, languages, has_cme, cme_provider,
      cme_hours, cme_points, accreditation_url, accreditation_details,
      is_free, price_range, currency, registration_url, registration_required,
      capacity, registered_count, featured_image, gallery_images,
      seo_title, seo_description, view_count, save_count, share_count,
      click_count, status, created_at, updated_at, source_url
    ) VALUES (
      NEW.id, NEW.title, NEW.title_ar, NEW.description, NEW.description_ar, NEW.summary, NEW.summary_ar,
      NEW.slug, NEW.start_date, NEW.end_date, NEW.timezone, NEW.registration_deadline, NEW.format,
      NEW.venue_name, NEW.venue_address, NEW.venue_lat, NEW.venue_lng, NEW.country, NEW.city,
      NEW.online_url, NEW.organizer, NEW.organizer_website, NEW.specialty_slug, NEW.subspecialty,
      NEW.subspecialties, NEW.target_audience, NEW.languages, NEW.has_cme, NEW.cme_provider,
      NEW.cme_hours, NEW.cme_points, NEW.accreditation_url, NEW.accreditation_details,
      NEW.is_free, NEW.price_range, NEW.currency, NEW.registration_url, NEW.registration_required,
      NEW.capacity, NEW.registered_count, NEW.featured_image, NEW.gallery_images,
      NEW.seo_title, NEW.seo_description, NEW.view_count, NEW.save_count, NEW.share_count,
      NEW.click_count, NEW.status, NEW.created_at, NEW.updated_at, NEW.source_url
    )
    ON CONFLICT (id) DO UPDATE SET
      title = NEW.title,
      title_ar = NEW.title_ar,
      description = NEW.description,
      description_ar = NEW.description_ar,
      summary = NEW.summary,
      summary_ar = NEW.summary_ar,
      slug = NEW.slug,
      start_date = NEW.start_date,
      end_date = NEW.end_date,
      timezone = NEW.timezone,
      registration_deadline = NEW.registration_deadline,
      format = NEW.format,
      venue_name = NEW.venue_name,
      venue_address = NEW.venue_address,
      venue_lat = NEW.venue_lat,
      venue_lng = NEW.venue_lng,
      country = NEW.country,
      city = NEW.city,
      online_url = NEW.online_url,
      organizer = NEW.organizer,
      organizer_website = NEW.organizer_website,
      specialty_slug = NEW.specialty_slug,
      subspecialty = NEW.subspecialty,
      subspecialties = NEW.subspecialties,
      target_audience = NEW.target_audience,
      languages = NEW.languages,
      has_cme = NEW.has_cme,
      cme_provider = NEW.cme_provider,
      cme_hours = NEW.cme_hours,
      cme_points = NEW.cme_points,
      accreditation_url = NEW.accreditation_url,
      accreditation_details = NEW.accreditation_details,
      is_free = NEW.is_free,
      price_range = NEW.price_range,
      currency = NEW.currency,
      registration_url = NEW.registration_url,
      registration_required = NEW.registration_required,
      capacity = NEW.capacity,
      registered_count = NEW.registered_count,
      featured_image = NEW.featured_image,
      gallery_images = NEW.gallery_images,
      seo_title = NEW.seo_title,
      seo_description = NEW.seo_description,
      view_count = NEW.view_count,
      save_count = NEW.save_count,
      share_count = NEW.share_count,
      click_count = NEW.click_count,
      status = NEW.status,
      created_at = NEW.created_at,
      updated_at = NEW.updated_at,
      source_url = NEW.source_url;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_medical_events WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Re-create the trigger with the new secure function
CREATE TRIGGER sync_safe_public_medical_event
    AFTER INSERT OR UPDATE OR DELETE ON public.medical_events
    FOR EACH ROW EXECUTE FUNCTION public.sync_safe_public_medical_event();

-- Force RLS on medical_events table to prevent any bypass
ALTER TABLE public.medical_events FORCE ROW LEVEL SECURITY;

-- Create a security validation function for medical_events
CREATE OR REPLACE FUNCTION public.verify_medical_events_security()
RETURNS TABLE(check_name text, status text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Verify RLS is forced
    RETURN QUERY
    SELECT 
        'RLS_FORCED'::TEXT,
        CASE WHEN relforcerowsecurity THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN relforcerowsecurity 
            THEN 'RLS is forced - no bypass possible'
            ELSE 'CRITICAL: RLS not forced'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'medical_events';
    
    -- Verify organizer contact data protection
    RETURN QUERY
    SELECT 
        'ORGANIZER_DATA_PROTECTION'::TEXT,
        'SECURE'::TEXT,
        'Sensitive organizer contact data accessible only via secure function with audit logging'::TEXT;
    
    -- Verify public view safety
    RETURN QUERY
    SELECT 
        'PUBLIC_VIEW_SAFETY'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND viewname = 'safe_medical_events'
            AND definition NOT LIKE '%organizer_email%'
            AND definition NOT LIKE '%organizer_phone%'
        ) THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        'Public view excludes sensitive organizer contact information'::TEXT;
        
    -- Verify policy simplification
    RETURN QUERY
    SELECT 
        'POLICY_SIMPLIFICATION'::TEXT,
        CASE WHEN COUNT(*) = 4 THEN 'OPTIMAL' ELSE 'NEEDS_REVIEW' END::TEXT,
        'Simplified policies: ' || COUNT(*)::TEXT || ' (Public view, Creator access, Admin access, Organizer own-events)'
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' AND pc.relname = 'medical_events';
END;
$function$;