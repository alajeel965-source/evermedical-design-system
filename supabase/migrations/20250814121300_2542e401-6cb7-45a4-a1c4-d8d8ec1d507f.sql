-- Enhanced Medical Events Schema for AI Event Agent

-- Event sources tracking
CREATE TABLE public.event_sources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL DEFAULT 'website', -- website, rss, api, manual
    crawl_enabled BOOLEAN DEFAULT true,
    crawl_frequency TEXT DEFAULT 'daily', -- hourly, daily, weekly
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    next_crawl_at TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    respect_robots_txt BOOLEAN DEFAULT true,
    crawl_delay_seconds INTEGER DEFAULT 2,
    max_pages INTEGER DEFAULT 100,
    selectors JSONB, -- CSS selectors for structured extraction
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Event specialties taxonomy
CREATE TABLE public.event_specialties (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.event_specialties(id),
    level INTEGER NOT NULL DEFAULT 1, -- 1=primary, 2=subspecialty
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced medical events table (replace existing)
DROP TABLE IF EXISTS public.medical_events CASCADE;
CREATE TABLE public.medical_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    
    -- Core Event Information
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    description_ar TEXT,
    summary TEXT, -- AI-generated 100-160 char summary
    summary_ar TEXT,
    
    -- Dates and Timing
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    registration_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Location and Format
    format TEXT NOT NULL DEFAULT 'in-person', -- in-person, virtual, hybrid
    venue_name TEXT,
    venue_address TEXT,
    venue_lat DECIMAL(10, 8),
    venue_lng DECIMAL(11, 8),
    country TEXT, -- ISO 3166-1 alpha-2
    city TEXT,
    online_url TEXT,
    
    -- Organizer Information
    organizer TEXT,
    organizer_email TEXT,
    organizer_phone TEXT,
    organizer_website TEXT,
    
    -- Medical Classification
    primary_specialty_id UUID REFERENCES public.event_specialties(id),
    subspecialties UUID[] DEFAULT '{}', -- Array of specialty IDs
    target_audience TEXT[], -- ["doctors", "nurses", "students", "researchers"]
    languages TEXT[] DEFAULT '{"en"}', -- ISO 639-1 codes
    
    -- CME and Accreditation
    has_cme BOOLEAN DEFAULT false,
    cme_provider TEXT,
    cme_hours DECIMAL(4,2),
    cme_points DECIMAL(4,2),
    accreditation_url TEXT,
    accreditation_details JSONB,
    
    -- Pricing and Registration
    is_free BOOLEAN DEFAULT false,
    price_range TEXT, -- "Free", "$100-500", "Contact for pricing"
    currency TEXT DEFAULT 'USD', -- ISO 4217
    registration_url TEXT,
    registration_required BOOLEAN DEFAULT true,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    
    -- Media and SEO
    featured_image TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    
    -- AI and Quality
    confidence_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    ai_extracted_fields JSONB, -- Track which fields were AI-extracted
    source_id UUID REFERENCES public.event_sources(id),
    source_url TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and Moderation
    status TEXT NOT NULL DEFAULT 'draft', -- draft, review, approved, rejected, archived
    review_notes TEXT,
    moderation_flags TEXT[] DEFAULT '{}',
    compliance_checked BOOLEAN DEFAULT false,
    
    -- Engagement Metrics
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Event tags for flexible categorization
CREATE TABLE public.event_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT,
    slug TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Many-to-many relationship for event tags
CREATE TABLE public.event_tag_relations (
    event_id UUID NOT NULL REFERENCES public.medical_events(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.event_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

-- Saved searches and alerts
CREATE TABLE public.saved_searches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query JSONB NOT NULL, -- Search parameters
    alert_enabled BOOLEAN DEFAULT false,
    alert_frequency TEXT DEFAULT 'daily', -- instant, daily, weekly
    last_alert_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User event interactions
CREATE TABLE public.event_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.medical_events(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- view, save, share, click, register
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, event_id, interaction_type)
);

-- Crawl jobs tracking
CREATE TABLE public.crawl_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES public.event_sources(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    events_discovered INTEGER DEFAULT 0,
    events_created INTEGER DEFAULT 0,
    events_updated INTEGER DEFAULT 0,
    errors JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Duplicate event detection
CREATE TABLE public.event_duplicates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.medical_events(id) ON DELETE CASCADE,
    duplicate_of UUID NOT NULL REFERENCES public.medical_events(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) NOT NULL,
    match_criteria TEXT[] NOT NULL, -- ["title", "date", "organizer", "venue"]
    reviewed BOOLEAN DEFAULT false,
    action_taken TEXT, -- merged, kept_separate, marked_different
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, duplicate_of)
);

-- Enable Row Level Security
ALTER TABLE public.event_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_duplicates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Event sources (admin only for management)
CREATE POLICY "Event sources are viewable by admins" 
ON public.event_sources FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Event sources manageable by admins" 
ON public.event_sources FOR ALL 
USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE profile_type = 'admin'
));

-- Event specialties (public read, admin write)
CREATE POLICY "Event specialties are publicly viewable" 
ON public.event_specialties FOR SELECT 
USING (is_active = true);

CREATE POLICY "Event specialties manageable by admins" 
ON public.event_specialties FOR ALL 
USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE profile_type = 'admin'
));

-- Medical events (public read for approved, admin for all)
CREATE POLICY "Approved events are publicly viewable" 
ON public.medical_events FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Events manageable by admins and creators" 
ON public.medical_events FOR ALL 
USING (
    auth.uid() IN (
        SELECT user_id FROM profiles 
        WHERE profile_type IN ('admin', 'organizer')
    ) OR 
    auth.uid() = created_by
);

-- Event tags (public read, admin write)
CREATE POLICY "Event tags are publicly viewable" 
ON public.event_tags FOR SELECT 
USING (true);

CREATE POLICY "Event tags manageable by admins" 
ON public.event_tags FOR ALL 
USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE profile_type = 'admin'
));

-- Event tag relations (follow event permissions)
CREATE POLICY "Event tag relations follow event permissions" 
ON public.event_tag_relations FOR ALL 
USING (
    event_id IN (
        SELECT id FROM public.medical_events 
        WHERE status = 'approved' OR auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE profile_type IN ('admin', 'organizer')
        )
    )
);

-- Saved searches (user-specific)
CREATE POLICY "Users can manage their own saved searches" 
ON public.saved_searches FOR ALL 
USING (auth.uid() = user_id);

-- Event interactions (user-specific, anonymous for views)
CREATE POLICY "Users can manage their own interactions" 
ON public.event_interactions FOR ALL 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Crawl jobs (admin only)
CREATE POLICY "Crawl jobs viewable by admins" 
ON public.crawl_jobs FOR SELECT 
USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE profile_type = 'admin'
));

CREATE POLICY "Crawl jobs manageable by system" 
ON public.crawl_jobs FOR ALL 
USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE profile_type = 'admin'
));

-- Event duplicates (admin only)
CREATE POLICY "Event duplicates manageable by admins" 
ON public.event_duplicates FOR ALL 
USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE profile_type = 'admin'
));

-- Indexes for performance
CREATE INDEX idx_medical_events_status ON public.medical_events(status);
CREATE INDEX idx_medical_events_start_date ON public.medical_events(start_date);
CREATE INDEX idx_medical_events_specialty ON public.medical_events(primary_specialty_id);
CREATE INDEX idx_medical_events_country ON public.medical_events(country);
CREATE INDEX idx_medical_events_format ON public.medical_events(format);
CREATE INDEX idx_medical_events_has_cme ON public.medical_events(has_cme);
CREATE INDEX idx_medical_events_is_free ON public.medical_events(is_free);
CREATE INDEX idx_medical_events_confidence ON public.medical_events(confidence_score);
CREATE INDEX idx_medical_events_source ON public.medical_events(source_id);
CREATE INDEX idx_medical_events_created_at ON public.medical_events(created_at);
CREATE INDEX idx_medical_events_view_count ON public.medical_events(view_count);

-- Full-text search indexes
CREATE INDEX idx_medical_events_search_en ON public.medical_events 
USING gin((
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(organizer, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
));

-- GIN indexes for array columns
CREATE INDEX idx_medical_events_subspecialties ON public.medical_events USING gin(subspecialties);
CREATE INDEX idx_medical_events_languages ON public.medical_events USING gin(languages);
CREATE INDEX idx_medical_events_target_audience ON public.medical_events USING gin(target_audience);

-- Triggers for updated_at
CREATE TRIGGER update_event_sources_updated_at
    BEFORE UPDATE ON public.event_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_events_updated_at
    BEFORE UPDATE ON public.medical_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON public.saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample specialties
INSERT INTO public.event_specialties (name_en, name_ar, slug, level) VALUES
('Cardiology', 'أمراض القلب', 'cardiology', 1),
('Dermatology', 'الأمراض الجلدية', 'dermatology', 1),
('Emergency Medicine', 'طب الطوارئ', 'emergency-medicine', 1),
('Endocrinology', 'الغدد الصماء', 'endocrinology', 1),
('Gastroenterology', 'أمراض الجهاز الهضمي', 'gastroenterology', 1),
('Neurology', 'الأمراض العصبية', 'neurology', 1),
('Oncology', 'الأورام', 'oncology', 1),
('Orthopedics', 'العظام', 'orthopedics', 1),
('Pediatrics', 'طب الأطفال', 'pediatrics', 1),
('Psychiatry', 'الطب النفسي', 'psychiatry', 1),
('Radiology', 'الأشعة', 'radiology', 1),
('Surgery', 'الجراحة', 'surgery', 1);

-- Insert sample tags
INSERT INTO public.event_tags (name_en, name_ar, slug, color, is_featured) VALUES
('Conference', 'مؤتمر', 'conference', '#3B82F6', true),
('Workshop', 'ورشة عمل', 'workshop', '#10B981', true),
('Webinar', 'ندوة عبر الإنترنت', 'webinar', '#F59E0B', true),
('CME Accredited', 'معتمد للتعليم الطبي المستمر', 'cme-accredited', '#8B5CF6', true),
('Free Event', 'فعالية مجانية', 'free-event', '#06B6D4', true),
('International', 'دولي', 'international', '#EF4444', true),
('Virtual', 'افتراضي', 'virtual', '#6366F1', false),
('Hybrid', 'مختلط', 'hybrid', '#84CC16', false);

-- Insert sample event sources
INSERT INTO public.event_sources (name, url, source_type, crawl_enabled) VALUES
('American Medical Association', 'https://www.ama-assn.org/education/events', 'website', true),
('European Society of Cardiology', 'https://www.escardio.org/Congresses-Events', 'website', true),
('PubMed Events', 'https://www.ncbi.nlm.nih.gov/pmc/events/', 'website', true),
('Medical Events RSS', 'https://example.com/medical-events.rss', 'rss', false);