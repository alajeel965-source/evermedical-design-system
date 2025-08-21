-- Fix the remaining security issue by removing direct public access to medical_events table
-- Keep only authorized access and force public users to use the secure view

-- Remove the policy that allows direct access to approved events
DROP POLICY IF EXISTS "Events viewable through public view only" ON public.medical_events;

-- The remaining policies ensure only authorized users (admins, organizers, creators) can see full event data
-- Public users should only access data through the public_medical_events view

-- Add a comment to clarify the security model
COMMENT ON TABLE public.medical_events IS 'Contains sensitive organizer contact data. Direct access restricted to authorized users only. Public access via public_medical_events view.';

-- Ensure the public view has proper permissions but the underlying table is restricted
REVOKE SELECT ON public.medical_events FROM anon;
REVOKE SELECT ON public.medical_events FROM authenticated;

-- Grant access to the secure public view instead
GRANT SELECT ON public.public_medical_events TO anon;
GRANT SELECT ON public.public_medical_events TO authenticated;

-- Verify that admins/organizers/creators can still access the full table when needed
-- (They should use the admin interface or authenticated API calls that go through proper authorization)