-- FIX FINAL SECURITY DEFINER FUNCTION
-- Remove SECURITY DEFINER from can_see_user_email function

-- Drop and recreate the can_see_user_email function without SECURITY DEFINER
DROP FUNCTION IF EXISTS public.can_see_user_email(uuid);

CREATE OR REPLACE FUNCTION public.can_see_user_email(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  -- Only the user themselves can see their email
  -- Future: Could extend this for admin roles or business connections
  SELECT auth.uid() = target_user_id;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.can_see_user_email(uuid) TO authenticated;