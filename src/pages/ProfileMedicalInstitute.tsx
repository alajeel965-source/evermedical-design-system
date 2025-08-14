import { useState, useEffect } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatPill } from "@/components/shared/StatPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { MapPin, Users, Plus, Building, CheckCircle, Clock, XCircle, Star, Settings, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: "active" | "pending" | "inactive";
  joinedDate: string;
}

interface RFQ {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: "open" | "closed" | "awarded";
  postedDate: string;
  responses: number;
  deadline: string;
}

interface SavedSupplier {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  logo: string;
  verified: boolean;
}

export function ProfileMedicalInstitute() {
  const [institutionProfile, setInstitutionProfile] = useState({
    name: "Johns Hopkins Hospital",
    sector: "Academic Medical Center",
    location: "Baltimore, Maryland, USA",
    logo: "/placeholder.svg",
    verified: true,
    establishedYear: "1889",
    employees: "50,000+",
    subscriptionPlan: "Free Tier",
    contactEmail: "procurement@jhmi.edu",
    contactPhone: "+1 (410) 955-5000",
    website: "www.hopkinsmedicine.org"
  });

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Dr. Michael Chen",
      role: "Chief Procurement Officer",
      email: "mchen@jhmi.edu",
      avatar: "/placeholder.svg",
      status: "active",
      joinedDate: "2023-01-15"
    },
    {
      id: "2",
      name: "Sarah Williams",
      role: "Senior Buyer - Medical Equipment",
      email: "swilliams@jhmi.edu", 
      avatar: "/placeholder.svg",
      status: "active",
      joinedDate: "2023-03-20"
    },
    {
      id: "3",
      name: "James Rodriguez",
      role: "Contract Manager",
      email: "jrodriguez@jhmi.edu",
      avatar: "/placeholder.svg",
      status: "pending",
      joinedDate: "2024-01-10"
    }
  ]);

  const [rfqs] = useState<RFQ[]>([
    {
      id: "1",
      title: "MRI Scanner Procurement - 3T Systems",
      category: "Diagnostic Imaging",
      budget: "$2,500,000 - $3,000,000",
      status: "open",
      postedDate: "2024-02-01",
      responses: 12,
      deadline: "2024-03-15"
    },
    {
      id: "2",
      title: "Surgical Instruments - Minimally Invasive Surgery",
      category: "Surgical Equipment",
      budget: "$150,000 - $200,000",
      status: "open",
      postedDate: "2024-01-20",
      responses: 8,
      deadline: "2024-02-28"
    },
    {
      id: "3",
      title: "Patient Monitoring Systems - ICU",
      category: "Patient Monitoring",
      budget: "$800,000 - $1,200,000",
      status: "awarded",
      postedDate: "2023-11-15",
      responses: 15,
      deadline: "2023-12-30"
    }
  ]);

  const [savedSuppliers] = useState<SavedSupplier[]>([
    {
      id: "1",
      name: "Siemens Healthineers",
      category: "Medical Imaging",
      location: "Germany",
      rating: 4.8,
      logo: "/placeholder.svg",
      verified: true
    },
    {
      id: "2",
      name: "Medtronic Inc.",
      category: "Medical Devices",
      location: "USA",
      rating: 4.7,
      logo: "/placeholder.svg",
      verified: true
    },
    {
      id: "3",
      name: "Philips Healthcare",
      category: "Healthcare Technology",
      location: "Netherlands",
      rating: 4.6,
      logo: "/placeholder.svg",
      verified: true
    }
  ]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
      case "closed":
        return "destructive";
      case "awarded":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "inactive":
      case "closed":
        return <XCircle className="h-4 w-4" />;
      case "awarded":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRFQStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-success text-success-foreground";
      case "closed":
        return "bg-destructive text-destructive-foreground";
      case "awarded":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <PageLayout
      title="Medical Institute Profile"
      subtitle="Manage your institution's procurement activities and team"
      showFilters={false}
    >
      <div className="space-y-lg">
        {/* Institution Header */}
        <Card className="bg-gradient-to-r from-sky/30 to-primary/10 border-border/50">
          <CardContent className="p-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-lg">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-medical">
                  <AvatarImage src={institutionProfile.logo} alt={institutionProfile.name} />
                  <AvatarFallback className="text-medical-lg font-semibold">
                    {institutionProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {institutionProfile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                    <CheckCircle className="h-4 w-4 text-success-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md">
                  <div>
                    <h1 className="text-medical-3xl font-bold text-heading">{institutionProfile.name}</h1>
                    <p className="text-medical-xl text-primary font-semibold">{institutionProfile.sector}</p>
                    <p className="text-body">Est. {institutionProfile.establishedYear}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-sm">
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Team
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Post New RFQ
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-md text-medical-sm text-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {institutionProfile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {institutionProfile.employees} employees
                  </div>
                  <Badge variant="secondary">{institutionProfile.subscriptionPlan}</Badge>
                  {institutionProfile.verified && <Badge className="bg-success text-success-foreground">Verified Institution</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          <StatPill
            label="Active RFQs"
            value={rfqs.filter(r => r.status === "open").length}
            trend="up"
          />
          <StatPill
            label="Team Members"
            value={teamMembers.filter(m => m.status === "active").length}
            trend="neutral"
          />
          <StatPill
            label="Total RFQs"
            value={rfqs.length}
            trend="up"
          />
          <StatPill
            label="Saved Suppliers"
            value={savedSuppliers.length}
            trend="neutral"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="rfqs" className="space-y-lg">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="rfqs">RFQs</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* RFQs Management */}
          <TabsContent value="rfqs" className="space-y-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-medical-lg font-semibold text-heading">Request for Quotations</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post New RFQ
              </Button>
            </div>
            
            <div className="space-y-md">
              {rfqs.map((rfq) => (
                <Card key={rfq.id} className="hover:shadow-medical transition-shadow">
                  <CardContent className="p-lg">
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex-1">
                        <div className="flex items-start gap-md mb-sm">
                          <h4 className="font-semibold text-heading text-medical-lg">{rfq.title}</h4>
                          <Badge className={cn("text-xs", getRFQStatusColor(rfq.status))}>
                            {rfq.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md text-medical-sm">
                          <div>
                            <span className="text-muted">Category:</span>
                            <p className="font-medium text-body">{rfq.category}</p>
                          </div>
                          <div>
                            <span className="text-muted">Budget:</span>
                            <p className="font-medium text-primary">{rfq.budget}</p>
                          </div>
                          <div>
                            <span className="text-muted">Responses:</span>
                            <p className="font-medium text-body">{rfq.responses}</p>
                          </div>
                          <div>
                            <span className="text-muted">Deadline:</span>
                            <p className="font-medium text-body">{new Date(rfq.deadline).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <p className="text-medical-sm text-muted mt-sm">
                          Posted on {new Date(rfq.postedDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-sm">
                        <Button variant="outline" size="sm">View Details</Button>
                        {rfq.status === "open" && (
                          <Button variant="outline" size="sm">Manage</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Team Management */}
          <TabsContent value="team" className="space-y-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-medical-lg font-semibold text-heading">Team Members</h3>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>
            
            <div className="grid gap-md">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-md">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-semibold text-heading">{member.name}</h4>
                          <p className="text-medical-sm text-primary">{member.role}</p>
                          <p className="text-medical-sm text-muted">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-sm">
                        <Badge 
                          variant={getStatusBadgeVariant(member.status)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(member.status)}
                          {member.status}
                        </Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="mt-sm pt-sm border-t border-border">
                      <p className="text-medical-sm text-muted">
                        Joined on {new Date(member.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Saved Suppliers */}
          <TabsContent value="suppliers" className="space-y-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-medical-lg font-semibold text-heading">Saved Suppliers</h3>
              <Button variant="outline">
                Browse All Suppliers
              </Button>
            </div>
            
            {savedSuppliers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
                {savedSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-medical transition-shadow">
                    <CardContent className="p-lg">
                      <div className="flex items-start gap-md">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={supplier.logo} alt={supplier.name} />
                          <AvatarFallback>
                            {supplier.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-heading">{supplier.name}</h4>
                              <p className="text-medical-sm text-muted">{supplier.category}</p>
                              <p className="text-medical-sm text-muted">{supplier.location}</p>
                            </div>
                            {supplier.verified && (
                              <Badge className="bg-success text-success-foreground">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span className="text-medical-sm font-medium">{supplier.rating}</span>
                            </div>
                            <div className="flex gap-sm">
                              <Button variant="outline" size="sm">View Profile</Button>
                              <Button size="sm">Contact</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Building className="h-6 w-6" />}
                title="No saved suppliers"
                description="Save suppliers you frequently work with for quick access."
                action={
                  <Button>
                    Browse Suppliers
                  </Button>
                }
              />
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Institution Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Institution Name</label>
                    <p className="text-body">{institutionProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Sector</label>
                    <p className="text-body">{institutionProfile.sector}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Contact Email</label>
                    <p className="text-body">{institutionProfile.contactEmail}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Phone</label>
                    <p className="text-body">{institutionProfile.contactPhone}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Website</label>
                    <p className="text-primary">{institutionProfile.website}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Location</label>
                    <p className="text-body">{institutionProfile.location}</p>
                  </div>
                </div>
                <Button variant="outline">Edit Information</Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-sky/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
                  <div>
                    <p className="font-semibold text-heading">{institutionProfile.subscriptionPlan}</p>
                    <p className="text-medical-sm text-muted">
                      Basic access to RFQ posting and supplier directory
                    </p>
                  </div>
                  <Button>Upgrade to Premium</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}