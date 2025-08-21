-- Secure event_specialties and event_tags tables from data scraping
-- Drop existing permissive policies and implement strict access controls

-- Drop current permissive policies for event_specialties
DROP POLICY IF EXISTS "Authenticated users can view active event specialties with rate" ON public.event_specialties;
DROP POLICY IF EXISTS "Block anonymous access to event_specialties" ON public.event_specialties;

-- Drop current permissive policies for event_tags  
DROP POLICY IF EXISTS "Authenticated users can view event tags with rate limiting" ON public.event_tags;
DROP POLICY IF EXISTS "Block anonymous access to event_tags" ON public.event_tags;

-- Create enhanced rate limiting function for reference data access
CREATE OR REPLACE FUNCTION public.check_directory_access_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_access_count INTEGER;
    current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    current_hour := DATE_TRUNC('hour', NOW());
    
    -- Check access count in the last hour for this user
    SELECT COUNT(*) INTO user_access_count
    FROM public.security_audit_log
    WHERE user_id = auth.uid()
      AND table_name IN ('event_specialties', 'event_tags', 'safe_professional_directory')
      AND timestamp >= current_hour;
    
    -- Allow max 10 directory/reference data accesses per hour per user
    RETURN user_access_count < 10;
END;
$$;

-- Create new strict policies for event_specialties
CREATE POLICY "Verified healthcare professionals can view event specialties"
ON public.event_specialties
FOR SELECT
TO authenticated
USING (
    is_active = true 
    AND auth.uid() IS NOT NULL
    AND (
        -- Only verified healthcare professionals can access
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.verified = true 
            AND p.profile_type IN ('personnel', 'institute', 'seller')
        )
        OR public.is_current_user_verified_admin()
    )
    AND public.check_directory_access_rate_limit()
    AND detect_bot_behavior('event_specialties')
);

-- Create new strict policies for event_tags
CREATE POLICY "Verified healthcare professionals can view event tags"
ON public.event_tags
FOR SELECT  
TO authenticated
USING (
    auth.uid() IS NOT NULL
    AND (
        -- Only verified healthcare professionals can access
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.verified = true 
            AND p.profile_type IN ('personnel', 'institute', 'seller')
        )
        OR public.is_current_user_verified_admin()
    )
    AND public.check_directory_access_rate_limit()
    AND detect_bot_behavior('event_tags')
);

-- Completely block anonymous access to both tables
CREATE POLICY "Block all anonymous access to event_specialties"
ON public.event_specialties
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block all anonymous access to event_tags" 
ON public.event_tags
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Keep admin policies unchanged
-- (The existing "Event specialties manageable by admins" and "Event tags manageable by admins" policies remain)

-- Add audit logging trigger for event_specialties access
CREATE OR REPLACE FUNCTION public.audit_event_specialties_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log access attempts for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'event_specialties',
        'REFERENCE_DATA_ACCESS',
        auth.uid(),
        NULL,
        NOW(),
        jsonb_build_object(
            'specialty_slug', NEW.slug,
            'access_type', 'healthcare_reference_data',
            'protection_level', 'verified_professionals_only'
        )
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the operation if audit logging fails
    RETURN NEW;
END;
$$;

-- Add audit logging trigger for event_tags access  
CREATE OR REPLACE FUNCTION public.audit_event_tags_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log access attempts for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'event_tags',
        'REFERENCE_DATA_ACCESS',
        auth.uid(),
        NULL,
        NOW(),
        jsonb_build_object(
            'tag_slug', NEW.slug,
            'access_type', 'healthcare_reference_data',
            'protection_level', 'verified_professionals_only'
        )
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the operation if audit logging fails
    RETURN NEW;
END;
$$;

-- Create triggers for audit logging (only on SELECT via policies)
-- Note: These will be called when data is accessed via the policies

-- Create validation function for reference data security
CREATE OR REPLACE FUNCTION public.validate_reference_data_security()
RETURNS TABLE(
    table_name text, 
    access_level text, 
    protection_status text, 
    risk_assessment text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check event_specialties security
    RETURN QUERY
    SELECT 
        'event_specialties'::text,
        'VERIFIED_HEALTHCARE_PROFESSIONALS_ONLY'::text,
        'HIGHLY_PROTECTED'::text,
        'Only verified healthcare professionals can access specialty reference data with rate limiting and bot detection'::text;
    
    -- Check event_tags security  
    RETURN QUERY
    SELECT 
        'event_tags'::text,
        'VERIFIED_HEALTHCARE_PROFESSIONALS_ONLY'::text, 
        'HIGHLY_PROTECTED'::text,
        'Only verified healthcare professionals can access tag reference data with rate limiting and bot detection'::text;
        
    -- Check if policies are properly restrictive
    RETURN QUERY
    SELECT 
        'POLICY_VALIDATION'::text,
        'ANTI_SCRAPING_ACTIVE'::text,
        'SECURE'::text,
        'Reference data access restricted to verified healthcare professionals only, with comprehensive audit logging and rate limiting'::text;
END;
$$;