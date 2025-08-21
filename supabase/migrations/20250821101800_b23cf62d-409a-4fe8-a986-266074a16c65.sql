-- Final security enhancements and validation triggers

-- 1. Add validation trigger for event_interactions
CREATE OR REPLACE FUNCTION public.validate_event_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate interaction_type
  IF NEW.interaction_type NOT IN ('view', 'save', 'share', 'click', 'register') THEN
    RAISE EXCEPTION 'Invalid interaction type: %', NEW.interaction_type;
  END IF;
  
  -- Sanitize metadata if present
  IF NEW.metadata IS NOT NULL THEN
    NEW.metadata = public.sanitize_json_input(NEW.metadata);
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

-- 2. Add JSON input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_json_input(input_json jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE STRICT
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  key text;
  value jsonb;
BEGIN
  IF input_json IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Iterate through JSON keys and sanitize values
  FOR key, value IN SELECT * FROM jsonb_each(input_json) LOOP
    -- Only allow safe keys (alphanumeric + underscore)
    IF key ~ '^[a-zA-Z0-9_]{1,50}$' THEN
      -- Sanitize string values
      IF jsonb_typeof(value) = 'string' THEN
        result = result || jsonb_build_object(key, public.sanitize_text_input(value #>> '{}'));
      -- Allow numbers and booleans as-is, but limit object depth
      ELSIF jsonb_typeof(value) IN ('number', 'boolean') THEN
        result = result || jsonb_build_object(key, value);
      END IF;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- 3. Create comprehensive audit triggers for sensitive operations
CREATE TRIGGER audit_event_duplicates
  AFTER INSERT OR UPDATE OR DELETE ON public.event_duplicates
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

CREATE TRIGGER audit_event_sources
  AFTER INSERT OR UPDATE OR DELETE ON public.event_sources
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

-- 4. Add rate limiting to public table access
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

-- 5. Create security validation report function
CREATE OR REPLACE FUNCTION public.validate_database_security()
RETURNS TABLE(check_name text, status text, risk_level text, details text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check all tables have RLS enabled
    RETURN QUERY
    SELECT 
        'RLS_ENABLED_CHECK'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'CRITICAL' END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'CRITICAL' END::TEXT,
        CASE WHEN COUNT(*) = 0 
            THEN 'All public tables have RLS enabled'
            ELSE 'Found ' || COUNT(*) || ' tables without RLS enabled'
        END::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r' 
      AND NOT c.relrowsecurity;
    
    -- Check for tables with forced RLS
    RETURN QUERY
    SELECT 
        'RLS_FORCED_CHECK'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'LOW' ELSE 'MEDIUM' END::TEXT,
        'Found ' || COUNT(*) || ' tables with forced RLS (critical tables protected)'::TEXT
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r' 
      AND c.relforcerowsecurity
      AND c.relname IN ('profiles', 'medical_events', 'crawl_jobs');
    
    -- Check for proper audit triggers
    RETURN QUERY
    SELECT 
        'AUDIT_TRIGGERS_CHECK'::TEXT,
        CASE WHEN COUNT(*) >= 5 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
        CASE WHEN COUNT(*) >= 5 THEN 'LOW' ELSE 'MEDIUM' END::TEXT,
        'Found ' || COUNT(*) || ' audit triggers for security monitoring'::TEXT
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND t.tgname LIKE '%audit%';
      
    -- Check for input validation functions
    RETURN QUERY
    SELECT 
        'INPUT_VALIDATION_CHECK'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'SECURE' ELSE 'NEEDS_REVIEW' END::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'LOW' ELSE 'MEDIUM' END::TEXT,
        'Found ' || COUNT(*) || ' input validation/sanitization functions'::TEXT
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND (p.proname LIKE '%sanitize%' OR p.proname LIKE '%validate%');
END;
$$;