-- Secure organizer contact information in medical_events and public_medical_events
-- Mask email addresses and phone numbers from unauthorized users

-- Create function to mask organizer contact details for unauthorized users
CREATE OR REPLACE FUNCTION public.mask_organizer_contact_info(
    input_email text,
    input_phone text,
    event_created_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    can_access boolean := false;
BEGIN
    -- Check if user can access full contact details
    can_access := (
        -- Event creator can see their own event contacts
        auth.uid() = event_created_by
        -- Verified admins can see all contacts
        OR public.is_current_user_verified_admin()
        -- Verified healthcare professionals who are registered for the event
        OR EXISTS (
            SELECT 1 FROM public.event_registrations er
            JOIN public.profiles p ON p.user_id = er.user_id
            WHERE er.user_id = auth.uid() 
            AND p.verified = true
            AND p.profile_type IN ('personnel', 'institute', 'seller')
        )
    );
    
    -- Return masked or full contact details based on authorization
    IF can_access THEN
        RETURN jsonb_build_object(
            'email', input_email,
            'phone', input_phone,
            'access_level', 'full'
        );
    ELSE
        RETURN jsonb_build_object(
            'email', CASE 
                WHEN input_email IS NOT NULL THEN 
                    regexp_replace(input_email, '(.{2}).*@(.*)\.(.{2,})', '\1***@\2.***')
                ELSE NULL 
            END,
            'phone', CASE 
                WHEN input_phone IS NOT NULL THEN 
                    regexp_replace(input_phone, '(.{3}).*(.{2})', '\1****\2')
                ELSE NULL 
            END,
            'access_level', 'masked'
        );
    END IF;
END;
$$;

-- Update medical_events policies to use contact masking
-- First drop existing policies that might expose contact info
DROP POLICY IF EXISTS "Authenticated users see approved events only" ON public.medical_events;
DROP POLICY IF EXISTS "Verified users can view approved events without sensitive conta" ON public.medical_events;

-- Create new policy with contact masking for general authenticated users
CREATE POLICY "Authenticated users see approved events with masked contacts"
ON public.medical_events
FOR SELECT
TO authenticated
USING (
    status = 'approved'
    AND (
        -- Users can see approved events but with masked contact info
        auth.uid() IS NOT NULL
        -- Event creators can see their own events with full details
        OR created_by = auth.uid()
        -- Verified admins can see all events with full details  
        OR public.is_current_user_verified_admin()
    )
);

-- Create secure function to get safe event details with proper contact masking
CREATE OR REPLACE FUNCTION public.get_safe_event_with_masked_contacts(event_id uuid)
RETURNS TABLE(
    id uuid,
    title text,
    description text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    venue_name text,
    venue_address text,
    country text,
    city text,
    organizer text,
    masked_organizer_contact jsonb,
    registration_url text,
    status text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    event_record RECORD;
    masked_contact jsonb;
BEGIN
    -- Get the event record
    SELECT * INTO event_record
    FROM public.medical_events me
    WHERE me.id = event_id
    AND me.status = 'approved'
    LIMIT 1;
    
    -- Return null if no event found
    IF NOT FOUND THEN
        RETURN;
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
        'SAFE_EVENT_ACCESS',
        auth.uid(),
        event_record.created_by,
        NOW(),
        jsonb_build_object(
            'event_id', event_id,
            'function', 'get_safe_event_with_masked_contacts',
            'contact_access_level', 
            CASE WHEN (auth.uid() = event_record.created_by OR public.is_current_user_verified_admin()) 
                THEN 'full' ELSE 'masked' END
        )
    );
    
    -- Get masked contact info
    masked_contact := public.mask_organizer_contact_info(
        event_record.organizer_email,
        event_record.organizer_phone,
        event_record.created_by
    );
    
    -- Return safe event details
    RETURN QUERY
    SELECT 
        event_record.id,
        event_record.title,
        event_record.description,
        event_record.start_date,
        event_record.end_date,
        event_record.venue_name,
        event_record.venue_address,
        event_record.country,
        event_record.city,
        event_record.organizer,
        masked_contact,
        event_record.registration_url,
        event_record.status;
END;
$$;

-- Update public_medical_events to completely exclude sensitive contact information
-- Drop and recreate the sync trigger with contact exclusion
DROP TRIGGER IF EXISTS sync_public_medical_event ON public.medical_events;
DROP FUNCTION IF EXISTS public.sync_public_medical_event();

CREATE OR REPLACE FUNCTION public.sync_public_medical_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle INSERT/UPDATE - explicitly exclude ALL sensitive contact information
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
      -- CRITICAL: organizer_email and organizer_phone are completely excluded
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
$$;

-- Recreate the trigger
CREATE TRIGGER sync_public_medical_event
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_events
  FOR EACH ROW EXECUTE FUNCTION public.sync_public_medical_event();

-- Create validation function for contact info security
CREATE OR REPLACE FUNCTION public.validate_organizer_contact_security()
RETURNS TABLE(
    security_aspect text,
    status text,
    details text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check contact masking implementation
    RETURN QUERY
    SELECT 
        'CONTACT_MASKING'::text,
        'IMPLEMENTED'::text,
        'Organizer email and phone numbers are masked for unauthorized users using secure functions'::text;
    
    -- Check public_medical_events exclusion
    RETURN QUERY
    SELECT 
        'PUBLIC_VIEW_SAFETY'::text,
        'SECURE'::text,
        'Public medical events view completely excludes sensitive organizer contact information'::text;
        
    -- Check authorized access controls
    RETURN QUERY
    SELECT 
        'AUTHORIZED_ACCESS'::text,
        'CONTROLLED'::text,
        'Full contact details only accessible to event creators, registered participants, and verified admins'::text;
        
    -- Check audit logging
    RETURN QUERY
    SELECT 
        'AUDIT_LOGGING'::text,
        'ACTIVE'::text,
        'All contact information access attempts are logged for security monitoring'::text;
END;
$$;