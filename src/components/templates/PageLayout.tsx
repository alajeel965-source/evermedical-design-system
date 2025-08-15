import { ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { SearchHeader } from "./SearchHeader";
import { FilterSidebar } from "./FilterSidebar";
import { ViewToggle } from "./ViewToggle";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  tabs?: Array<{ value: string; label: string }>;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    title: string;
    items: Array<{ value: string; label: string; count?: number }>;
  }>;
  selectedFilters?: Record<string, string[]>;
  onFilterChange?: (groupTitle: string, value: string, checked: boolean) => void;
  onClearFilters?: () => void;
  showFilters?: boolean;
  view?: "grid" | "table";
  onViewChange?: (view: "grid" | "table") => void;
  locationFilter?: ReactNode;
}

export function PageLayout({
  children,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  showFilters = true,
  view = "grid",
  onViewChange,
  locationFilter,
}: PageLayoutProps) {
  return (
    <AppShell>
      <div className="min-h-screen bg-surface">
        <SearchHeader
          title={title}
          subtitle={subtitle}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          view={view}
          onViewChange={onViewChange}
          showViewToggle={true}
        />
        
        <div className="site-container py-lg">
          <div className="flex gap-lg">
            {showFilters && (
              <aside className="hidden lg:block w-64 shrink-0" role="complementary" aria-label="Filter controls">
                <div className="sticky top-24 space-y-lg">
                  {locationFilter}
                  {filters && (
                    <FilterSidebar 
                      filters={filters}
                      selectedFilters={selectedFilters}
                      onFilterChange={onFilterChange}
                      onClearFilters={onClearFilters}
                    />
                  )}
                </div>
              </aside>
            )}
            
            <main className={`flex-1 min-w-0 ${showFilters ? 'lg:max-w-[calc(100%-280px)]' : ''}`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </AppShell>
  );
}