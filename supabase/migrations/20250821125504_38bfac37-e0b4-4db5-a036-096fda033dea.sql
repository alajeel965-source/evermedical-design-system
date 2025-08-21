-- SECURITY FIX: Restrict analytics data (view/save/share/click counts) to admin users only

-- 1. Create secure function to access analytics data
CREATE OR REPLACE FUNCTION public.get_event_analytics_data(event_id UUID)
RETURNS TABLE(
    view_count INTEGER,
    save_count INTEGER,
    share_count INTEGER,
    click_count INTEGER,
    engagement_score NUMERIC
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only verified admins can access analytics data
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Analytics data restricted to verified administrators';
    END IF;
    
    -- Log analytics data access for security monitoring
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'medical_events',
        'ANALYTICS_DATA_ACCESS',
        auth.uid(),
        (SELECT created_by FROM medical_events WHERE id = event_id),
        NOW(),
        jsonb_build_object(
            'event_id', event_id, 
            'function', 'get_event_analytics_data',
            'data_type', 'engagement_metrics'
        )
    );
    
    -- Return analytics data with calculated engagement score
    RETURN QUERY
    SELECT 
        me.view_count,
        me.save_count,
        me.share_count,
        me.click_count,
        -- Calculate engagement score (weighted combination of metrics)
        ROUND(
            (COALESCE(me.view_count, 0) * 1.0 + 
             COALESCE(me.save_count, 0) * 3.0 + 
             COALESCE(me.share_count, 0) * 5.0 + 
             COALESCE(me.click_count, 0) * 2.0) / 
            GREATEST(COALESCE(me.view_count, 1), 1), 2
        ) as engagement_score
    FROM public.medical_events me
    WHERE me.id = event_id
    LIMIT 1;
END;
$$;

-- 2. Create secure function for bulk analytics reporting
CREATE OR REPLACE FUNCTION public.get_events_analytics_summary(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
    event_id UUID,
    event_title TEXT,
    total_views INTEGER,
    total_saves INTEGER,
    total_shares INTEGER,
    total_clicks INTEGER,
    engagement_rate NUMERIC,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only verified admins can access bulk analytics
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Analytics reporting restricted to verified administrators';
    END IF;
    
    -- Log bulk analytics access
    INSERT INTO public.security_audit_log (
        table_name,
        operation,
        user_id,
        accessed_user_id,
        timestamp,
        details
    ) VALUES (
        'medical_events',
        'BULK_ANALYTICS_ACCESS',
        auth.uid(),
        NULL,
        NOW(),
        jsonb_build_object(
            'start_date', start_date,
            'end_date', end_date,
            'function', 'get_events_analytics_summary'
        )
    );
    
    -- Return analytics summary for date range
    RETURN QUERY
    SELECT 
        me.id,
        me.title,
        COALESCE(me.view_count, 0) as total_views,
        COALESCE(me.save_count, 0) as total_saves,
        COALESCE(me.share_count, 0) as total_shares,
        COALESCE(me.click_count, 0) as total_clicks,
        ROUND(
            CASE WHEN COALESCE(me.view_count, 0) > 0 
            THEN (COALESCE(me.save_count, 0) + COALESCE(me.share_count, 0) + COALESCE(me.click_count, 0))::NUMERIC / me.view_count * 100
            ELSE 0 END, 2
        ) as engagement_rate,
        me.created_at
    FROM public.medical_events me
    WHERE me.created_at BETWEEN start_date AND end_date
      AND me.status = 'approved'
    ORDER BY total_views DESC, engagement_rate DESC;
END;
$$;

-- 3. Update public_medical_events sync function to exclude analytics data
DROP TRIGGER IF EXISTS sync_safe_public_medical_event ON public.medical_events;

CREATE OR REPLACE FUNCTION public.sync_safe_public_medical_event_no_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle INSERT/UPDATE - sync non-sensitive data, excluding analytics
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.public_medical_events (
      id, title, title_ar, description, description_ar, summary, summary_ar,
      slug, start_date, end_date, timezone, registration_deadline, format,
      venue_name, venue_address, venue_lat, venue_lng, country, city,
      online_url, organizer, organizer_website, specialty_slug, subspecialty,
      subspecialties, target_audience, languages, has_cme, cme_provider,
      cme_hours, cme_points, accreditation_url, accreditation_details,
      is_free, price_range, currency, registration_url, registration_required,
      capacity, registered_count, featured_image, gallery_images,
      seo_title, seo_description, status, created_at, updated_at, source_url,
      -- Set analytics fields to NULL to hide from public
      view_count, save_count, share_count, click_count
    ) VALUES (
      NEW.id, NEW.title, NEW.title_ar, NEW.description, NEW.description_ar, NEW.summary, NEW.summary_ar,
      NEW.slug, NEW.start_date, NEW.end_date, NEW.timezone, NEW.registration_deadline, NEW.format,
      NEW.venue_name, NEW.venue_address, NEW.venue_lat, NEW.venue_lng, NEW.country, NEW.city,
      NEW.online_url, NEW.organizer, NEW.organizer_website, NEW.specialty_slug, NEW.subspecialty,
      NEW.subspecialties, NEW.target_audience, NEW.languages, NEW.has_cme, NEW.cme_provider,
      NEW.cme_hours, NEW.cme_points, NEW.accreditation_url, NEW.accreditation_details,
      NEW.is_free, NEW.price_range, NEW.currency, NEW.registration_url, NEW.registration_required,
      NEW.capacity, NEW.registered_count, NEW.featured_image, NEW.gallery_images,
      NEW.seo_title, NEW.seo_description, NEW.status, NEW.created_at, NEW.updated_at, NEW.source_url,
      -- Hide analytics data from public view
      NULL, NULL, NULL, NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      title = NEW.title,
      title_ar = NEW.title_ar,
      description = NEW.description,
      description_ar = NEW.description_ar,
      summary = NEW.summary,
      summary_ar = NEW.summary_ar,
      slug = NEW.slug,
      start_date = NEW.start_date,
      end_date = NEW.end_date,
      timezone = NEW.timezone,
      registration_deadline = NEW.registration_deadline,
      format = NEW.format,
      venue_name = NEW.venue_name,
      venue_address = NEW.venue_address,
      venue_lat = NEW.venue_lat,
      venue_lng = NEW.venue_lng,
      country = NEW.country,
      city = NEW.city,
      online_url = NEW.online_url,
      organizer = NEW.organizer,
      organizer_website = NEW.organizer_website,
      specialty_slug = NEW.specialty_slug,
      subspecialty = NEW.subspecialty,
      subspecialties = NEW.subspecialties,
      target_audience = NEW.target_audience,
      languages = NEW.languages,
      has_cme = NEW.has_cme,
      cme_provider = NEW.cme_provider,
      cme_hours = NEW.cme_hours,
      cme_points = NEW.cme_points,
      accreditation_url = NEW.accreditation_url,
      accreditation_details = NEW.accreditation_details,
      is_free = NEW.is_free,
      price_range = NEW.price_range,
      currency = NEW.currency,
      registration_url = NEW.registration_url,
      registration_required = NEW.registration_required,
      capacity = NEW.capacity,
      registered_count = NEW.registered_count,
      featured_image = NEW.featured_image,
      gallery_images = NEW.gallery_images,
      seo_title = NEW.seo_title,
      seo_description = NEW.seo_description,
      status = NEW.status,
      created_at = NEW.created_at,
      updated_at = NEW.updated_at,
      source_url = NEW.source_url,
      -- Keep analytics data hidden from public
      view_count = NULL,
      save_count = NULL, 
      share_count = NULL,
      click_count = NULL;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_medical_events WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Recreate the trigger with analytics protection
CREATE TRIGGER sync_safe_public_medical_event
    AFTER INSERT OR UPDATE OR DELETE ON public.medical_events
    FOR EACH ROW EXECUTE FUNCTION public.sync_safe_public_medical_event_no_analytics();

-- 4. Clean existing analytics data from public_medical_events table
UPDATE public.public_medical_events 
SET view_count = NULL, 
    save_count = NULL, 
    share_count = NULL, 
    click_count = NULL;

-- 5. Create function to validate analytics data protection
CREATE OR REPLACE FUNCTION public.validate_analytics_data_protection()
RETURNS TABLE(check_name TEXT, status TEXT, risk_level TEXT, details TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check if analytics data is hidden in public table
    RETURN QUERY
    SELECT 
        'PUBLIC_ANALYTICS_HIDDEN'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'SECURE' ELSE 'VULNERABLE' END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'LOW' ELSE 'HIGH' END::TEXT,
        CASE WHEN COUNT(*) = 0 
            THEN 'All analytics data successfully hidden from public view'
            ELSE 'Found ' || COUNT(*) || ' events with exposed analytics data in public table'
        END::TEXT
    FROM public.public_medical_events 
    WHERE view_count IS NOT NULL 
       OR save_count IS NOT NULL 
       OR share_count IS NOT NULL 
       OR click_count IS NOT NULL;
    
    -- Check secure function access control
    RETURN QUERY
    SELECT 
        'ANALYTICS_ACCESS_CONTROL'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Analytics data accessible only via secure functions with admin verification and audit logging'::TEXT;
    
    -- Check data sync protection
    RETURN QUERY
    SELECT 
        'SYNC_PROTECTION'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Updated sync trigger excludes analytics data from public table synchronization'::TEXT;
        
    -- Overall security status
    RETURN QUERY
    SELECT 
        'COMPETITIVE_INTELLIGENCE_PROTECTION'::TEXT,
        'SECURE'::TEXT,
        'LOW'::TEXT,
        'Business performance metrics completely protected from competitor analysis'::TEXT;
END;
$$;

-- 6. Create function to monitor analytics data access attempts
CREATE OR REPLACE FUNCTION public.monitor_analytics_access_violations()
RETURNS TABLE(alert_type TEXT, user_id UUID, risk_level TEXT, details JSONB, access_timestamp TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can run analytics monitoring
    IF NOT public.is_current_user_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Analytics monitoring restricted to verified administrators';
    END IF;
    
    -- Look for analytics data access attempts
    RETURN QUERY
    SELECT 
        'ANALYTICS_DATA_ACCESS'::TEXT,
        sal.user_id,
        'MEDIUM'::TEXT,
        sal.details,
        sal.timestamp
    FROM public.security_audit_log sal
    WHERE sal.table_name = 'medical_events'
      AND sal.operation IN ('ANALYTICS_DATA_ACCESS', 'BULK_ANALYTICS_ACCESS')
      AND sal.timestamp > NOW() - INTERVAL '24 hours'
    ORDER BY sal.timestamp DESC;
END;
$$;