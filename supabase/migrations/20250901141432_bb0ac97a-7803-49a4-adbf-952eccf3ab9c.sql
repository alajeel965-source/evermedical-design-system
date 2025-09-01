-- Add MFA support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN mfa_enabled boolean DEFAULT false NOT NULL;

-- Add failed login attempt tracking
ALTER TABLE public.profiles 
ADD COLUMN failed_login_attempts integer DEFAULT 0 NOT NULL,
ADD COLUMN locked_until timestamp with time zone DEFAULT NULL;

-- Create admin_sessions table for tracking admin session timeouts
CREATE TABLE public.admin_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admin sessions can only be accessed by the session owner or verified admins
CREATE POLICY "Users can manage their own admin sessions" ON public.admin_sessions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Verified admins can view all admin sessions" ON public.admin_sessions
FOR SELECT USING (is_current_user_verified_admin());

-- Create OTP codes table for MFA
CREATE TABLE public.admin_otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on OTP codes
ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- Only system can manage OTP codes (accessed via edge functions)
CREATE POLICY "System only access to OTP codes" ON public.admin_otp_codes
FOR ALL USING (false);

-- Add trigger to update last_activity on admin_sessions
CREATE OR REPLACE FUNCTION public.update_admin_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_session_activity_trigger
  BEFORE UPDATE ON public.admin_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_session_activity();

-- Function to clean up expired admin sessions and OTP codes
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