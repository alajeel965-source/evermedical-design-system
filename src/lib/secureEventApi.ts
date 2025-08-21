import { supabase } from "@/integrations/supabase/client";

export interface OrganizerContactInfo {
  organizer_email: string;
  organizer_phone: string;
  organizer_website: string;
  review_notes: string;
  moderation_flags: string[];
}

export interface SafeEventData {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  summary?: string;
  summary_ar?: string;
  slug: string;
  start_date: string;
  end_date: string;
  timezone: string;
  registration_deadline?: string;
  format: string;
  venue_name?: string;
  venue_address?: string;
  venue_lat?: number;
  venue_lng?: number;
  country?: string;
  city?: string;
  online_url?: string;
  organizer?: string;
  organizer_website?: string;
  specialty_slug?: string;
  subspecialty?: string;
  subspecialties?: string[];
  target_audience?: string[];
  languages?: string[];
  has_cme?: boolean;
  cme_provider?: string;
  cme_hours?: number;
  cme_points?: number;
  accreditation_url?: string;
  accreditation_details?: any;
  is_free?: boolean;
  price_range?: string;
  currency?: string;
  registration_url?: string;
  registration_required?: boolean;
  capacity?: number;
  registered_count?: number;
  featured_image?: string;
  gallery_images?: string[];
  seo_title?: string;
  seo_description?: string;
  view_count?: number;
  save_count?: number;
  share_count?: number;
  click_count?: number;
  status: string;
  created_at: string;
  updated_at: string;
  source_url?: string;
}

/**
 * Fetches public medical events data without sensitive organizer contact information
 * This uses the public_medical_events table which excludes email and phone numbers
 */
export async function getPublicEvents(): Promise<{ data: SafeEventData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('public_medical_events')
      .select('*')
      .eq('status', 'approved')
      .order('start_date', { ascending: true });

    return { data, error };
  } catch (error) {
    console.error('Error fetching public events:', error);
    return { data: null, error };
  }
}

/**
 * Fetches a single public event by ID without sensitive organizer contact information
 */
export async function getPublicEventById(eventId: string): Promise<{ data: SafeEventData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('public_medical_events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'approved')
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching public event:', error);
    return { data: null, error };
  }
}

/**
 * Securely fetches organizer contact information
 * Only accessible to event creators and verified admins
 */
export async function getOrganizerContactInfo(eventId: string): Promise<{ data: OrganizerContactInfo[] | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_organizer_contact_info', {
      event_id: eventId
    });

    if (error) {
      console.error('Error fetching organizer contact info:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in organizer contact info request:', error);
    return { data: null, error };
  }
}

/**
 * Checks if current user can access organizer contact data for an event
 */
export async function canAccessOrganizerData(eventId: string): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('can_access_organizer_data', {
      event_id: eventId
    });

    return data === true;
  } catch (error) {
    console.error('Error checking organizer data access:', error);
    return false;
  }
}

/**
 * Fetches events created by the current user (includes all data)
 */
export async function getUserCreatedEvents(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('medical_events')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching user created events:', error);
    return { data: null, error };
  }
}

/**
 * Search events with AI enhancement using the secure event-search edge function
 */
export async function searchEvents(params: {
  query?: string;
  specialty?: string;
  country?: string;
  city?: string;
  format?: string;
  has_cme?: boolean;
  is_free?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: any | null; error: any }> {
  try {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const { data, error } = await supabase.functions.invoke('event-search', {
      body: { searchParams: searchParams.toString() }
    });

    return { data, error };
  } catch (error) {
    console.error('Error searching events:', error);
    return { data: null, error };
  }
}