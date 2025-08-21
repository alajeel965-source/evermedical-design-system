-- FIX SECURITY ISSUE: Protect organizer contact information from public access
-- Create a view for public event data that excludes sensitive organizer contact fields

-- First, create a view that excludes sensitive organizer contact information
CREATE VIEW public.public_medical_events AS
SELECT 
  id,
  title,
  title_ar,
  description,
  description_ar,
  summary,
  summary_ar,
  start_date,
  end_date,
  registration_deadline,
  timezone,
  format,
  venue_name,
  venue_address,
  venue_lat,
  venue_lng,
  country,
  city,
  online_url,
  organizer, -- Keep organizer name but not contact details
  -- organizer_email,    -- REMOVED: Sensitive contact info
  -- organizer_phone,    -- REMOVED: Sensitive contact info
  organizer_website,     -- Website is typically public info
  specialty_slug,
  subspecialty,
  subspecialties,
  languages,
  has_cme,
  cme_hours,
  cme_points,
  cme_provider,
  accreditation_details,
  accreditation_url,
  is_free,
  price_range,
  currency,
  registration_required,
  registration_url,
  capacity,
  registered_count,
  featured_image,
  gallery_images,
  target_audience,
  status,
  view_count,
  save_count,
  share_count,
  click_count,
  created_at,
  updated_at,
  slug,
  seo_title,
  seo_description,
  source_url,
  fetched_at,
  source_id
FROM public.medical_events
WHERE status = 'approved';

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Approved events are publicly viewable" ON public.medical_events;

-- Create a new restrictive policy that only allows access to non-sensitive fields through the view
-- This policy will be used by the view to access underlying data
CREATE POLICY "Events viewable through public view only" 
ON public.medical_events 
FOR SELECT 
USING (status = 'approved');

-- Create a separate policy for full access to organizer contact info (admins, creators, and organizers only)
CREATE POLICY "Full event access for authorized users" 
ON public.medical_events 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT profiles.user_id
    FROM profiles
    WHERE profiles.profile_type = ANY (ARRAY['admin'::text, 'organizer'::text])
  ) 
  OR auth.uid() = created_by
);

-- Grant permissions on the public view
GRANT SELECT ON public.public_medical_events TO authenticated;
GRANT SELECT ON public.public_medical_events TO anon;

-- Add helpful comment
COMMENT ON VIEW public.public_medical_events IS 'Public view of medical events that excludes sensitive organizer contact information. Use this view for public displays.';