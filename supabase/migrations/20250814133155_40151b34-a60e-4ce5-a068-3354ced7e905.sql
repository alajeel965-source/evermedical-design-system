-- Fix function search path security issue
CREATE OR REPLACE FUNCTION validate_specialty_slug(slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- This function should validate against config/specialties.json
  -- For now, we'll allow any non-empty slug and validate in application
  RETURN slug IS NOT NULL AND slug != '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix existing functions with search path issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS public_profiles
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT * FROM public.public_profiles 
  WHERE user_id = profile_user_id
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.can_see_user_email(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  -- Only the user themselves can see their email
  -- Future: Could extend this for admin roles or business connections
  SELECT auth.uid() = target_user_id;
$function$;