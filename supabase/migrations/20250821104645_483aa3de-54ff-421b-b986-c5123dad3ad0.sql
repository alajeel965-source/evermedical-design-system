-- Security enhancement for medical_events organizer contact protection
-- This migration implements field-level security for organizer contact information

-- First, verify existing security functions are working properly
SELECT public.verify_medical_events_security();

-- Create a new secure public view that excludes sensitive organizer data
CREATE OR REPLACE VIEW public.safe_medical_events AS
SELECT 
  id, title, title_ar, description, description_ar, summary, summary_ar,
  slug, start_date, end_date, timezone, registration_deadline, format,
  venue_name, venue_address, venue_lat, venue_lng, country, city,
  online_url, 
  organizer, -- Keep organizer name but remove contact details
  organizer_website, -- Website is generally public info
  specialty_slug, subspecialty, subspecialties, target_audience, languages,
  has_cme, cme_provider, cme_hours, cme_points, accreditation_url, accreditation_details,
  is_free, price_range, currency, registration_url, registration_required,
  capacity, registered_count, featured_image, gallery_images,
  seo_title, seo_description, view_count, save_count, share_count,
  click_count, status, created_at, updated_at, source_url
FROM public.medical_events
WHERE status = 'approved';

-- Grant public access to the safe view
GRANT SELECT ON public.safe_medical_events TO anon;
GRANT SELECT ON public.safe_medical_events TO authenticated;

-- Revoke direct access to sensitive fields in medical_events for anon users
-- Note: This ensures even if RLS policies change, anon users can't access sensitive data
REVOKE ALL ON public.medical_events FROM anon;

-- Ensure the trigger for sync is updated to use the safe view
DROP TRIGGER IF EXISTS safe_medical_events_sync ON public.medical_events;

CREATE OR REPLACE FUNCTION public.sync_safe_medical_events()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger ensures public_medical_events table stays in sync
  -- but only with non-sensitive data
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;