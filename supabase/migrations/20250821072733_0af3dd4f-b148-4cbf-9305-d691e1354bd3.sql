-- FIX VALIDATE_SPECIALTY_SLUG SECURITY DEFINER
-- Remove SECURITY DEFINER from the last remaining function

DROP FUNCTION IF EXISTS public.validate_specialty_slug(text);

CREATE OR REPLACE FUNCTION public.validate_specialty_slug(slug text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  -- This function validates specialty slugs against config/specialties.json
  -- For now, we'll allow any non-empty slug and validate in application
  RETURN slug IS NOT NULL AND slug != '';
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_specialty_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_specialty_slug(text) TO anon;