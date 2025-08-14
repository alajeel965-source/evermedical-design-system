import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Award, Globe, Loader2, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface EventSearchResult {
  id: string;
  slug: string;
  title: string;
  title_ar?: string;
  summary: string;
  summary_ar?: string;
  start_date: string;
  end_date: string;
  format: 'in-person' | 'virtual' | 'hybrid';
  venue_name?: string;
  city?: string;
  country?: string;
  organizer?: string;
  has_cme: boolean;
  cme_hours?: number;
  is_free: boolean;
  price_range?: string;
  registration_url?: string;
  featured_image?: string;
  view_count: number;
  save_count: number;
  confidence_score: number;
  primary_specialty?: {
    name_en: string;
    name_ar?: string;
    slug: string;
  };
  tags?: Array<{
    tag: {
      name_en: string;
      name_ar?: string;
      slug: string;
      color: string;
    };
  }>;
}

interface SearchFilters {
  query: string;
  specialty?: string;
  country?: string;
  city?: string;
  format?: string;
  has_cme?: boolean;
  is_free?: boolean;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  sort_by: 'relevance' | 'date' | 'popular' | 'closest';
}

interface SearchFacets {
  specialties: Array<{ name: string; slug: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
  formats: Array<{ name: string; count: number }>;
  price_ranges: Array<{ name: string; count: number }>;
}

interface AIEventSearchProps {
  onEventSelect?: (event: EventSearchResult) => void;
  className?: string;
  showFilters?: boolean;
  compact?: boolean;
}

const formatDate = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const EventCard: React.FC<{
  event: EventSearchResult;
  locale: string;
  onSelect?: (event: EventSearchResult) => void;
}> = ({ event, locale, onSelect }) => {
  const isRTL = locale === 'ar';
  const title = locale === 'ar' && event.title_ar ? event.title_ar : event.title;
  const summary = locale === 'ar' && event.summary_ar ? event.summary_ar : event.summary;
  const specialtyName = locale === 'ar' && event.primary_specialty?.name_ar 
    ? event.primary_specialty.name_ar 
    : event.primary_specialty?.name_en;

  const handleInteraction = async (type: 'view' | 'click') => {
    try {
      await supabase.functions.invoke('event-interactions', {
        body: {
          event_id: event.id,
          interaction_type: type,
          metadata: { timestamp: new Date().toISOString() }
        }
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleCardClick = () => {
    handleInteraction('view');
    if (onSelect) {
      onSelect(event);
    }
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInteraction('click');
    if (event.registration_url) {
      window.open(event.registration_url, '_blank');
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-medical-lg hover:scale-[1.02]",
        "backdrop-blur-sm bg-card/80 border-border",
        isRTL && "text-right"
      )}
      onClick={handleCardClick}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <CardHeader className="p-lg pb-md">
        <div className="flex justify-between items-start gap-md">
          <div className="flex-1">
            <CardTitle className="text-heading font-semibold text-medical-lg line-clamp-2 mb-xs">
              {title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-xs mb-sm">
              {specialtyName && (
                <Badge variant="secondary" className="text-medical-xs">
                  {specialtyName}
                </Badge>
              )}
              {event.format && (
                <Badge 
                  variant={event.format === 'virtual' ? 'outline' : 'default'}
                  className="text-medical-xs"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {event.format}
                </Badge>
              )}
              {event.has_cme && (
                <Badge variant="default" className="bg-success text-medical-xs">
                  <Award className="w-3 h-3 mr-1" />
                  CME {event.cme_hours && `${event.cme_hours}h`}
                </Badge>
              )}
              {event.is_free && (
                <Badge variant="outline" className="text-success border-success text-medical-xs">
                  Free
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-xs">
            <div className="flex items-center gap-xs text-medical-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatDate(event.start_date, locale)}
            </div>
            {event.confidence_score && (
              <div className={cn(
                "text-medical-xs px-2 py-1 rounded-medical-sm",
                event.confidence_score > 0.8 ? "bg-success/10 text-success" :
                event.confidence_score > 0.6 ? "bg-warning/10 text-warning" :
                "bg-muted/50 text-muted-foreground"
              )}>
                {Math.round(event.confidence_score * 100)}% confident
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-lg pt-0">
        <p className="text-body text-medical-base line-clamp-2 mb-md">
          {summary}
        </p>

        <div className="space-y-sm mb-lg">
          {event.organizer && (
            <div className="flex items-center gap-xs text-medical-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {event.organizer}
            </div>
          )}
          {(event.city || event.country) && (
            <div className="flex items-center gap-xs text-medical-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {[event.city, event.country].filter(Boolean).join(', ')}
            </div>
          )}
          {event.venue_name && event.format !== 'virtual' && (
            <div className="flex items-center gap-xs text-medical-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              {event.venue_name}
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-xs mb-lg">
            {event.tags.slice(0, 3).map((tagRelation, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-medical-xs"
                style={{ borderColor: tagRelation.tag.color + '40', color: tagRelation.tag.color }}
              >
                {locale === 'ar' && tagRelation.tag.name_ar 
                  ? tagRelation.tag.name_ar 
                  : tagRelation.tag.name_en}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-md text-medical-sm text-muted-foreground">
            <span>{event.view_count} views</span>
            <span>{event.save_count} saved</span>
          </div>
          
          {event.registration_url && (
            <Button 
              size="sm"
              onClick={handleRegisterClick}
              className="hover:scale-105 transition-transform"
            >
              Register
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const AIEventSearch: React.FC<AIEventSearchProps> = ({
  onEventSelect,
  className,
  showFilters = true,
  compact = false
}) => {
  const { t, language } = useTranslation();
  const [events, setEvents] = useState<EventSearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sort_by: 'relevance'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const isRTL = language === 'ar';

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (filters.query.length >= 2 || Object.keys(filters).length > 2) {
        handleSearch();
      } else if (filters.query.length === 0) {
        // Load default events when no query
        handleSearch();
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters]);

  const handleSearch = async (newPage = 1) => {
    setLoading(true);
    setPage(newPage);

    try {
      const searchParams = new URLSearchParams();
      Object.entries({
        ...filters,
        page: newPage.toString(),
        limit: '20',
        locale: language
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });

      const { data, error } = await supabase.functions.invoke('event-search', {
        body: Object.fromEntries(searchParams),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) throw error;

      if (data.success) {
        setEvents(data.data.events);
        setFacets(data.data.facets);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to direct database query
      try {
        const { data: fallbackEvents } = await supabase
          .from('medical_events')
          .select(`
            id, slug, title, title_ar, summary, summary_ar,
            start_date, end_date, format, venue_name, city, country,
            organizer, has_cme, cme_hours, is_free, price_range,
            registration_url, featured_image, view_count, save_count,
            confidence_score,
            primary_specialty:event_specialties(name_en, name_ar, slug)
          `)
          .eq('status', 'approved')
          .order('start_date', { ascending: true })
          .limit(20);

        setEvents((fallbackEvents || []) as unknown as EventSearchResult[]);
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      sort_by: 'relevance'
    });
  };

  const FilterContent = () => (
    <div className="space-y-lg">
      {/* Specialty Filter */}
      {facets?.specialties && facets.specialties.length > 0 && (
        <div className="space-y-sm">
          <h4 className="font-semibold text-medical-base">Specialty</h4>
          <Select value={filters.specialty || ''} onValueChange={(value) => updateFilter('specialty', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Specialties</SelectItem>
              {facets.specialties.map((specialty) => (
                <SelectItem key={specialty.slug} value={specialty.slug}>
                  {specialty.name} ({specialty.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Format Filter */}
      <div className="space-y-sm">
        <h4 className="font-semibold text-medical-base">Format</h4>
        <Select value={filters.format || ''} onValueChange={(value) => updateFilter('format', value || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="All Formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Formats</SelectItem>
            <SelectItem value="in-person">In-Person</SelectItem>
            <SelectItem value="virtual">Virtual</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country Filter */}
      {facets?.countries && facets.countries.length > 0 && (
        <div className="space-y-sm">
          <h4 className="font-semibold text-medical-base">Country</h4>
          <Select value={filters.country || ''} onValueChange={(value) => updateFilter('country', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Countries</SelectItem>
              {facets.countries.slice(0, 10).map((country) => (
                <SelectItem key={country.name} value={country.name}>
                  {country.name} ({country.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Boolean Filters */}
      <div className="space-y-sm">
        <h4 className="font-semibold text-medical-base">Features</h4>
        <div className="space-y-xs">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-cme"
              checked={filters.has_cme || false}
              onCheckedChange={(checked) => updateFilter('has_cme', checked || undefined)}
            />
            <label htmlFor="has-cme" className="text-medical-sm">CME Accredited</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-free"
              checked={filters.is_free || false}
              onCheckedChange={(checked) => updateFilter('is_free', checked || undefined)}
            />
            <label htmlFor="is-free" className="text-medical-sm">Free Events</label>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-sm">
        <h4 className="font-semibold text-medical-base">Date Range</h4>
        <div className="grid grid-cols-2 gap-sm">
          <Input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => updateFilter('start_date', e.target.value || undefined)}
            placeholder="Start Date"
          />
          <Input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => updateFilter('end_date', e.target.value || undefined)}
            placeholder="End Date"
          />
        </div>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className={cn("w-full space-y-lg", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search Header */}
      <div className="space-y-md">
        <div className="flex gap-md">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={isRTL ? "ابحث عن الفعاليات الطبية..." : "Search medical events..."}
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="pl-10 text-medical-base"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
            )}
          </div>
          
          {showFilters && (
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Filter className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-lg">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Sort and Results Count */}
        <div className="flex justify-between items-center">
          <div className="text-medical-sm text-muted-foreground">
            {total > 0 && `${total} events found`}
          </div>
          
          <Select value={filters.sort_by} onValueChange={(value: any) => updateFilter('sort_by', value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="closest">Closest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
        {/* Filters Sidebar - Desktop */}
        {showFilters && (
          <div className="hidden md:block lg:col-span-1">
            <Card className="sticky top-lg">
              <CardHeader>
                <CardTitle className="text-medical-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className={cn("space-y-lg", showFilters ? "lg:col-span-3" : "lg:col-span-4")}>
          {loading && events.length === 0 ? (
            <div className="flex justify-center py-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <Card className="text-center py-2xl">
              <CardContent>
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-md" />
                <h3 className="text-medical-lg font-semibold mb-xs">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-lg">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    locale={language}
                    onSelect={onEventSelect}
                  />
                ))}
              </div>

              {/* Load More */}
              {total > events.length && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => handleSearch(page + 1)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Load More Events
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};