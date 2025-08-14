import { useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { EventCard } from "@/components/templates/cards/EventCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Events() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

  const tabs = [
    { value: "upcoming", label: "Upcoming" },
    { value: "virtual", label: "Virtual" },
    { value: "in-person", label: "In-Person" },
    { value: "cme", label: "CME Eligible" },
  ];

  const filters = [
    {
      title: "Event Type",
      items: [
        { value: "conference", label: "Conference", count: 12 },
        { value: "webinar", label: "Webinar", count: 34 },
        { value: "workshop", label: "Workshop", count: 18 },
        { value: "symposium", label: "Symposium", count: 8 },
      ],
    },
    {
      title: "Specialty",
      items: [
        { value: "cardiology", label: "Cardiology", count: 15 },
        { value: "neurology", label: "Neurology", count: 9 },
        { value: "oncology", label: "Oncology", count: 23 },
        { value: "surgery", label: "Surgery", count: 18 },
      ],
    },
    {
      title: "CME Credits",
      items: [
        { value: "1-5", label: "1-5 Credits", count: 28 },
        { value: "6-10", label: "6-10 Credits", count: 19 },
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
      view={view}
      onViewChange={setView}
    >
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {events.map((event) => (
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
              {events.map((event) => (
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
    </PageLayout>
  );
}