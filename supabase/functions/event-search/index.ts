import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://copipddzqlmxstkucvmk.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey!);

interface SearchParams {
  query?: string;
  specialty?: string;
  subspecialty?: string;
  country?: string;
  city?: string;
  format?: string;
  has_cme?: boolean;
  is_free?: boolean;
  start_date?: string;
  end_date?: string;
  language?: string;
  target_audience?: string;
  sort_by?: 'relevance' | 'date' | 'popular' | 'closest';
  page?: number;
  limit?: number;
  locale?: 'en' | 'ar';
}

interface SearchResult {
  events: any[];
  total: number;
  page: number;
  limit: number;
  facets: {
    specialties: { name: string; count: number; slug: string }[];
    countries: { name: string; count: number }[];
    formats: { name: string; count: number }[];
    price_ranges: { name: string; count: number }[];
  };
}

async function enhanceQueryWithAI(query: string, locale: 'en' | 'ar' = 'en'): Promise<{
  enhanced_query: string;
  extracted_filters: Partial<SearchParams>;
  synonyms: string[];
}> {
  if (!query || query.trim().length < 3) {
    return {
      enhanced_query: query,
      extracted_filters: {},
      synonyms: []
    };
  }

  const prompt = `Analyze this medical event search query and extract search intent. Respond with JSON only.

Query: "${query}"
Language: ${locale}

Extract:
1. Enhanced search terms with medical synonyms and acronyms
2. Implicit filters (specialty, location, format, etc.)
3. Relevant synonyms and abbreviations

Medical specialty mappings:
- ENT, Otolaryngology → "Otolaryngology"
- Cardio → "Cardiology"
- Neuro → "Neurology"
- Ortho → "Orthopedics"
- Derm → "Dermatology"
- Peds → "Pediatrics"
- Psych → "Psychiatry"
- ER, Emergency → "Emergency Medicine"

Format keywords:
- online, webinar, virtual → "virtual"
- conference, meeting, congress → "in-person"
- hybrid → "hybrid"

CME keywords: CME, credits, accredited, continuing education
Free keywords: free, no cost, complimentary

Respond with this JSON structure:
{
  "enhanced_query": "enhanced search terms with synonyms",
  "extracted_filters": {
    "specialty": "specialty_slug_if_detected",
    "format": "format_if_detected",
    "has_cme": true_if_cme_mentioned,
    "is_free": true_if_free_mentioned,
    "country": "country_if_mentioned"
  },
  "synonyms": ["synonym1", "synonym2", "acronym1"]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a medical search query analyzer. Extract search intent and medical terminology from queries. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 400,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    console.log('AI enhanced query:', result);
    return result;
  } catch (error) {
    console.error('Error enhancing query with AI:', error);
    return {
      enhanced_query: query,
      extracted_filters: {},
      synonyms: []
    };
  }
}

async function buildSearchQuery(params: SearchParams, enhancedQuery?: any) {
  let query = supabase
    .from('medical_events')
    .select(`
      id,
      slug,
      title,
      title_ar,
      summary,
      summary_ar,
      start_date,
      end_date,
      format,
      venue_name,
      city,
      country,
      organizer,
      has_cme,
      cme_hours,
      is_free,
      price_range,
      registration_url,
      featured_image,
      view_count,
      save_count,
      confidence_score,
      primary_specialty:event_specialties(name_en, name_ar, slug),
      tags:event_tag_relations(tag:event_tags(name_en, name_ar, slug, color))
    `)
    .eq('status', 'approved');

  // Text search with AI enhancement
  if (params.query) {
    const searchTerms = enhancedQuery?.enhanced_query || params.query;
    const synonyms = enhancedQuery?.synonyms || [];
    
    // Combine original query with synonyms for broader matching
    const allTerms = [searchTerms, ...synonyms].join(' | ');
    
    query = query.or(`
      title.ilike.%${searchTerms}%,
      description.ilike.%${searchTerms}%,
      organizer.ilike.%${searchTerms}%,
      title_ar.ilike.%${searchTerms}%,
      description_ar.ilike.%${searchTerms}%
    `);
  }

  // Apply filters from AI enhancement and explicit params
  const filters = { ...enhancedQuery?.extracted_filters, ...params };

  if (filters.specialty) {
    const { data: specialty } = await supabase
      .from('event_specialties')
      .select('id')
      .eq('slug', filters.specialty)
      .single();
    
    if (specialty) {
      query = query.eq('primary_specialty_id', specialty.id);
    }
  }

  if (filters.country) {
    query = query.eq('country', filters.country);
  }

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }

  if (filters.format) {
    query = query.eq('format', filters.format);
  }

  if (typeof filters.has_cme === 'boolean') {
    query = query.eq('has_cme', filters.has_cme);
  }

  if (typeof filters.is_free === 'boolean') {
    query = query.eq('is_free', filters.is_free);
  }

  if (filters.start_date) {
    query = query.gte('start_date', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('end_date', filters.end_date);
  }

  if (filters.target_audience) {
    query = query.contains('target_audience', [filters.target_audience]);
  }

  if (filters.language) {
    query = query.contains('languages', [filters.language]);
  }

  // Sorting
  switch (params.sort_by) {
    case 'date':
      query = query.order('start_date', { ascending: true });
      break;
    case 'popular':
      query = query.order('view_count', { ascending: false });
      break;
    case 'closest':
      // For now, just sort by date - in real implementation, would use geolocation
      query = query.order('start_date', { ascending: true });
      break;
    case 'relevance':
    default:
      // Sort by confidence score, then by start date
      query = query.order('confidence_score', { ascending: false })
                   .order('start_date', { ascending: true });
      break;
  }

  return query;
}

async function getFacets(baseParams: SearchParams): Promise<SearchResult['facets']> {
  // Get facet counts for filters
  const [specialtiesResult, countriesResult, formatsResult, priceRangesResult] = await Promise.all([
    // Specialties
    supabase
      .from('medical_events')
      .select('primary_specialty_id, event_specialties!inner(name_en, slug)')
      .eq('status', 'approved')
      .not('primary_specialty_id', 'is', null),
    
    // Countries
    supabase
      .from('medical_events')
      .select('country')
      .eq('status', 'approved')
      .not('country', 'is', null),
    
    // Formats
    supabase
      .from('medical_events')
      .select('format')
      .eq('status', 'approved'),
    
    // Price ranges
    supabase
      .from('medical_events')
      .select('is_free, price_range')
      .eq('status', 'approved')
  ]);

  // Process specialty facets
  const specialtyMap = new Map();
  specialtiesResult.data?.forEach(item => {
    const key = item.event_specialties?.slug;
    const name = item.event_specialties?.name_en;
    if (key && name) {
      specialtyMap.set(key, {
        name,
        slug: key,
        count: (specialtyMap.get(key)?.count || 0) + 1
      });
    }
  });

  // Process country facets
  const countryMap = new Map();
  countriesResult.data?.forEach(item => {
    if (item.country) {
      countryMap.set(item.country, {
        name: item.country,
        count: (countryMap.get(item.country)?.count || 0) + 1
      });
    }
  });

  // Process format facets
  const formatMap = new Map();
  formatsResult.data?.forEach(item => {
    if (item.format) {
      formatMap.set(item.format, {
        name: item.format,
        count: (formatMap.get(item.format)?.count || 0) + 1
      });
    }
  });

  // Process price facets
  const priceMap = new Map();
  priceRangesResult.data?.forEach(item => {
    const key = item.is_free ? 'Free' : (item.price_range || 'Contact for pricing');
    priceMap.set(key, {
      name: key,
      count: (priceMap.get(key)?.count || 0) + 1
    });
  });

  return {
    specialties: Array.from(specialtyMap.values()).sort((a, b) => b.count - a.count),
    countries: Array.from(countryMap.values()).sort((a, b) => b.count - a.count),
    formats: Array.from(formatMap.values()).sort((a, b) => b.count - a.count),
    price_ranges: Array.from(priceMap.values()).sort((a, b) => b.count - a.count)
  };
}

async function searchEvents(params: SearchParams): Promise<SearchResult> {
  console.log('Searching events with params:', params);
  
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  const offset = (page - 1) * limit;

  // Enhance query with AI if provided
  let enhancedQuery = null;
  if (params.query) {
    enhancedQuery = await enhanceQueryWithAI(params.query, params.locale);
  }

  // Build and execute search query
  const searchQuery = await buildSearchQuery(params, enhancedQuery);
  
  const [eventsResult, countResult, facets] = await Promise.all([
    searchQuery.range(offset, offset + limit - 1),
    searchQuery.select('id', { count: 'exact', head: true }),
    getFacets(params)
  ]);

  if (eventsResult.error) {
    throw eventsResult.error;
  }

  const events = eventsResult.data || [];
  const total = countResult.count || 0;

  console.log(`Found ${total} events, returning ${events.length} for page ${page}`);

  return {
    events,
    total,
    page,
    limit,
    facets
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    
    // Convert string parameters to appropriate types
    const params: SearchParams = {
      query: searchParams.query,
      specialty: searchParams.specialty,
      subspecialty: searchParams.subspecialty,
      country: searchParams.country,
      city: searchParams.city,
      format: searchParams.format,
      has_cme: searchParams.has_cme === 'true',
      is_free: searchParams.is_free === 'true',
      start_date: searchParams.start_date,
      end_date: searchParams.end_date,
      language: searchParams.language,
      target_audience: searchParams.target_audience,
      sort_by: searchParams.sort_by as any || 'relevance',
      page: parseInt(searchParams.page || '1'),
      limit: parseInt(searchParams.limit || '20'),
      locale: searchParams.locale as 'en' | 'ar' || 'en'
    };

    const results = await searchEvents(params);

    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in event-search function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});