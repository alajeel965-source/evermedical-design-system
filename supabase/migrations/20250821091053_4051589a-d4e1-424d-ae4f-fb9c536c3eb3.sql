-- Fix functions missing search_path parameter

-- Update validate_username function
CREATE OR REPLACE FUNCTION public.validate_username(username_input text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  -- Username must be 3-30 characters, alphanumeric + underscore, no spaces
  RETURN username_input ~ '^[a-zA-Z0-9_]{3,30}$' AND username_input NOT LIKE '%__%';
END;
$function$;

-- Update validate_specialty_slug function
CREATE OR REPLACE FUNCTION public.validate_specialty_slug(slug text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- This function validates specialty slugs against config/specialties.json
  -- For now, we'll allow any non-empty slug and validate in application
  RETURN slug IS NOT NULL AND slug != '';
END;
$function$;

-- Update can_see_user_email function
CREATE OR REPLACE FUNCTION public.can_see_user_email(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  -- Only the user themselves can see their email
  -- Future: Could extend this for admin roles or business connections
  SELECT auth.uid() = target_user_id;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_subscription_signup function
CREATE OR REPLACE FUNCTION public.handle_subscription_signup(user_email text, user_password text, user_name text, plan_type subscription_plan, plan_price integer DEFAULT 0)
RETURNS json
LANGUAGE plpgsql
SET search_path TO 'public'
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