import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar, Download, Clock, MapPin, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { updatePageSEO } from "@/lib/seo";
import { useEffect } from "react";

interface PastEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  format: "in-person" | "virtual" | "hybrid";
  specialty: string;
  cmePoints: number;
  cmeHours: number;
  status: "completed" | "registered" | "attended";
  organizer: string;
  location?: string;
  certificate?: boolean;
  recurring?: boolean;
}

export default function PastEvents() {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - replace with actual API call
  const [pastEvents] = useState<PastEvent[]>([
    {
      id: "1",
      title: "Advanced Cardiac Surgery Symposium",
      startDate: "2024-01-15",
      endDate: "2024-01-17",
      format: "in-person",
      specialty: "Cardiology",
      cmePoints: 15,
      cmeHours: 12,
      status: "completed",
      organizer: "Cairo Heart Institute",
      location: "Cairo, Egypt",
      certificate: true,
      recurring: true
    },
    {
      id: "2",
      title: "Digital Health Innovation Webinar",
      startDate: "2024-02-10",
      endDate: "2024-02-10",
      format: "virtual",
      specialty: "Health Informatics",
      cmePoints: 3,
      cmeHours: 2,
      status: "attended",
      organizer: "MENA Digital Health",
      certificate: true
    }
  ]);

  useEffect(() => {
    updatePageSEO({
      title: "Past Medical Events - EverMedical",
      description: "View your attended medical conferences, CME courses, and professional development events with downloadable certificates.",
      keywords: ["past events", "medical conferences", "CME certificates", "medical education", "professional development"]
    });
  }, []);

  const filteredEvents = pastEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === "all" || event.format === formatFilter;
    const matchesSpecialty = specialtyFilter === "all" || event.specialty === specialtyFilter;
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    
    return matchesSearch && matchesFormat && matchesSpecialty && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      attended: "secondary",
      registered: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "virtual":
        return <Clock className="w-4 h-4" />;
      case "in-person":
        return <MapPin className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-heading text-3xl font-bold mb-2">Past Events</h1>
          <p className="text-body">View your attended medical conferences and professional development events</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search events or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Health Informatics">Health Informatics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        {filteredEvents.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Past Events ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>CME</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-heading">{event.title}</div>
                            <div className="text-sm text-body">{event.organizer}</div>
                            {event.location && (
                              <div className="text-sm text-muted-foreground">{event.location}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(event.startDate)}
                            {event.startDate !== event.endDate && (
                              <> - {formatDate(event.endDate)}</>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFormatIcon(event.format)}
                            <span className="capitalize">{event.format}</span>
                          </div>
                        </TableCell>
                        <TableCell>{event.specialty}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{event.cmePoints} points</div>
                            <div className="text-muted-foreground">{event.cmeHours} hours</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {event.certificate && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Certificate
                              </Button>
                            )}
                            {event.recurring && (
                              <Button variant="outline" size="sm">
                                Re-register
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<Calendar />}
            title="No past events found"
            description="You haven't attended any events yet. Browse upcoming events to start your professional development journey."
            action={
              <Button>
                Browse Upcoming Events
              </Button>
            }
          />
        )}
      </div>
    </AppShell>
  );
}