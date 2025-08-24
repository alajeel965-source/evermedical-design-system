-- Fix search_path security warning for all functions
-- Set search_path to public for all security definer functions

ALTER FUNCTION public.is_super_admin() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.can_manage_users() SET search_path = public;