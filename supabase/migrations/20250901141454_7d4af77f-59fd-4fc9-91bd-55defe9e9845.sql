-- Fix security warnings by adding SET search_path to functions

-- Fix the trigger function
CREATE OR REPLACE FUNCTION public.update_admin_session_activity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$;

-- The cleanup function already has SET search_path, but let's ensure it's correct
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean up expired admin sessions
  DELETE FROM public.admin_sessions 
  WHERE expires_at < now();
  
  -- Clean up expired/used OTP codes older than 1 hour
  DELETE FROM public.admin_otp_codes 
  WHERE expires_at < now() OR (used = true AND created_at < now() - interval '1 hour');
  
  -- Reset failed login attempts after 15 minutes
  UPDATE public.profiles 
  SET failed_login_attempts = 0, locked_until = NULL
  WHERE locked_until IS NOT NULL AND locked_until < now();
END;
$$;