-- Strengthen RLS policies for vulnerable tables (Fixed syntax)

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
FOR INSERT
TO authenticated
WITH CHECK (
  event_id IN (
    SELECT id FROM public.medical_events 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Event creators can update their event tag relations"
ON public.event_tag_relations
FOR UPDATE
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

CREATE POLICY "Event creators can delete their event tag relations"
ON public.event_tag_relations
FOR DELETE
TO authenticated
USING (
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

CREATE POLICY "Verified admins can insert event duplicates"
ON public.event_duplicates
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_verified_admin());

CREATE POLICY "Verified admins can update event duplicates"
ON public.event_duplicates
FOR UPDATE
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

CREATE POLICY "Verified admins can delete event duplicates"
ON public.event_duplicates
FOR DELETE
TO authenticated
USING (public.is_current_user_verified_admin());

-- 4. Strengthen event_sources policies
DROP POLICY IF EXISTS "Event sources are viewable by admins" ON public.event_sources;
DROP POLICY IF EXISTS "Event sources manageable by admins" ON public.event_sources;

CREATE POLICY "Verified admins can view event sources"
ON public.event_sources
FOR SELECT
TO authenticated
USING (public.is_current_user_verified_admin());

CREATE POLICY "Verified admins can insert event sources"
ON public.event_sources
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_verified_admin());

CREATE POLICY "Verified admins can update event sources"
ON public.event_sources
FOR UPDATE
TO authenticated
USING (public.is_current_user_verified_admin())
WITH CHECK (public.is_current_user_verified_admin());

CREATE POLICY "Verified admins can delete event sources"
ON public.event_sources
FOR DELETE
TO authenticated
USING (public.is_current_user_verified_admin());