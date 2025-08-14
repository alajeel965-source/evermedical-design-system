import React, { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Users, 
  Award,
  Clock,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Filter,
  Search
} from "lucide-react";
import { useI18n, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const AIAgentReview = () => {
  const { isRTL } = useI18n();
  const { t } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const pendingEvents = [
    {
      id: "1",
      title: "2025 International Conference on Emergency Medicine",
      organizer: "International Association of Emergency Medicine",
      startDate: "2025-06-15T09:00:00Z",
      endDate: "2025-06-18T17:00:00Z",
      location: "Dubai, UAE",
      venue: "Dubai World Trade Centre",
      format: "hybrid",
      specialty: "Emergency Medicine",
      subspecialties: ["Pediatric Emergency", "Trauma Care"],
      cme: { hasCME: true, provider: "IAEM", hours: 24 },
      confidence: 0.92,
      sourceUrl: "https://www.iaem.org/conferences/2025",
      extractedAt: "2025-01-14T10:30:00Z",
      flags: ["high-confidence", "verified-organizer"],
      description: "The premier global gathering of emergency medicine professionals featuring cutting-edge research, clinical case studies, and hands-on workshops.",
      registrationUrl: "https://www.iaem.org/conferences/2025/register",
      pricing: { range: "$800-1200", currency: "USD", isFree: false }
    },
    {
      id: "2", 
      title: "Advanced Cardiac Imaging Symposium",
      organizer: "European Society of Cardiology",
      startDate: "2025-05-20T08:00:00Z",
      endDate: "2025-05-22T18:00:00Z",
      location: "Barcelona, Spain",
      venue: "Palau de la Música Catalana",
      format: "in-person",
      specialty: "Cardiology",
      subspecialties: ["Cardiac Imaging", "Interventional Cardiology"],
      cme: { hasCME: true, provider: "ESC", hours: 18 },
      confidence: 0.87,
      sourceUrl: "https://www.escardio.org/events/2025/imaging",
      extractedAt: "2025-01-14T08:15:00Z",
      flags: ["missing-pricing", "needs-verification"],
      description: "Latest advances in cardiac imaging techniques including CT, MRI, and echocardiography with hands-on training sessions.",
      registrationUrl: "https://www.escardio.org/events/2025/imaging/register",
      pricing: { range: "Contact for pricing", currency: "EUR", isFree: false }
    },
    {
      id: "3",
      title: "Free Webinar: AI in Medical Diagnosis",
      organizer: "Medical AI Research Group",
      startDate: "2025-02-15T14:00:00Z",
      endDate: "2025-02-15T16:00:00Z",
      location: "Online",
      venue: "Virtual Platform",
      format: "virtual",
      specialty: "General Medicine",
      subspecialties: ["Artificial Intelligence", "Diagnostics"],
      cme: { hasCME: false, provider: null, hours: 0 },
      confidence: 0.65,
      sourceUrl: "https://medicalai.org/webinars/diagnosis-ai",
      extractedAt: "2025-01-14T12:45:00Z",
      flags: ["low-confidence", "unverified-cme", "potential-duplicate"],
      description: "Explore how artificial intelligence is revolutionizing medical diagnosis and improving patient outcomes.",
      registrationUrl: "https://medicalai.org/webinars/diagnosis-ai/register",
      pricing: { range: "Free", currency: "USD", isFree: true }
    }
  ];

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge className="bg-success/10 text-success border-success">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge className="bg-warning/10 text-warning border-warning">Medium</Badge>;
    } else {
      return <Badge className="bg-destructive/10 text-destructive border-destructive">Low</Badge>;
    }
  };

  const getFormatBadge = (format: string) => {
    switch (format) {
      case "in-person":
        return <Badge variant="outline" className="text-primary border-primary">In-Person</Badge>;
      case "virtual":
        return <Badge variant="outline" className="text-success border-success">Virtual</Badge>;
      case "hybrid":
        return <Badge variant="outline" className="text-warning border-warning">Hybrid</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApprove = (eventId: string) => {
    console.log("Approving event:", eventId);
    // Handle approval logic
  };

  const handleReject = (eventId: string) => {
    console.log("Rejecting event:", eventId);
    // Handle rejection logic
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setShowEditDialog(true);
  };

  const EditEventDialog = () => (
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event Details</DialogTitle>
        </DialogHeader>
        {selectedEvent && (
          <div className="space-y-lg">
            <div className="grid grid-cols-2 gap-lg">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  defaultValue={selectedEvent.title}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-organizer">Organizer</Label>
                <Input 
                  id="edit-organizer" 
                  defaultValue={selectedEvent.organizer}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                defaultValue={selectedEvent.description}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-lg">
              <div className="space-y-2">
                <Label htmlFor="edit-specialty">Primary Specialty</Label>
                <Select defaultValue={selectedEvent.specialty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-format">Format</Label>
                <Select defaultValue={selectedEvent.format}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  defaultValue={selectedEvent.location}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-lg">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input 
                  id="edit-start-date" 
                  type="datetime-local"
                  defaultValue={selectedEvent.startDate.slice(0, 16)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input 
                  id="edit-end-date" 
                  type="datetime-local"
                  defaultValue={selectedEvent.endDate.slice(0, 16)}
                />
              </div>
            </div>

            <div className={cn(
              "flex justify-end space-x-sm",
              isRTL && "flex-row-reverse space-x-reverse"
            )}>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button variant="outline" className="text-destructive">
                Reject
              </Button>
              <Button onClick={() => {
                setShowEditDialog(false);
                handleApprove(selectedEvent.id);
              }}>
                Save & Approve
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell>
      <div className="space-y-lg">
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("space-y-sm", isRTL && "text-right")}>
            <div className={cn(
              "flex items-center space-x-sm text-muted text-medical-sm",
              isRTL && "flex-row-reverse space-x-reverse"
            )}>
              <Link to="/ai-agent" className="hover:text-primary transition-colors">
                AI Agent
              </Link>
              <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
              <span>Review Queue</span>
            </div>
            <h1 className="text-heading text-medical-4xl font-bold">
              Review Queue
            </h1>
            <p className="text-body text-medical-lg max-w-2xl">
              Review and approve AI-discovered events before publishing. Verify details, edit information, and ensure quality standards.
            </p>
          </div>
          
          <div className={cn(
            "flex items-center space-x-md",
            isRTL && "space-x-reverse"
          )}>
            <Button variant="outline" size="sm">
              <ArrowLeft className={cn("w-4 h-4", isRTL ? "ml-2 rotate-180" : "mr-2")} />
              Back
            </Button>
            <Button variant="outline" size="sm">
              <Filter className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              Filter
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div className="space-y-2">
                <Label>Search Events</Label>
                <div className="relative">
                  <Search className={cn(
                    "absolute top-3 h-4 w-4 text-muted",
                    isRTL ? "right-3" : "left-3"
                  )} />
                  <Input 
                    placeholder="Search by title, organizer..."
                    className={isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="emergency">Emergency Medicine</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="general">General Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Confidence</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All confidence levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High (90%+)</SelectItem>
                    <SelectItem value="medium">Medium (70-89%)</SelectItem>
                    <SelectItem value="low">Low (&lt;70%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All formats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">Pending Review</p>
                <p className="text-heading text-medical-3xl font-bold">{pendingEvents.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">High Confidence</p>
                <p className="text-heading text-medical-3xl font-bold">
                  {pendingEvents.filter(e => e.confidence >= 0.9).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">Need Attention</p>
                <p className="text-heading text-medical-3xl font-bold">
                  {pendingEvents.filter(e => e.flags.some(f => f.includes('verification') || f.includes('low-confidence'))).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">With CME</p>
                <p className="text-heading text-medical-3xl font-bold">
                  {pendingEvents.filter(e => e.cme.hasCME).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Events */}
        <div className="space-y-md">
          {pendingEvents.map((event) => (
            <Card key={event.id} className="bg-card border-border">
              <CardContent className="p-lg">
                <div className={cn(
                  "flex items-start justify-between",
                  isRTL && "flex-row-reverse"
                )}>
                  <div className={cn("flex-1 space-y-md", isRTL && "text-right")}>
                    {/* Header */}
                    <div className={cn(
                      "flex items-start justify-between",
                      isRTL && "flex-row-reverse"
                    )}>
                      <div className="space-y-sm">
                        <h3 className="text-heading text-medical-xl font-semibold">
                          {event.title}
                        </h3>
                        <p className="text-muted text-medical-sm">
                          by {event.organizer}
                        </p>
                      </div>
                      <div className={cn(
                        "flex items-center space-x-sm",
                        isRTL && "space-x-reverse"
                      )}>
                        {getConfidenceBadge(event.confidence)}
                        <Badge variant="outline" className="text-primary border-primary">
                          {event.specialty}
                        </Badge>
                        {getFormatBadge(event.format)}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <div className={cn(
                          "flex items-center space-x-1 text-muted text-medical-xs",
                          isRTL && "flex-row-reverse space-x-reverse"
                        )}>
                          <Calendar className="w-3 h-3" />
                          <span>Date</span>
                        </div>
                        <p className="text-body text-medical-sm">
                          {formatDate(event.startDate)}
                        </p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <div className={cn(
                          "flex items-center space-x-1 text-muted text-medical-xs",
                          isRTL && "flex-row-reverse space-x-reverse"
                        )}>
                          <MapPin className="w-3 h-3" />
                          <span>Location</span>
                        </div>
                        <p className="text-body text-medical-sm">
                          {event.location}
                        </p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <div className={cn(
                          "flex items-center space-x-1 text-muted text-medical-xs",
                          isRTL && "flex-row-reverse space-x-reverse"
                        )}>
                          <Award className="w-3 h-3" />
                          <span>CME</span>
                        </div>
                        <p className="text-body text-medical-sm">
                          {event.cme.hasCME ? `${event.cme.hours}h` : "None"}
                        </p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <div className={cn(
                          "flex items-center space-x-1 text-muted text-medical-xs",
                          isRTL && "flex-row-reverse space-x-reverse"
                        )}>
                          <Users className="w-3 h-3" />
                          <span>Pricing</span>
                        </div>
                        <p className="text-body text-medical-sm">
                          {event.pricing.range}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-body text-medical-sm line-clamp-2">
                      {event.description}
                    </p>

                    {/* Flags */}
                    {event.flags.length > 0 && (
                      <div className={cn(
                        "flex items-center space-x-sm",
                        isRTL && "flex-row-reverse space-x-reverse"
                      )}>
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <div className={cn(
                          "flex flex-wrap gap-1",
                          isRTL && "flex-row-reverse"
                        )}>
                          {event.flags.map((flag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {flag.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source */}
                    <div className={cn(
                      "flex items-center space-x-sm text-muted text-medical-xs",
                      isRTL && "flex-row-reverse space-x-reverse"
                    )}>
                      <ExternalLink className="w-3 h-3" />
                      <span>Source:</span>
                      <a 
                        href={event.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {event.sourceUrl}
                      </a>
                      <span>•</span>
                      <span>Extracted {formatDate(event.extractedAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={cn(
                    "flex flex-col space-y-sm ml-lg",
                    isRTL && "mr-lg ml-0"
                  )}>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(event.id)}
                      className="bg-success hover:bg-success/90 text-success-foreground"
                    >
                      <CheckCircle className={cn("w-4 h-4", isRTL ? "ml-1" : "mr-1")} />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className={cn("w-4 h-4", isRTL ? "ml-1" : "mr-1")} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(event.id)}
                      className="text-destructive border-destructive hover:bg-destructive/10"
                    >
                      <XCircle className={cn("w-4 h-4", isRTL ? "ml-1" : "mr-1")} />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <EditEventDialog />
      </div>
    </AppShell>
  );
};

export default AIAgentReview;