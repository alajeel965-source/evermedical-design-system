import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Location {
  value: string;
  label: string;
  type: 'country' | 'city';
  country?: string; // For cities, reference to parent country
  count?: number;
}

interface LocationFilterProps {
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
  availableLocations?: Location[];
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

// Mock data - in real app, this would come from API/database
const MOCK_LOCATIONS: Location[] = [
  { value: "united-states", label: "United States", type: "country", count: 45 },
  { value: "new-york", label: "New York", type: "city", country: "united-states", count: 12 },
  { value: "chicago", label: "Chicago", type: "city", country: "united-states", count: 8 },
  { value: "san-francisco", label: "San Francisco", type: "city", country: "united-states", count: 15 },
  { value: "united-kingdom", label: "United Kingdom", type: "country", count: 32 },
  { value: "london", label: "London", type: "city", country: "united-kingdom", count: 18 },
  { value: "manchester", label: "Manchester", type: "city", country: "united-kingdom", count: 6 },
  { value: "germany", label: "Germany", type: "country", count: 28 },
  { value: "berlin", label: "Berlin", type: "city", country: "germany", count: 12 },
  { value: "munich", label: "Munich", type: "city", country: "germany", count: 9 },
  { value: "france", label: "France", type: "country", count: 24 },
  { value: "paris", label: "Paris", type: "city", country: "france", count: 16 },
  { value: "singapore", label: "Singapore", type: "country", count: 19 },
  { value: "singapore-city", label: "Singapore City", type: "city", country: "singapore", count: 19 },
  { value: "canada", label: "Canada", type: "country", count: 21 },
  { value: "toronto", label: "Toronto", type: "city", country: "canada", count: 11 },
  { value: "vancouver", label: "Vancouver", type: "city", country: "canada", count: 7 },
  { value: "australia", label: "Australia", type: "country", count: 17 },
  { value: "sydney", label: "Sydney", type: "city", country: "australia", count: 9 },
  { value: "melbourne", label: "Melbourne", type: "city", country: "australia", count: 6 },
];

export function LocationFilter({
  selectedLocations,
  onLocationChange,
  availableLocations = MOCK_LOCATIONS,
  isOpen = true,
  onToggle,
  className
}: LocationFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);
  const { language, isRTL } = useI18n();

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return availableLocations;
    
    return availableLocations.filter(location =>
      location.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableLocations, searchQuery]);

  const groupedLocations = useMemo(() => {
    const countries = filteredLocations.filter(loc => loc.type === 'country');
    const cities = filteredLocations.filter(loc => loc.type === 'city');
    
    return {
      countries: countries.sort((a, b) => (b.count || 0) - (a.count || 0)),
      cities: cities.sort((a, b) => (b.count || 0) - (a.count || 0))
    };
  }, [filteredLocations]);

  const handleLocationToggle = (locationValue: string, checked: boolean) => {
    const newLocations = checked
      ? [...selectedLocations, locationValue]
      : selectedLocations.filter(loc => loc !== locationValue);
    
    onLocationChange(newLocations);

    // Analytics tracking
    if (checked) {
      // Track location filter applied
      try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'location_filter_applied', {
            event_category: 'filter',
            event_label: locationValue,
            value: 1
          });
        }
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    } else {
      // Track location filter cleared
      try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'location_filter_cleared', {
            event_category: 'filter',
            event_label: locationValue,
            value: 1
          });
        }
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    }
  };

  const clearAllLocations = () => {
    onLocationChange([]);
    
    // Track clear all filters
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'location_filter_cleared', {
          event_category: 'filter',
          event_label: 'all_locations',
          value: selectedLocations.length
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const getLocationLabel = (value: string) => {
    const location = availableLocations.find(loc => loc.value === value);
    return location?.label || value;
  };

  useEffect(() => {
    if (onToggle) {
      setIsCollapsed(!isOpen);
    }
  }, [isOpen, onToggle]);

  return (
    <div className={cn("space-y-sm", className)}>
      {/* Applied location filters as chips */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-xs">
          {selectedLocations.map((locationValue) => (
            <Badge
              key={locationValue}
              variant="secondary"
              className={cn(
                "text-medical-xs flex items-center gap-xs bg-primary/10 text-primary border-primary/20",
                "hover:bg-primary/20 transition-colors cursor-pointer"
              )}
              onClick={() => handleLocationToggle(locationValue, false)}
            >
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {getLocationLabel(locationValue)}
              <X 
                className="w-3 h-3 hover:text-destructive" 
                aria-label={`Remove ${getLocationLabel(locationValue)} filter`}
              />
            </Badge>
          ))}
          {selectedLocations.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllLocations}
              className="h-auto p-1 text-muted-foreground hover:text-destructive text-medical-xs"
              aria-label="Clear all location filters"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Filter card */}
      <Card className="rounded-medical-md shadow-soft">
        <Collapsible
          open={!isCollapsed}
          onOpenChange={(open) => {
            setIsCollapsed(!open);
            onToggle?.();
          }}
        >
          <CollapsibleTrigger asChild>
            <CardHeader 
              className="pb-sm cursor-pointer hover:bg-accent/50 transition-colors"
              role="button"
              aria-expanded={!isCollapsed}
              aria-controls="location-filter-content"
              aria-label="Toggle location filter"
            >
              <CardTitle className={cn(
                "text-medical-base font-medium flex items-center",
                isRTL ? "flex-row-reverse" : "justify-between"
              )}>
                <div className={cn(
                  "flex items-center",
                  isRTL ? "space-x-reverse space-x-sm" : "space-x-sm"
                )}>
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>Location</span>
                  {selectedLocations.length > 0 && (
                    <Badge variant="secondary" className="text-medical-xs">
                      {selectedLocations.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    !isCollapsed && "transform rotate-180",
                    isRTL && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent id="location-filter-content">
            <CardContent className="pt-0 space-y-md" role="group" aria-labelledby="location-filter-title">
              {/* Search input */}
              <div className="relative">
                <Search className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  isRTL ? "right-sm" : "left-sm"
                )} aria-hidden="true" />
                <Input
                  placeholder={language === 'ar' ? "البحث عن المواقع..." : "Search locations..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "text-medical-sm",
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                  aria-label="Search locations"
                />
              </div>

              {/* Countries */}
              {groupedLocations.countries.length > 0 && (
                <div className="space-y-xs">
                  <h4 className="text-medical-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'البلدان' : 'Countries'}
                  </h4>
                  <div className="space-y-xs max-h-32 overflow-y-auto">
                    {groupedLocations.countries.slice(0, 8).map((location) => (
                      <div key={location.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location.value}`}
                          checked={selectedLocations.includes(location.value)}
                          onCheckedChange={(checked) =>
                            handleLocationToggle(location.value, !!checked)
                          }
                          aria-describedby={`location-${location.value}-count`}
                        />
                        <label
                          htmlFor={`location-${location.value}`}
                          className={cn(
                            "text-medical-sm text-body cursor-pointer flex-1 flex items-center",
                            isRTL ? "flex-row-reverse" : "justify-between"
                          )}
                        >
                          <span>{location.label}</span>
                          {location.count && (
                            <Badge 
                              variant="outline" 
                              className="text-medical-xs ml-2"
                              id={`location-${location.value}-count`}
                            >
                              {location.count}
                            </Badge>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cities */}
              {groupedLocations.cities.length > 0 && (
                <div className="space-y-xs">
                  <h4 className="text-medical-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'المدن' : 'Cities'}
                  </h4>
                  <div className="space-y-xs max-h-32 overflow-y-auto">
                    {groupedLocations.cities.slice(0, 8).map((location) => (
                      <div key={location.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location.value}`}
                          checked={selectedLocations.includes(location.value)}
                          onCheckedChange={(checked) =>
                            handleLocationToggle(location.value, !!checked)
                          }
                          aria-describedby={`location-${location.value}-count`}
                        />
                        <label
                          htmlFor={`location-${location.value}`}
                          className={cn(
                            "text-medical-sm text-body cursor-pointer flex-1 flex items-center",
                            isRTL ? "flex-row-reverse" : "justify-between"
                          )}
                        >
                          <span>{location.label}</span>
                          {location.count && (
                            <Badge 
                              variant="outline" 
                              className="text-medical-xs ml-2"
                              id={`location-${location.value}-count`}
                            >
                              {location.count}
                            </Badge>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {filteredLocations.length === 0 && (
                <div className="text-center text-muted-foreground text-medical-sm py-md">
                  {language === 'ar' ? 'لم يتم العثور على مواقع' : 'No locations found'}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}