import { supabase } from "@/integrations/supabase/client";
import type { SupabaseResponse, SupabaseError } from "@/lib/types/api";

export interface SafeRfqDisplay {
  id: string;
  title: string;
  description_masked: string;
  budget_range_masked: string;
  delivery_location: string;
  status: string;
  created_at: string;
  updated_at: string;
  category_id: string;
  can_access_full_details: boolean;
  is_buyer: boolean;
}

export interface RfqData {
  id: string;
  title: string;
  description: string;
  budget_range?: string;
  delivery_location?: string;
  status: string;
  created_at: string;
  updated_at: string;
  category_id?: string;
  buyer_id: string;
}

/**
 * Gets safe RFQ display data with masking for unauthorized users
 */
export async function getSafeRfqDisplay(
  rfqId: string, 
  includeSensitive: boolean = false
): Promise<SupabaseResponse<SafeRfqDisplay>> {
  try {
    const { data, error } = await supabase.rpc('get_safe_rfq_display', {
      rfq_id: rfqId,
      include_sensitive: includeSensitive
    });

    if (error) {
      console.error('Error fetching safe RFQ display:', error);
      return { data: null, error };
    }

    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error in safe RFQ display request:', error);
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'RPC_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}

/**
 * Fetches RFQs accessible to current user with proper security
 */
export async function getUserAccessibleRfqs(): Promise<SupabaseResponse<RfqData[]>> {
  try {
    const { data, error } = await supabase
      .from('rfqs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching accessible RFQs:', error);
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'FETCH_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}

/**
 * Creates a new RFQ (only for authenticated buyers)
 */
export async function createRfq(rfqData: Omit<RfqData, 'id' | 'created_at' | 'updated_at' | 'buyer_id'>): Promise<SupabaseResponse<RfqData>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        data: null, 
        error: { message: 'User not authenticated', code: 'AUTH_REQUIRED' } as SupabaseError
      };
    }

    // Get user profile to get buyer_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return { 
        data: null, 
        error: { message: 'User profile not found', code: 'PROFILE_NOT_FOUND' } as SupabaseError
      };
    }

    const { data, error } = await supabase
      .from('rfqs')
      .insert({
        ...rfqData,
        buyer_id: profile.id,
        status: 'open'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'CREATE_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}

/**
 * Updates an existing RFQ (only by buyer who created it)
 */
export async function updateRfq(rfqId: string, updates: Partial<Omit<RfqData, 'id' | 'created_at' | 'buyer_id'>>): Promise<SupabaseResponse<RfqData>> {
  try {
    const { data, error } = await supabase
      .from('rfqs')
      .update(updates)
      .eq('id', rfqId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating RFQ:', error);
    return { 
      data: null, 
      error: error instanceof Error ? { message: error.message, code: 'UPDATE_ERROR' } : { message: 'Unknown error', code: 'UNKNOWN' } as SupabaseError
    };
  }
}