-- FINAL SECURITY FIXES
-- Fix remaining Security Definer functions and protect organizer data

-- 1. Check and fix any remaining SECURITY DEFINER functions
-- Drop and recreate validate_specialty_slug without SECURITY DEFINER if it exists
DROP FUNCTION IF EXISTS public.validate_specialty_slug(text);
CREATE OR REPLACE FUNCTION public.validate_specialty_slug(slug text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  -- This function should validate against config/specialties.json
  -- For now, we'll allow any non-empty slug and validate in application
  RETURN slug IS NOT NULL AND slug != '';
END;
$function$;

-- Drop and recreate update_updated_at_column without SECURITY DEFINER if needed
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Drop and recreate handle_subscription_signup without SECURITY DEFINER
DROP FUNCTION IF EXISTS public.handle_subscription_signup(text, text, text, subscription_plan, integer);
CREATE OR REPLACE FUNCTION public.handle_subscription_signup(user_email text, user_password text, user_name text, plan_type subscription_plan, plan_price integer DEFAULT 0)
RETURNS json
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- This function will be called from the frontend to handle subscription signups
  -- The actual user creation will happen in the frontend using Supabase Auth
  -- This function is for any additional subscription logic needed
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', 'Subscription signup initialized'
  );
  
  RETURN result;
END;
$function$;

-- 2. Create safe function for medical events without exposing organizer contact info
CREATE OR REPLACE FUNCTION public.get_safe_medical_event(event_id uuid)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    start_date timestamptz,
    end_date timestamptz,
    venue_name text,
    venue_address text,
    city text,
    country text,
    format text,
    is_free boolean,
    registration_url text,
    featured_image text,
    specialty_slug text,
    status text,
    organizer text
    -- EXCLUDED: organizer_email, organizer_phone for privacy
)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e.venue_name,
    e.venue_address,
    e.city,
    e.country,
    e.format,
    e.is_free,
    e.registration_url,
    e.featured_image,
    e.specialty_slug,
    e.status,
    e.organizer
    -- Contact info excluded for privacy
  FROM medical_events e
  WHERE e.id = event_id AND e.status = 'approved';
$function$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_specialty_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_medical_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_medical_event(uuid) TO anon;