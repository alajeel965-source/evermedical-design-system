import { useState } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface FilterGroup {
  title: string;
  items: Array<{ value: string; label: string; count?: number }>;
}

interface FilterSidebarProps {
  filters: FilterGroup[];
  selectedFilters?: Record<string, string[]>;
  onFilterChange?: (groupTitle: string, value: string, checked: boolean) => void;
  onClearFilters?: () => void;
}

export function FilterSidebar({
  filters,
  selectedFilters = {},
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    filters.reduce((acc, filter) => ({ ...acc, [filter.title]: true }), {})
  );

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  const FilterContent = () => (
    <div className="space-y-lg">
      {/* Clear filters */}
      {getTotalSelectedCount() > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-medical-sm">
            {getTotalSelectedCount()} filters applied
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-auto p-1 text-muted-foreground hover:text-foreground touch-target"
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Filter groups */}
      {filters.map((filterGroup) => (
        <Card key={filterGroup.title} className="rounded-medical-md shadow-soft">
          <Collapsible
            open={openGroups[filterGroup.title]}
            onOpenChange={() => toggleGroup(filterGroup.title)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader 
                className="pb-sm cursor-pointer hover:bg-accent/50 transition-colors"
                role="button"
                aria-expanded={openGroups[filterGroup.title]}
                aria-controls={`filter-content-${filterGroup.title}`}
              >
                <CardTitle className="text-medical-base font-medium flex items-center justify-between">
                  {filterGroup.title}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openGroups[filterGroup.title] ? "transform rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent id={`filter-content-${filterGroup.title}`}>
              <CardContent className="pt-0 space-y-sm" role="group" aria-labelledby={`filter-title-${filterGroup.title}`}>
                {filterGroup.items.map((item) => (
                  <div key={item.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${filterGroup.title}-${item.value}`}
                      checked={selectedFilters[filterGroup.title]?.includes(item.value) || false}
                      onCheckedChange={(checked) =>
                        onFilterChange?.(filterGroup.title, item.value, !!checked)
                      }
                    />
                    <label
                      htmlFor={`${filterGroup.title}-${item.value}`}
                      className="text-medical-sm text-body cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      {item.count && (
                        <Badge variant="outline" className="text-medical-xs ml-2">
                          {item.count}
                        </Badge>
                      )}
                    </label>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside 
        className="hidden lg:block w-64 shrink-0"
        role="complementary"
        aria-label="Filter controls"
      >
        <div className="sticky top-24 space-y-lg">
          <h2 
            className="flex items-center gap-2 text-heading font-medium text-medical-lg"
            id="filters-heading"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filters
          </h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full mb-lg touch-target"
              aria-expanded="false"
              aria-haspopup="dialog"
              aria-label={`Open filters ${getTotalSelectedCount() > 0 ? `(${getTotalSelectedCount()} applied)` : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              Filters
              {getTotalSelectedCount() > 0 && (
                <Badge variant="secondary" className="ml-2" aria-hidden="true">
                  {getTotalSelectedCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-lg">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}