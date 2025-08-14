import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewToggle } from "./ViewToggle";

interface SearchHeaderProps {
  title: string;
  subtitle?: string;
  tabs?: Array<{ value: string; label: string }>;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  view?: "grid" | "table";
  onViewChange?: (view: "grid" | "table") => void;
  showViewToggle?: boolean;
}

export function SearchHeader({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  view = "grid",
  onViewChange,
  showViewToggle = true,
}: SearchHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-lg py-xl">
        <div className="space-y-lg">
          {/* Title and subtitle */}
          <div className="text-center lg:text-left">
            <h1 className="text-heading font-bold text-medical-4xl">{title}</h1>
            {subtitle && (
              <p className="text-body text-medical-lg mt-sm max-w-2xl mx-auto lg:mx-0">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-none lg:inline-flex">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          
          {/* Search and controls */}
          <div className="flex flex-col lg:flex-row gap-md items-stretch lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                aria-hidden="true"
              />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 rounded-medical-sm"
                aria-label={searchPlaceholder}
                role="searchbox"
                autoComplete="off"
              />
            </div>
            
            {showViewToggle && onViewChange && (
              <ViewToggle view={view} onViewChange={onViewChange} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}