-- Strengthen RLS policies for vulnerable tables

-- 1. Fix event_interactions table - prevent null user_id security gap
ALTER TABLE public.event_interactions ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policy and create stricter ones
DROP POLICY IF EXISTS "Users can manage their own interactions" ON public.event_interactions;

CREATE POLICY "Users can view their own interactions"
ON public.event_interactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
ON public.event_interactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
ON public.event_interactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
ON public.event_interactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Strengthen event_tag_relations policies
DROP POLICY IF EXISTS "Event tag relations follow event permissions" ON public.event_tag_relations;

CREATE POLICY "Public can view approved event tag relations"
ON public.event_tag_relations
FOR SELECT
TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.medical_events 
    WHERE status = 'approved'
  )
);

CREATE POLICY "Event creators can manage their event tag relations"
ON public.event_tag_relations
FOR ALL
TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.medical_events 
    WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  event_id IN (
    SELECT id FROM public.medical_events 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage all event tag relations"
ON public.event_tag_relations
FOR ALL
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 3. Add more restrictive policies for event_duplicates
DROP POLICY IF EXISTS "Event duplicates manageable by admins" ON public.event_duplicates;

CREATE POLICY "Verified admins can view event duplicates"
ON public.event_duplicates
FOR SELECT
TO authenticated
USING (public.is_current_user_verified_admin());

CREATE POLICY "Verified admins can manage event duplicates"
ON public.event_duplicates
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 4. Strengthen event_sources policies
DROP POLICY IF EXISTS "Event sources are viewable by admins" ON public.event_sources;
DROP POLICY IF EXISTS "Event sources manageable by admins" ON public.event_sources;

CREATE POLICY "Verified admins can view event sources"
ON public.event_sources
FOR SELECT
TO authenticated
USING (public.is_current_user_verified_admin());

CREATE POLICY "Verified admins can manage event sources"
ON public.event_sources
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

-- 5. Add rate limiting to public tables
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

-- 6. Add input validation triggers
CREATE OR REPLACE FUNCTION public.validate_event_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate interaction_type
  IF NEW.interaction_type NOT IN ('view', 'save', 'share', 'click', 'register') THEN
    RAISE EXCEPTION 'Invalid interaction type: %', NEW.interaction_type;
  END IF;
  
  -- Sanitize metadata
  IF NEW.metadata IS NOT NULL THEN
    NEW.metadata = public.sanitize_json_input(NEW.metadata);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_event_interaction_trigger
  BEFORE INSERT OR UPDATE ON public.event_interactions
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_interaction();

-- 7. Create comprehensive audit triggers for sensitive operations
CREATE TRIGGER audit_event_duplicates
  AFTER INSERT OR UPDATE OR DELETE ON public.event_duplicates
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

CREATE TRIGGER audit_event_sources
  AFTER INSERT OR UPDATE OR DELETE ON public.event_sources
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

-- 8. Add JSON input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_json_input(input_json jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE STRICT
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