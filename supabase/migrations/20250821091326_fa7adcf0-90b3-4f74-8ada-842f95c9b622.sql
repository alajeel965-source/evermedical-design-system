-- Fix flawed RLS policies on event_registrations table
-- The existing policies use 'profiles.id = profiles.user_id' which is always true
-- This allows any authenticated user to access any registration data

-- Drop the existing flawed policies
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;

-- Create secure RLS policies that properly check user ownership
CREATE POLICY "Users can view their own registrations"
ON public.event_registrations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations"
ON public.event_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
ON public.event_registrations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
ON public.event_registrations
FOR DELETE
USING (auth.uid() = user_id);

-- Verify the fix with a validation function
CREATE OR REPLACE FUNCTION public.validate_event_registrations_security()
RETURNS TABLE(policy_name text, policy_type text, security_status text, issue_description text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check SELECT policy
    RETURN QUERY
    SELECT 
        'Users can view their own registrations'::TEXT,
        'SELECT'::TEXT,
        CASE WHEN pol.polcmd = 'r' AND pol.polqual::text LIKE '%auth.uid() = user_id%' 
            THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN pol.polcmd = 'r' AND pol.polqual::text LIKE '%auth.uid() = user_id%' 
            THEN 'Policy correctly restricts to user''s own data'
            ELSE 'Policy may allow unauthorized access'
        END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' 
      AND pc.relname = 'event_registrations'
      AND pol.polname = 'Users can view their own registrations';
    
    -- Check INSERT policy
    RETURN QUERY
    SELECT 
        'Users can create their own registrations'::TEXT,
        'INSERT'::TEXT,
        CASE WHEN pol.polcmd = 'a' AND pol.polwithcheck::text LIKE '%auth.uid() = user_id%' 
            THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN pol.polcmd = 'a' AND pol.polwithcheck::text LIKE '%auth.uid() = user_id%' 
            THEN 'Policy correctly validates user ownership on insert'
            ELSE 'Policy may allow inserting data for other users'
        END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' 
      AND pc.relname = 'event_registrations'
      AND pol.polname = 'Users can create their own registrations';
      
    -- Check UPDATE policy
    RETURN QUERY
    SELECT 
        'Users can update their own registrations'::TEXT,
        'UPDATE'::TEXT,
        CASE WHEN pol.polcmd = 'w' AND pol.polqual::text LIKE '%auth.uid() = user_id%' 
            THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN pol.polcmd = 'w' AND pol.polqual::text LIKE '%auth.uid() = user_id%' 
            THEN 'Policy correctly restricts updates to user''s own data'
            ELSE 'Policy may allow updating other users'' data'
        END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' 
      AND pc.relname = 'event_registrations'
      AND pol.polname = 'Users can update their own registrations';
      
    -- Check DELETE policy
    RETURN QUERY
    SELECT 
        'Users can delete their own registrations'::TEXT,
        'DELETE'::TEXT,
        CASE WHEN pol.polcmd = 'd' AND pol.polqual::text LIKE '%auth.uid() = user_id%' 
            THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN pol.polcmd = 'd' AND pol.polqual::text LIKE '%auth.uid() = user_id%' 
            THEN 'Policy correctly restricts deletions to user''s own data'
            ELSE 'Policy may allow deleting other users'' data'
        END::TEXT
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public' 
      AND pc.relname = 'event_registrations'
      AND pol.polname = 'Users can delete their own registrations';
END;
$function$;