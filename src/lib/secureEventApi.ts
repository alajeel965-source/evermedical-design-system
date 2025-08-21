import { supabase } from "@/integrations/supabase/client";
import type { SupabaseResponse, SupabaseError, EventSearchResult } from "@/lib/types/api";
import { logger } from "@/lib/logger";

export interface OrganizerContactInfo {
  organizer_email: string;
  organizer_phone: string;
  organizer_website: string;
  review_notes: string;
  moderation_flags: string[];
}

export interface SafeOrganizerDisplay {
  organizer_name: string;
  organizer_website: string;
  organizer_email_masked: string;
  organizer_phone_masked: string;
  can_access_full_contact: boolean;
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
  accreditation_details?: unknown;
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
export async function getPublicEvents(): Promise<SupabaseResponse<SafeEventData[]>> {
  try {
    const { data, error } = await supabase
      .from('public_medical_events')
      .select('*')
      .eq('status', 'approved')
      .order('start_date', { ascending: true });

    return { data, error };
  } catch (error) {
    logger.error('Error fetching public events', error instanceof Error ? error : new Error(String(error)), { 
      component: 'secureEventApi.getPublicEvents'
    });
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'FETCH_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}

/**
 * Fetches a single public event by ID without sensitive organizer contact information
 */
export async function getPublicEventById(eventId: string): Promise<SupabaseResponse<SafeEventData>> {
  try {
    const { data, error } = await supabase
      .from('public_medical_events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'approved')
      .single();

    return { data, error };
  } catch (error) {
    logger.error('Error fetching public event', error instanceof Error ? error : new Error(String(error)), { 
      component: 'secureEventApi.getPublicEventById',
      metadata: { eventId }
    });
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'FETCH_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}

/**
 * Securely fetches organizer contact information
 * Only accessible to event creators and verified admins
 */
export async function getOrganizerContactInfo(eventId: string): Promise<SupabaseResponse<OrganizerContactInfo[]>> {
  try {
    const { data, error } = await supabase.rpc('get_organizer_contact_info', {
      event_id: eventId
    });

    if (error) {
      logger.error('Error fetching organizer contact info', error instanceof Error ? error : new Error(String(error)), { 
        component: 'secureEventApi.getOrganizerContactInfo',
        metadata: { eventId }
      });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Error in organizer contact info request', error instanceof Error ? error : new Error(String(error)), { 
      component: 'secureEventApi.getOrganizerContactInfo',
      metadata: { eventId }
    });
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'RPC_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
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
    logger.error('Error checking organizer data access', error instanceof Error ? error : new Error(String(error)), { 
      component: 'secureEventApi.canAccessOrganizerData',
      metadata: { eventId }
    });
    return false;
  }
}

/**
 * Fetches events created by the current user (includes all data)
 */
export async function getUserCreatedEvents(): Promise<SupabaseResponse<SafeEventData[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        data: null, 
        error: { message: 'User not authenticated', code: 'AUTH_REQUIRED' } as SupabaseError
      };
    }

    const { data, error } = await supabase
      .from('medical_events')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    logger.error('Error fetching user created events', error instanceof Error ? error : new Error(String(error)), { 
      component: 'secureEventApi.getUserCreatedEvents'
    });
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'FETCH_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}

/**
 * Gets safe organizer display data with masking for unauthorized users
 */
export async function getSafeOrganizerDisplay(
  eventId: string, 
  includeSensitive: boolean = false
): Promise<SupabaseResponse<SafeOrganizerDisplay>> {
  try {
    const { data, error } = await supabase.rpc('get_safe_organizer_display', {
      event_id: eventId,
      include_sensitive: includeSensitive
    });

    if (error) {
      logger.error('Error fetching safe organizer display', error instanceof Error ? error : new Error(String(error)), { 
        component: 'secureEventApi.getSafeOrganizerDisplay',
        metadata: { eventId, includeSensitive }
      });
      return { data: null, error };
    }

    return { data: data?.[0] || null, error: null };
  } catch (error) {
    logger.error('Error in safe organizer display request', error instanceof Error ? error : new Error(String(error)), { 
      component: 'secureEventApi.getSafeOrganizerDisplay',
      metadata: { eventId, includeSensitive }
    });
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'RPC_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
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
}): Promise<SupabaseResponse<EventSearchResult>> {
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
    logger.error('Error searching events', error instanceof Error ? error : new Error(String(error)), { 
      component: 'secureEventApi.searchEvents',
      metadata: { params }
    });
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'SEARCH_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}