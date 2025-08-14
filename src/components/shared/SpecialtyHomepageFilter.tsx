import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSpecialtyOptions, trackSpecialtyEvent } from "@/lib/specialties";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ChevronRight, TrendingUp } from "lucide-react";

// Top 6 specialties based on common medical events
const TOP_SPECIALTIES = [
  'internal-medicine',
  'surgery', 
  'pediatrics',
  'obstetrics-gynecology',
  'dermatology',
  'cardiology'
];

export const SpecialtyHomepageFilter = () => {
  const { locale } = useTranslation();
  const specialtyOptions = getSpecialtyOptions(locale);
  
  const topSpecialties = TOP_SPECIALTIES.map(slug => 
    specialtyOptions.find(s => s.value === slug)
  ).filter(Boolean);

  const handleSpecialtyClick = (specialtySlug: string) => {
    trackSpecialtyEvent('homepage_specialty_click', specialtySlug);
  };

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {locale === 'ar' ? 'التخصصات الشائعة' : 'Popular Specialties'}
          </CardTitle>
          <Link 
            to="/events"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {locale === 'ar' ? 'عرض الكل' : 'View All'}
            <ChevronRight className="inline h-3 w-3 ml-1" />
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {topSpecialties.map((specialty) => (
            <Link
              key={specialty!.value}
              to={`/specialty/${specialty!.value}`}
              onClick={() => handleSpecialtyClick(specialty!.value)}
              className="group"
            >
              <Badge 
                variant="outline" 
                className="w-full justify-center py-3 px-4 text-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 group-hover:scale-105"
                data-analytics="homepage-specialty-filter"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-xs text-primary font-semibold">
                    {specialty!.code}
                  </span>
                  <span className="text-xs font-medium leading-tight">
                    {specialty!.label}
                  </span>
                </div>
              </Badge>
            </Link>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <Link 
            to="/events"
            className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {locale === 'ar' 
              ? 'استكشف جميع التخصصات الطبية'
              : 'Explore all medical specialties'
            }
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};