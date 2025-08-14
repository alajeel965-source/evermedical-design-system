import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSpecialtyBySlug, getSpecialtySEOData, trackSpecialtyEvent } from "@/lib/specialties";
import { updatePageSEO, generateSpecialtyPageStructuredData, generateBreadcrumbStructuredData } from "@/lib/seo";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { SpecialtyPill } from "@/components/shared/SpecialtyPill";
import { SpecialtyBreadcrumb } from "@/components/shared/SpecialtyBreadcrumb";
import { AppShell } from "@/components/shared/AppShell";
import NotFound from "@/pages/NotFound";

interface EventData {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  start_date: string;
  end_date: string;
  format: string;
  venue_name?: string;
  city?: string;
  country?: string;
  has_cme: boolean;
  cme_hours?: number;
  is_free: boolean;
  specialty_slug: string;
  slug: string;
  featured_image?: string;
}

export const SpecialtyLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale, t } = useTranslation();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    freeEvents: 0,
    cmeEvents: 0
  });

  const specialty = slug ? getSpecialtyBySlug(slug) : null;

  useEffect(() => {
    if (!specialty) return;

    // Track page view
    trackSpecialtyEvent('specialty_page_view', specialty.slug);

    // Set SEO meta tags
    const seoData = getSpecialtySEOData(specialty, locale);
    const specialtyName = locale === 'ar' ? specialty.arabic : specialty.name;
    
    updatePageSEO({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      canonical: `${window.location.origin}/specialty/${specialty.slug}`,
      structuredData: generateSpecialtyPageStructuredData({
        name: specialtyName,
        description: seoData.description,
        url: `${window.location.origin}/specialty/${specialty.slug}`
      })
    });

    // Add breadcrumb structured data
    const breadcrumbItems = [
      { name: 'Home', url: `${window.location.origin}/` },
      { name: 'Medical Events', url: `${window.location.origin}/events` },
      { name: specialtyName, url: `${window.location.origin}/specialty/${specialty.slug}` }
    ];
    
    const breadcrumbSchema = generateBreadcrumbStructuredData(breadcrumbItems);
    updatePageSEO({ ...seoData, structuredData: breadcrumbSchema });

    // Fetch events for this specialty
    fetchSpecialtyEvents();
  }, [specialty, locale]);

  const fetchSpecialtyEvents = async () => {
    if (!specialty) return;

    setLoading(true);
    try {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('medical_events')
        .select(`
          id, title, title_ar, description, start_date, end_date, format,
          venue_name, city, country, has_cme, cme_hours, is_free, 
          specialty_slug, slug, featured_image
        `)
        .eq('specialty_slug', specialty.slug)
        .eq('status', 'approved')
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(12);

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);

      // Calculate stats
      const now = new Date();
      const upcoming = eventsData?.filter(e => new Date(e.start_date) > now).length || 0;
      const free = eventsData?.filter(e => e.is_free).length || 0;
      const cme = eventsData?.filter(e => e.has_cme).length || 0;

      setStats({
        totalEvents: eventsData?.length || 0,
        upcomingEvents: upcoming,
        freeEvents: free,
        cmeEvents: cme
      });

    } catch (error) {
      console.error('Error fetching specialty events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!specialty) {
    return <NotFound />;
  }

  const specialtyName = locale === 'ar' ? specialty.arabic : specialty.name;

  return (
    <AppShell>
      <SpecialtyBreadcrumb specialtySlug={specialty.slug} />
      <div className="min-h-screen bg-gradient-to-br from-sky to-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <SpecialtyPill specialtySlug={specialty.slug} variant="default" />
                <h1 className="text-4xl md:text-5xl font-bold text-heading">
                  {specialtyName}
                </h1>
              </div>
              
              <p className="text-xl text-body mb-8 max-w-2xl mx-auto">
                {locale === 'ar' 
                  ? `اكتشف أحدث المؤتمرات والفعاليات في ${specialtyName}. انضم للمتخصصين من جميع أنحاء العالم واحصل على اعتمادات CME.`
                  : `Discover the latest ${specialtyName} conferences and events. Connect with specialists worldwide and earn CME credits.`
                }
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'إجمالي الفعاليات' : 'Total Events'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.upcomingEvents}</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'فعاليات قادمة' : 'Upcoming'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.freeEvents}</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'مجانية' : 'Free Events'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.cmeEvents}</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'معتمدة CME' : 'CME Accredited'}
                  </div>
                </div>
              </div>

              <Button 
                asChild 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                data-analytics="specialty-cta-click"
              >
                <Link to={`/events?specialties=${specialty.slug}`}>
                  {locale === 'ar' ? 'عرض جميع الفعاليات' : 'View All Events'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-heading mb-2">
                  {locale === 'ar' ? 'الفعاليات القادمة' : 'Upcoming Events'}
                </h2>
                <p className="text-body">
                  {locale === 'ar' 
                    ? `آخر الفعاليات في ${specialtyName}`
                    : `Latest events in ${specialtyName}`
                  }
                </p>
              </div>
              
              <Button variant="outline" asChild>
                <Link to={`/events?specialties=${specialty.slug}`}>
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card 
                    key={event.id} 
                    className="group hover:shadow-medical transition-all duration-200 cursor-pointer"
                    onClick={() => trackSpecialtyEvent('specialty_event_click', specialty.slug, { event_id: event.id })}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {locale === 'ar' && event.title_ar ? event.title_ar : event.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          {event.is_free && (
                            <Badge variant="secondary" className="text-xs">
                              {locale === 'ar' ? 'مجاني' : 'Free'}
                            </Badge>
                          )}
                          {event.has_cme && (
                            <Badge variant="outline" className="text-xs">
                              CME
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {event.start_date !== event.end_date && (
                          <>
                            <span>-</span>
                            <span>
                              {new Date(event.end_date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {event.format === 'virtual' 
                            ? (locale === 'ar' ? 'افتراضي' : 'Virtual')
                            : event.format === 'hybrid'
                            ? (locale === 'ar' ? 'مختلط' : 'Hybrid') 
                            : `${event.city || ''}, ${event.country || ''}`.replace(/^, |, $/, '')
                          }
                        </span>
                      </div>
                      
                      {event.has_cme && event.cme_hours && (
                        <div className="flex items-center gap-2 text-sm text-success">
                          <Award className="h-4 w-4" />
                          <span>
                            {event.cme_hours} {locale === 'ar' ? 'ساعة CME' : 'CME Hours'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        asChild
                      >
                        <Link to={`/events/${event.slug}`}>
                          {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-heading mb-2">
                  {locale === 'ar' ? 'لا توجد فعاليات' : 'No Events Found'}
                </h3>
                <p className="text-body mb-6">
                  {locale === 'ar' 
                    ? `لا توجد فعاليات مجدولة حالياً في ${specialtyName}.`
                    : `No events are currently scheduled for ${specialtyName}.`
                  }
                </p>
                <Button variant="outline" asChild>
                  <Link to="/events">
                    {locale === 'ar' ? 'تصفح جميع الفعاليات' : 'Browse All Events'}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Subspecialties Section */}
        {specialty.subspecialties.length > 0 && (
          <div className="bg-surface/50">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-heading mb-6 text-center">
                  {locale === 'ar' ? 'التخصصات الفرعية' : 'Subspecialties'}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {specialty.subspecialties.map((subspecialty, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="justify-center py-2 px-3 text-center hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={() => trackSpecialtyEvent('subspecialty_click', specialty.slug, { subspecialty })}
                    >
                      {subspecialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};