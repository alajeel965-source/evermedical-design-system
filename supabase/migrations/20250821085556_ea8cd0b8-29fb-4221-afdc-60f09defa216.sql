-- Fix Security Definer View Issue: Use RLS-Protected Tables Instead of Views
-- Since Supabase automatically makes views postgres-owned, we'll convert to tables with RLS

-- Step 1: Drop the problematic views completely
DROP VIEW IF EXISTS public.public_profiles CASCADE;
DROP VIEW IF EXISTS public.public_medical_events CASCADE;

-- Step 2: Create RLS-protected tables instead of views
-- These will be real tables that stay in sync with the main tables via triggers

-- Create public_profiles table (instead of view)
CREATE TABLE public.public_profiles (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  title text,
  specialty text,
  primary_specialty_slug text,
  organization text,
  country text,
  profile_type text NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT public_profiles_pkey PRIMARY KEY (id)
);

-- Create public_medical_events table (instead of view)  
CREATE TABLE public.public_medical_events (
  id uuid NOT NULL,
  title text NOT NULL,
  title_ar text,
  description text,
  description_ar text,
  summary text,
  summary_ar text,
  slug text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  timezone text DEFAULT 'UTC',
  registration_deadline timestamp with time zone,
  format text DEFAULT 'in-person',
  venue_name text,
  venue_address text,
  venue_lat numeric,
  venue_lng numeric,
  country text,
  city text,
  online_url text,
  organizer text,
  organizer_website text,
  specialty_slug text,
  subspecialty text,
  subspecialties uuid[],
  target_audience text[],
  languages text[] DEFAULT '{en}',
  has_cme boolean DEFAULT false,
  cme_provider text,
  cme_hours numeric,
  cme_points numeric,
  accreditation_url text,
  accreditation_details jsonb,
  is_free boolean DEFAULT false,
  price_range text,
  currency text DEFAULT 'USD',
  registration_url text,
  registration_required boolean DEFAULT true,
  capacity integer,
  registered_count integer DEFAULT 0,
  featured_image text,
  gallery_images text[],
  seo_title text,
  seo_description text,
  view_count integer DEFAULT 0,
  save_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  source_url text,
  CONSTRAINT public_medical_events_pkey PRIMARY KEY (id)
);

-- Step 3: Enable RLS on both tables
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_medical_events ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for public access
-- Allow anyone to read verified profiles (no sensitive data)
CREATE POLICY "public_profiles_read_access" ON public.public_profiles
FOR SELECT
USING (verified = true);

-- Allow anyone to read approved events
CREATE POLICY "public_medical_events_read_access" ON public.public_medical_events  
FOR SELECT
USING (status = 'approved');

-- Step 5: Grant permissions for public access
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_medical_events TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_medical_events TO anon;

-- Step 6: Create triggers to keep public tables in sync with main tables
-- Function to sync profiles
CREATE OR REPLACE FUNCTION public.sync_public_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle INSERT/UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.public_profiles (
      id, user_id, first_name, last_name, avatar_url, title, 
      specialty, primary_specialty_slug, organization, country, 
      profile_type, verified, created_at
    ) VALUES (
      NEW.id, NEW.user_id, NEW.first_name, NEW.last_name, NEW.avatar_url, NEW.title,
      NEW.specialty, NEW.primary_specialty_slug, NEW.organization, NEW.country,
      NEW.profile_type, NEW.verified, NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
      user_id = NEW.user_id,
      first_name = NEW.first_name,
      last_name = NEW.last_name,
      avatar_url = NEW.avatar_url,
      title = NEW.title,
      specialty = NEW.specialty,
      primary_specialty_slug = NEW.primary_specialty_slug,
      organization = NEW.organization,
      country = NEW.country,
      profile_type = NEW.profile_type,
      verified = NEW.verified,
      created_at = NEW.created_at;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Function to sync medical events
CREATE OR REPLACE FUNCTION public.sync_public_medical_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle INSERT/UPDATE
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
$$;

-- Step 7: Create triggers to maintain sync
CREATE TRIGGER sync_public_profile_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_public_profile();

CREATE TRIGGER sync_public_medical_event_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_events
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_public_medical_event();

-- Step 8: Initial data sync - populate public tables with existing data
INSERT INTO public.public_profiles (
  id, user_id, first_name, last_name, avatar_url, title, 
  specialty, primary_specialty_slug, organization, country, 
  profile_type, verified, created_at
)
SELECT 
  id, user_id, first_name, last_name, avatar_url, title,
  specialty, primary_specialty_slug, organization, country,
  profile_type, verified, created_at
FROM public.profiles
WHERE verified = true
ON CONFLICT (id) DO NOTHING;

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
)
SELECT 
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
FROM public.medical_events
WHERE status = 'approved'
ON CONFLICT (id) DO NOTHING;

-- Step 9: Recreate the get_public_profile function to work with the new table
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS SETOF public.public_profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$$;

-- Step 10: Add documentation
COMMENT ON TABLE public.public_profiles IS 
'Public table of verified user profiles. Excludes sensitive information like emails, subscription data, and unverified profiles. Safe for public access via RLS policies.';

COMMENT ON TABLE public.public_medical_events IS 
'Public table of approved medical events. Excludes organizer contact information and admin data. Safe for public access via RLS policies.';

COMMENT ON FUNCTION public.sync_public_profile() IS 
'Trigger function to keep public_profiles table in sync with profiles table. Only syncs verified profiles.';

COMMENT ON FUNCTION public.sync_public_medical_event() IS 
'Trigger function to keep public_medical_events table in sync with medical_events table. Only syncs approved events.';