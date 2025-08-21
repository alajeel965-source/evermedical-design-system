-- Create rate limiting function and complete security enhancements

-- 1. Create rate limiting function first
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_name text,
  max_requests integer,
  time_window interval
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start timestamptz;
BEGIN
  window_start := now() - time_window;
  
  -- Count requests in the time window for this operation and user/IP
  SELECT COUNT(*)
  INTO current_count
  FROM public.security_audit_log
  WHERE operation = operation_name
    AND timestamp >= window_start
    AND (
      user_id = auth.uid() 
      OR details->>'ip' = current_setting('request.headers', true)::jsonb->>'cf-connecting-ip'
    );
  
  -- Return true if under limit, false if over
  RETURN current_count < max_requests;
EXCEPTION WHEN OTHERS THEN
  -- Return true on error to avoid blocking legitimate requests
  RETURN true;
END;
$$;

-- 2. Add validation trigger for event_interactions
CREATE OR REPLACE FUNCTION public.validate_event_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate interaction_type
  IF NEW.interaction_type NOT IN ('view', 'save', 'share', 'click', 'register') THEN
    RAISE EXCEPTION 'Invalid interaction type: %', NEW.interaction_type;
  END IF;
  
  -- Ensure user_id matches authenticated user
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_event_interaction_trigger
  BEFORE INSERT OR UPDATE ON public.event_interactions
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_interaction();

-- 3. Create comprehensive audit triggers for sensitive operations
CREATE TRIGGER audit_event_duplicates
  AFTER INSERT OR UPDATE OR DELETE ON public.event_duplicates
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

CREATE TRIGGER audit_event_sources
  AFTER INSERT OR UPDATE OR DELETE ON public.event_sources
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

-- 4. Update public table access policies with rate limiting
DROP POLICY IF EXISTS "Event specialties are publicly viewable" ON public.event_specialties;
DROP POLICY IF EXISTS "Event tags are publicly viewable" ON public.event_tags;

CREATE POLICY "Rate limited public access to event_specialties"
ON public.event_specialties
FOR SELECT
TO anon, authenticated
USING (
  is_active = true 
  AND public.check_rate_limit('event_specialties_view', 100, '1 hour'::interval)
);

CREATE POLICY "Rate limited public access to event_tags"
ON public.event_tags
FOR SELECT
TO anon, authenticated
USING (public.check_rate_limit('event_tags_view', 100, '1 hour'::interval));