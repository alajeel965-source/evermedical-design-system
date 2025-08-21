import { useState, useEffect } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { StatPill } from "@/components/shared/StatPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProfileForm } from "@/components/shared/ProfileForm";
import { MapPin, Calendar, Download, Star, Award, Users, BookOpen, Settings, Edit, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CMEActivity {
  id: string;
  title: string;
  date: string;
  points: number;
  status: "completed" | "pending" | "expired";
  certificate?: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: "conference" | "workshop" | "webinar";
  cmePoints: number;
}

interface SavedProduct {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  image: string;
  price: string;
}

interface QuoteRequest {
  id: string;
  product: string;
  supplier: string;
  status: "pending" | "responded" | "closed";
  date: string;
  amount?: string;
}

export function ProfileMedicalPersonnel() {
  const [userProfile, setUserProfile] = useState({
    first_name: "Sarah",
    last_name: "Mitchell",
    username: "dr_sarah_mitchell",
    email: "sarah.mitchell@jhmi.edu",
    title: "Cardiologist",
    specialty: "Interventional Cardiology",
    subspecialty: "Cardiac Catheterization",
    organization: "Johns Hopkins Hospital",
    country: "US",
    location: "Baltimore, MD",
    profilePicture: "/placeholder.svg",
    verified: true,
    totalCME: 145,
    requiredCME: 200,
    eventsAttended: 12,
    subscriptionPlan: "Premium",
    memberSince: "2021"
  });

  const [showEditProfile, setShowEditProfile] = useState(false);

  const [cmeActivities] = useState<CMEActivity[]>([
    {
      id: "1",
      title: "Advanced Cardiac Catheterization Techniques",
      date: "2024-01-15",
      points: 15,
      status: "completed",
      certificate: "cert_001.pdf"
    },
    {
      id: "2", 
      title: "Interventional Cardiology Updates 2024",
      date: "2024-02-10",
      points: 20,
      status: "completed",
      certificate: "cert_002.pdf"
    },
    {
      id: "3",
      title: "Heart Failure Management Workshop",
      date: "2024-03-05",
      points: 10,
      status: "pending"
    }
  ]);

  const [upcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: "1",
      title: "ACC Scientific Sessions 2024",
      date: "2024-04-15",
      location: "Atlanta, GA",
      type: "conference",
      cmePoints: 25
    },
    {
      id: "2",
      title: "Structural Heart Interventions",
      date: "2024-05-20",
      location: "Online",
      type: "webinar",
      cmePoints: 8
    }
  ]);

  const [savedProducts] = useState<SavedProduct[]>([
    {
      id: "1",
      name: "Abbott TAVR System",
      manufacturer: "Abbott",
      category: "Cardiac Devices",
      image: "/placeholder.svg",
      price: "Contact for pricing"
    },
    {
      id: "2",
      name: "Medtronic Drug-Eluting Stent",
      manufacturer: "Medtronic",
      category: "Interventional Cardiology",
      image: "/placeholder.svg",
      price: "$1,200 - $1,800"
    }
  ]);

  const [quoteRequests] = useState<QuoteRequest[]>([
    {
      id: "1",
      product: "Cardiac Ultrasound Machine",
      supplier: "GE Healthcare",
      status: "responded",
      date: "2024-01-20",
      amount: "$45,000"
    },
    {
      id: "2",
      product: "ECG Monitoring System",
      supplier: "Philips Medical",
      status: "pending",
      date: "2024-02-01"
    }
  ]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "responded":
        return "default";
      case "pending":
        return "secondary";
      case "expired":
      case "closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "conference":
        return "bg-primary text-primary-foreground";
      case "workshop":
        return "bg-success text-success-foreground";
      case "webinar":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <PageLayout
      title="Medical Personnel Profile"
      subtitle="Manage your professional profile and CME activities"
      showFilters={false}
    >
      <div className="space-y-lg">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-sky/30 to-primary/10 border-border/50">
          <CardContent className="p-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-lg">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-medical">
                  <AvatarImage src={userProfile.profilePicture} alt={`${userProfile.first_name} ${userProfile.last_name}`} />
                  <AvatarFallback className="text-medical-lg font-semibold">
                    {userProfile.first_name[0]}{userProfile.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                {userProfile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                    <Award className="h-4 w-4 text-success-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md">
                  <div>
                    <h1 className="text-medical-3xl font-bold text-heading">
                      {userProfile.first_name} {userProfile.last_name}
                    </h1>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-medical-xl text-primary font-semibold">{userProfile.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        @{userProfile.username}
                      </Badge>
                    </div>
                    <p className="text-body">{userProfile.specialty}</p>
                    {userProfile.subspecialty && (
                      <p className="text-muted text-medical-sm">{userProfile.subspecialty}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3 text-muted" />
                      <span className="text-xs text-muted">Email protected</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-sm">
                    <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificates
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-md text-medical-sm text-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {userProfile.organization}, {userProfile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {userProfile.memberSince}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    @{userProfile.username}
                  </div>
                  <Badge variant="secondary">{userProfile.subscriptionPlan} Plan</Badge>
                  {userProfile.verified && <Badge className="bg-success text-success-foreground">Verified</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          <StatPill
            label="CME Points Earned"
            value={`${userProfile.totalCME}/${userProfile.requiredCME}`}
            trend="up"
          />
          <StatPill
            label="Events Attended"
            value={userProfile.eventsAttended}
            trend="up"
          />
          <StatPill
            label="Certificates"
            value={cmeActivities.filter(a => a.status === "completed").length}
            trend="neutral"
          />
          <StatPill
            label="Quote Requests"
            value={quoteRequests.length}
            trend="neutral"
          />
        </div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Edit Profile</h2>
                  <Button variant="ghost" onClick={() => setShowEditProfile(false)}>
                    ×
                  </Button>
                </div>
                <ProfileForm
                  profileType="medical_personnel"
                  initialData={userProfile}
                  onSave={(data) => {
                    setUserProfile(prev => ({ ...prev, ...data }));
                    setShowEditProfile(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="cme" className="space-y-lg">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="cme">CME Dashboard</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="products">Saved Products</TabsTrigger>
            <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
          </TabsList>

          {/* CME Dashboard */}
          <TabsContent value="cme" className="space-y-lg">
            <div className="grid gap-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    CME Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-md">
                    <div className="flex justify-between text-medical-sm">
                      <span>Progress to Annual Requirement</span>
                      <span>{userProfile.totalCME}/{userProfile.requiredCME} points</span>
                    </div>
                    <Progress value={(userProfile.totalCME / userProfile.requiredCME) * 100} className="h-3" />
                    <p className="text-medical-sm text-muted">
                      {userProfile.requiredCME - userProfile.totalCME} points remaining to meet annual requirement
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent CME Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-md">
                    {cmeActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-md bg-surface rounded-medical-sm border border-border"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-heading">{activity.title}</h4>
                          <div className="flex items-center gap-md text-medical-sm text-muted">
                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                            <span>{activity.points} CME points</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-sm">
                          <Badge variant={getStatusBadgeVariant(activity.status)}>
                            {activity.status}
                          </Badge>
                          {activity.certificate && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Upcoming Events */}
          <TabsContent value="events" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-md">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-md bg-surface rounded-medical-sm border border-border"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-heading">{event.title}</h4>
                          <div className="flex items-center gap-md text-medical-sm text-muted">
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            <span>{event.location}</span>
                            <span>{event.cmePoints} CME points</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-sm">
                          <Badge className={cn("text-xs", getEventTypeColor(event.type))}>
                            {event.type}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="h-6 w-6" />}
                    title="No upcoming events"
                    description="Browse medical events to find conferences, workshops, and webinars."
                    action={
                      <Button>
                        Browse Events
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Products */}
          <TabsContent value="products" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Saved Products & Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                {savedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
                    {savedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-md p-md bg-surface rounded-medical-sm border border-border"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-medical-sm bg-muted"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-heading">{product.name}</h4>
                          <p className="text-medical-sm text-muted">{product.manufacturer}</p>
                          <p className="text-medical-sm text-primary font-medium">{product.price}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Request Quote
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Star className="h-6 w-6" />}
                    title="No saved products"
                    description="Save products you're interested in to easily access them later."
                    action={
                      <Button>
                        Browse Marketplace
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Requests */}
          <TabsContent value="quotes" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Quote Requests History</CardTitle>
              </CardHeader>
              <CardContent>
                {quoteRequests.length > 0 ? (
                  <div className="space-y-md">
                    {quoteRequests.map((quote) => (
                      <div
                        key={quote.id}
                        className="flex items-center justify-between p-md bg-surface rounded-medical-sm border border-border"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-heading">{quote.product}</h4>
                          <div className="flex items-center gap-md text-medical-sm text-muted">
                            <span>{quote.supplier}</span>
                            <span>{new Date(quote.date).toLocaleDateString()}</span>
                            {quote.amount && <span className="text-primary font-medium">{quote.amount}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-sm">
                          <Badge variant={getStatusBadgeVariant(quote.status)}>
                            {quote.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Users className="h-6 w-6" />}
                    title="No quote requests"
                    description="Request quotes from suppliers for medical equipment and products."
                    action={
                      <Button>
                        Browse Products
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Subscription Section */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-sky/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Subscription & Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
              <div>
                <p className="font-semibold text-heading">{userProfile.subscriptionPlan} Plan</p>
                <p className="text-medical-sm text-muted">
                  Access to unlimited CME tracking, event recommendations, and priority support
                </p>
              </div>
              <div className="flex gap-sm">
                <Button variant="outline">Manage Subscription</Button>
                <Button>Upgrade Plan</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}