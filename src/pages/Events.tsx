import { useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { EventCard } from "@/components/templates/cards/EventCard";
import { LocationFilter } from "@/components/shared/LocationFilter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Grid3X3, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Events() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [calendarView, setCalendarView] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const handleFilterChange = (groupTitle: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [groupTitle]: checked
        ? [...(prev[groupTitle] || []), value]
        : (prev[groupTitle] || []).filter(f => f !== value)
    }));
  };

  const tabs = [
    { value: "upcoming", label: "Upcoming" },
    { value: "virtual", label: "Virtual" },
    { value: "in-person", label: "In-Person" },
    { value: "cme", label: "CME Eligible" },
  ];

  // Add location filter to the filters array
  const filters = [
    // Location filter will be handled separately
    {
      title: "Specialty",
      items: [
        { value: "cardiology", label: "Cardiology", count: 15 },
        { value: "neurology", label: "Neurology", count: 9 },
        { value: "oncology", label: "Oncology", count: 23 },
        { value: "surgery", label: "Surgery", count: 18 },
        { value: "pediatrics", label: "Pediatrics", count: 12 },
        { value: "radiology", label: "Radiology", count: 14 },
      ],
    },
    {
      title: "Subspecialty",
      items: [
        { value: "interventional", label: "Interventional", count: 8 },
        { value: "emergency", label: "Emergency Medicine", count: 11 },
        { value: "critical-care", label: "Critical Care", count: 6 },
        { value: "anesthesiology", label: "Anesthesiology", count: 9 },
        { value: "pathology", label: "Pathology", count: 5 },
      ],
    },
    {
      title: "Date Range",
      items: [
        { value: "this-week", label: "This Week", count: 8 },
        { value: "this-month", label: "This Month", count: 23 },
        { value: "next-month", label: "Next Month", count: 31 },
        { value: "this-quarter", label: "This Quarter", count: 67 },
      ],
    },
    {
      title: "Format",
      items: [
        { value: "in-person", label: "In-Person", count: 28 },
        { value: "virtual", label: "Virtual", count: 34 },
        { value: "hybrid", label: "Hybrid", count: 12 },
      ],
    },
    {
      title: "CME Credits",
      items: [
        { value: "1-3", label: "1-3 Credits", count: 19 },
        { value: "4-6", label: "4-6 Credits", count: 28 },
        { value: "7-10", label: "7-10 Credits", count: 15 },
        { value: "10+", label: "10+ Credits", count: 8 },
      ],
    },
  ];

  const events = [
    {
      id: "1",
      title: "International Cardiology Conference 2024",
      date: "March 15, 2024",
      time: "9:00 AM - 5:00 PM",
      location: "Chicago Convention Center",
      isVirtual: false,
      attendeeCount: 850,
      maxAttendees: 1000,
      cmeCredits: 8,
      category: "Cardiology",
      registrationDeadline: "March 10, 2024",
    },
    {
      id: "2",
      title: "AI in Medical Imaging Webinar",
      date: "March 22, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "Online",
      isVirtual: true,
      attendeeCount: 234,
      maxAttendees: 500,
      cmeCredits: 2,
      category: "Radiology",
      registrationDeadline: "March 20, 2024",
    },
    {
      id: "3",
      title: "Surgical Robotics Workshop",
      date: "April 5, 2024",
      time: "10:00 AM - 6:00 PM",
      location: "Johns Hopkins Hospital",
      isVirtual: false,
      attendeeCount: 48,
      maxAttendees: 50,
      cmeCredits: 6,
      category: "Surgery",
      registrationDeadline: "April 1, 2024",
    },
  ];

  // Get filtered events based on location selection
  const filteredEvents = events.filter(event => {
    if (selectedLocations.length === 0) return true;
    
    // Simple location matching - in real app, this would be more sophisticated
    const eventLocation = event.location.toLowerCase();
    return selectedLocations.some(location => {
      const locationLabel = location.replace('-', ' ').toLowerCase();
      return eventLocation.includes(locationLabel) || 
             eventLocation.includes(location.toLowerCase());
    });
  });

  return (
    <PageLayout
      title="Medical Events"
      subtitle="Connect with medical professionals at conferences, webinars, and networking events"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Search events, speakers, or topics..."
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filters={filters}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      view={view}
      onViewChange={setView}
      locationFilter={
        <LocationFilter
          selectedLocations={selectedLocations}
          onLocationChange={setSelectedLocations}
        />
      }
    >
      <div className="space-y-lg">
        {/* Mobile filter button - include location filter */}
        <div className="lg:hidden space-y-md">
          <LocationFilter
            selectedLocations={selectedLocations}
            onLocationChange={setSelectedLocations}
          />
        </div>

        {/* Applied filters summary */}
        {(selectedLocations.length > 0 || Object.values(selectedFilters).some(arr => arr.length > 0)) && (
          <div className="flex flex-wrap items-center gap-sm p-md bg-surface rounded-medical-md border border-border">
            <span className="text-medical-sm font-medium text-muted-foreground">Applied filters:</span>
            
            {/* Location filters */}
            {selectedLocations.map((location) => (
              <Badge
                key={location}
                variant="secondary"
                className="flex items-center gap-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                onClick={() => setSelectedLocations(prev => prev.filter(l => l !== location))}
              >
                <MapPin className="w-3 h-3" />
                {location.replace('-', ' ')}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            
            {/* Other filters */}
            {Object.entries(selectedFilters).map(([group, values]) =>
              values.map((value) => (
                <Badge
                  key={`${group}-${value}`}
                  variant="secondary"
                  className="flex items-center gap-xs hover:bg-destructive/20 transition-colors cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...selectedFilters };
                    newFilters[group] = newFilters[group].filter(v => v !== value);
                    setSelectedFilters(newFilters);
                  }}
                >
                  {value}
                  <X className="w-3 h-3" />
                </Badge>
              ))
            )}
            
            {/* Clear all button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFilters({});
                setSelectedLocations([]);
              }}
              className="h-auto p-1 text-muted-foreground hover:text-destructive text-medical-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="text-medical-sm text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events
        </div>
        {/* Calendar view toggle */}
        <div className="flex justify-end">
          <div className="flex rounded-medical-sm border border-border bg-card p-1">
            <Button
              variant={!calendarView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCalendarView(false)}
              className="px-3 py-1.5 h-auto"
            >
              <Grid3X3 className="h-4 w-4 mr-1.5" />
              Grid
            </Button>
            <Button
              variant={calendarView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCalendarView(true)}
              className="px-3 py-1.5 h-auto"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Calendar
            </Button>
          </div>
        </div>
        
        {calendarView ? (
          <div className="bg-card rounded-medical-lg p-lg border border-border">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-medical-lg font-medium mb-2">Calendar View</h3>
              <p className="text-medical-sm">Calendar integration coming soon</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="space-y-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>CME Credits</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.isVirtual ? "Virtual" : event.location}</TableCell>
                    <TableCell>{event.category}</TableCell>
                    <TableCell>{event.cmeCredits}</TableCell>
                    <TableCell>
                      {event.attendeeCount >= event.maxAttendees ? "Full" : "Open"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}