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

interface EventData {
  title: string;
  description?: string;
  organizer?: string;
  start_date?: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  country?: string;
  city?: string;
  registration_url?: string;
  format?: string;
  price_info?: string;
  cme_info?: string;
  source_url: string;
}

interface AIClassificationResult {
  confidence_score: number;
  primary_specialty?: string;
  subspecialties: string[];
  target_audience: string[];
  has_cme: boolean;
  cme_provider?: string;
  cme_hours?: number;
  is_free: boolean;
  price_range?: string;
  format: 'in-person' | 'virtual' | 'hybrid';
  summary: string;
  summary_ar: string;
  seo_title: string;
  seo_description: string;
  extracted_fields: string[];
  quality_flags: string[];
}

async function classifyEventWithAI(eventData: EventData): Promise<AIClassificationResult> {
  console.log('Classifying event with AI:', eventData.title);
  
  const prompt = `Analyze this medical event and extract structured information. Respond with valid JSON only.

Event Data:
Title: ${eventData.title}
Description: ${eventData.description || 'N/A'}
Organizer: ${eventData.organizer || 'N/A'}
Venue: ${eventData.venue_name || 'N/A'}
Location: ${eventData.city || 'N/A'}, ${eventData.country || 'N/A'}
Price Info: ${eventData.price_info || 'N/A'}
CME Info: ${eventData.cme_info || 'N/A'}

Extract and classify:
1. Primary medical specialty (cardiology, dermatology, emergency-medicine, endocrinology, gastroenterology, neurology, oncology, orthopedics, pediatrics, psychiatry, radiology, surgery, or 'general')
2. Subspecialties (array of specific areas)
3. Target audience (doctors, nurses, students, researchers, pharmacists, technicians)
4. CME accreditation details
5. Event format (in-person, virtual, hybrid)
6. Pricing analysis
7. Quality assessment
8. SEO optimization
9. Arabic translation of summary

Respond with this exact JSON structure:
{
  "confidence_score": 0.85,
  "primary_specialty": "cardiology",
  "subspecialties": ["interventional-cardiology", "cardiac-imaging"],
  "target_audience": ["doctors", "nurses"],
  "has_cme": true,
  "cme_provider": "Provider name",
  "cme_hours": 6.0,
  "is_free": false,
  "price_range": "$200-500",
  "format": "hybrid",
  "summary": "Brief 100-160 char summary in English",
  "summary_ar": "Brief 100-160 char summary in Arabic",
  "seo_title": "SEO optimized title under 60 chars",
  "seo_description": "SEO description under 160 chars",
  "extracted_fields": ["title", "specialty", "cme"],
  "quality_flags": ["missing_venue", "unverified_cme"]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a medical event classification expert. Analyze medical events and extract structured data. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 800,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    console.log('AI classification result:', result);
    return result;
  } catch (error) {
    console.error('Error in AI classification:', error);
    // Return default classification with low confidence
    return {
      confidence_score: 0.1,
      primary_specialty: 'general',
      subspecialties: [],
      target_audience: ['doctors'],
      has_cme: false,
      is_free: true,
      price_range: 'Contact for pricing',
      format: 'in-person',
      summary: eventData.title.substring(0, 150),
      summary_ar: eventData.title.substring(0, 150),
      seo_title: eventData.title.substring(0, 57) + '...',
      seo_description: eventData.description?.substring(0, 157) + '...' || eventData.title,
      extracted_fields: ['title'],
      quality_flags: ['ai_classification_failed']
    };
  }
}

async function generateSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 50);
  
  // Check for duplicates and append number if needed
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const { data: existing } = await supabase
      .from('medical_events')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (!existing) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

async function detectDuplicates(eventData: EventData, aiResult: AIClassificationResult) {
  console.log('Checking for duplicates:', eventData.title);
  
  // Simple duplicate detection based on title similarity and date proximity
  const { data: similarEvents } = await supabase
    .from('medical_events')
    .select('id, title, start_date, organizer, venue_name')
    .ilike('title', `%${eventData.title.split(' ').slice(0, 3).join('%')}%`)
    .limit(10);

  if (similarEvents && similarEvents.length > 0) {
    console.log(`Found ${similarEvents.length} potentially similar events`);
    // In a real implementation, you'd use more sophisticated similarity detection
    // For now, we'll just log and continue
  }
}

async function createEvent(eventData: EventData, sourceId: string): Promise<string> {
  console.log('Processing event:', eventData.title);
  
  // Classify with AI
  const aiResult = await classifyEventWithAI(eventData);
  
  // Check for duplicates
  await detectDuplicates(eventData, aiResult);
  
  // Generate unique slug
  const slug = await generateSlug(eventData.title);
  
  // Get specialty ID
  let specialtyId = null;
  if (aiResult.primary_specialty && aiResult.primary_specialty !== 'general') {
    const { data: specialty } = await supabase
      .from('event_specialties')
      .select('id')
      .eq('slug', aiResult.primary_specialty)
      .single();
    
    specialtyId = specialty?.id;
  }
  
  // Parse dates
  let startDate = new Date();
  let endDate = new Date();
  
  if (eventData.start_date) {
    startDate = new Date(eventData.start_date);
  }
  if (eventData.end_date) {
    endDate = new Date(eventData.end_date);
  } else {
    endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Default to next day
  }
  
  // Create event record
  const { data: newEvent, error } = await supabase
    .from('medical_events')
    .insert({
      slug,
      title: eventData.title,
      description: eventData.description,
      summary: aiResult.summary,
      summary_ar: aiResult.summary_ar,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      format: aiResult.format,
      venue_name: eventData.venue_name,
      venue_address: eventData.venue_address,
      country: eventData.country,
      city: eventData.city,
      organizer: eventData.organizer,
      primary_specialty_id: specialtyId,
      target_audience: aiResult.target_audience,
      has_cme: aiResult.has_cme,
      cme_provider: aiResult.cme_provider,
      cme_hours: aiResult.cme_hours,
      is_free: aiResult.is_free,
      price_range: aiResult.price_range,
      registration_url: eventData.registration_url,
      seo_title: aiResult.seo_title,
      seo_description: aiResult.seo_description,
      confidence_score: aiResult.confidence_score,
      ai_extracted_fields: aiResult.extracted_fields,
      source_id: sourceId,
      source_url: eventData.source_url,
      fetched_at: new Date().toISOString(),
      status: aiResult.confidence_score > 0.7 ? 'review' : 'draft',
      moderation_flags: aiResult.quality_flags
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }
  
  console.log('Event created successfully:', newEvent.id);
  return newEvent.id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    switch (action) {
      case 'classify_event': {
        const aiResult = await classifyEventWithAI(data);
        return new Response(JSON.stringify({ success: true, data: aiResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'create_event': {
        const { eventData, sourceId } = data;
        const eventId = await createEvent(eventData, sourceId);
        return new Response(JSON.stringify({ success: true, eventId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'bulk_create_events': {
        const { events, sourceId } = data;
        const results = [];
        
        for (const eventData of events) {
          try {
            const eventId = await createEvent(eventData, sourceId);
            results.push({ success: true, eventId, title: eventData.title });
          } catch (error) {
            console.error('Error creating event:', error);
            results.push({ success: false, error: error.message, title: eventData.title });
          }
        }
        
        return new Response(JSON.stringify({ success: true, results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in ai-event-discovery function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});