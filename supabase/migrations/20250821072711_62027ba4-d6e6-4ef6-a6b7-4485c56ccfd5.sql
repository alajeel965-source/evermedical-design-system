-- REMOVE FINAL SECURITY DEFINER FUNCTIONS
-- Drop and recreate all remaining SECURITY DEFINER functions

-- 1. Fix update_updated_at_column (recreate without SECURITY DEFINER)
-- First drop all dependent triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_rfqs_updated_at ON rfqs;
DROP TRIGGER IF EXISTS update_event_sources_updated_at ON event_sources;
DROP TRIGGER IF EXISTS update_medical_events_updated_at ON medical_events;
DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON saved_searches;

-- Drop the function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate without SECURITY DEFINER
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

-- Recreate all the triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON rfqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_sources_updated_at
  BEFORE UPDATE ON event_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_events_updated_at
  BEFORE UPDATE ON medical_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Fix handle_subscription_signup (drop and recreate without SECURITY DEFINER)
DROP FUNCTION IF EXISTS public.handle_subscription_signup(text, text, text, subscription_plan, integer);

CREATE OR REPLACE FUNCTION public.handle_subscription_signup(user_email text, user_password text, user_name text, plan_type subscription_plan, plan_price integer DEFAULT 0)
RETURNS json
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  result json;
BEGIN
  -- This function is for additional subscription logic
  -- Actual user creation happens in frontend using Supabase Auth
  
  result := json_build_object(
    'success', true,
    'message', 'Subscription signup initialized'
  );
  
  RETURN result;
END;
$function$;