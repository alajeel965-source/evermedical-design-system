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
import { MapPin, Package, Plus, TrendingUp, MessageCircle, Settings, Edit, BarChart3, Eye, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  status: "active" | "draft" | "out_of_stock";
  image: string;
  views: number;
  inquiries: number;
  lastUpdated: string;
}

interface Lead {
  id: string;
  company: string;
  contact: string;
  product: string;
  value: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  date: string;
  notes?: string;
}

interface ChatMessage {
  id: string;
  buyer: string;
  company: string;
  product: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
}

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
}

export function ProfileMedicalSeller() {
  const [companyProfile, setCompanyProfile] = useState({
    name: "MedTech Solutions Inc.",
    industry: "Medical Device Manufacturing",
    location: "Frankfurt, Germany",
    logo: "/placeholder.svg",
    verified: true,
    establishedYear: "2008",
    employees: "500-1000",
    subscriptionPlan: "Annual Premium",
    website: "www.medtechsolutions.com",
    description: "Leading manufacturer of innovative medical devices and diagnostic equipment for healthcare providers worldwide."
  });

  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Advanced Cardiac Monitor",
      category: "Patient Monitoring",
      price: "$15,000 - $25,000",
      status: "active",
      image: "/placeholder.svg",
      views: 2456,
      inquiries: 23,
      lastUpdated: "2024-02-01"
    },
    {
      id: "2",
      name: "Digital X-Ray System",
      category: "Diagnostic Imaging",
      price: "$120,000 - $180,000",
      status: "active",
      image: "/placeholder.svg",
      views: 1832,
      inquiries: 15,
      lastUpdated: "2024-01-28"
    },
    {
      id: "3",
      name: "Surgical Robot Assistant",
      category: "Surgical Equipment",
      price: "Contact for pricing",
      status: "draft",
      image: "/placeholder.svg",
      views: 0,
      inquiries: 0,
      lastUpdated: "2024-02-05"
    }
  ]);

  const [leads] = useState<Lead[]>([
    {
      id: "1",
      company: "Johns Hopkins Hospital",
      contact: "Dr. Sarah Mitchell",
      product: "Advanced Cardiac Monitor",
      value: "$250,000",
      status: "proposal",
      date: "2024-01-15",
      notes: "Interested in bulk purchase for ICU upgrade"
    },
    {
      id: "2",
      company: "Mayo Clinic",
      contact: "Michael Chen",
      product: "Digital X-Ray System",
      value: "$540,000",
      status: "qualified",
      date: "2024-01-20",
      notes: "Evaluating for multi-site deployment"
    },
    {
      id: "3",
      company: "Cleveland Clinic",
      contact: "Dr. Lisa Park",
      product: "Advanced Cardiac Monitor",
      value: "$180,000",
      status: "won",
      date: "2023-12-10"
    }
  ]);

  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      buyer: "Dr. Sarah Mitchell",
      company: "Johns Hopkins Hospital",
      product: "Advanced Cardiac Monitor",
      lastMessage: "Can you provide technical specifications for the wireless connectivity options?",
      timestamp: "2024-02-05T14:30:00Z",
      unread: 2,
      avatar: "/placeholder.svg"
    },
    {
      id: "2",
      buyer: "Michael Chen",
      company: "Mayo Clinic",
      product: "Digital X-Ray System",
      lastMessage: "Thank you for the detailed proposal. We'll review and get back to you.",
      timestamp: "2024-02-04T09:15:00Z",
      unread: 0,
      avatar: "/placeholder.svg"
    }
  ]);

  const [performanceMetrics] = useState<PerformanceMetric[]>([
    { label: "Monthly Views", value: 8760, change: 15.2, trend: "up" },
    { label: "Inquiries", value: 89, change: 8.5, trend: "up" },
    { label: "Conversion Rate", value: 12.5, change: -2.1, trend: "down" },
    { label: "Revenue (Monthly)", value: 245000, change: 22.8, trend: "up" }
  ]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
      case "won":
        return "default";
      case "draft":
      case "new":
      case "contacted":
        return "secondary";
      case "out_of_stock":
      case "lost":
        return "destructive";
      case "qualified":
      case "proposal":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "draft":
        return "bg-warning text-warning-foreground";
      case "out_of_stock":
        return "bg-destructive text-destructive-foreground";
      case "new":
        return "bg-primary text-primary-foreground";
      case "contacted":
        return "bg-secondary text-secondary-foreground";
      case "qualified":
        return "bg-success text-success-foreground";
      case "proposal":
        return "bg-warning text-warning-foreground";
      case "won":
        return "bg-success text-success-foreground";
      case "lost":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatValue = (value: number, label: string) => {
    if (label === "Revenue (Monthly)") {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    if (label === "Conversion Rate") {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  return (
    <PageLayout
      title="Medical Seller Profile"
      subtitle="Manage your company profile, products, and business performance"
      showFilters={false}
    >
      <div className="space-y-lg">
        {/* Company Header */}
        <Card className="bg-gradient-to-r from-sky/30 to-primary/10 border-border/50">
          <CardContent className="p-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-lg">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-medical">
                  <AvatarImage src={companyProfile.logo} alt={companyProfile.name} />
                  <AvatarFallback className="text-medical-lg font-semibold">
                    {companyProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {companyProfile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                    <Star className="h-4 w-4 text-success-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md">
                  <div>
                    <h1 className="text-medical-3xl font-bold text-heading">{companyProfile.name}</h1>
                    <p className="text-medical-xl text-primary font-semibold">{companyProfile.industry}</p>
                    <p className="text-body">Est. {companyProfile.establishedYear} • {companyProfile.employees} employees</p>
                    <p className="text-medical-sm text-muted mt-sm">{companyProfile.description}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-sm">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-md text-medical-sm text-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {companyProfile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {products.filter(p => p.status === "active").length} active products
                  </div>
                  <Badge variant="secondary">{companyProfile.subscriptionPlan}</Badge>
                  {companyProfile.verified && <Badge className="bg-success text-success-foreground">Verified Supplier</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          {performanceMetrics.map((metric) => (
            <StatPill
              key={metric.label}
              label={metric.label}
              value={formatValue(metric.value, metric.label)}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-lg">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Product Management */}
          <TabsContent value="products" className="space-y-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-medical-lg font-semibold text-heading">Product Listings</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </div>
            
            <div className="grid gap-md">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-medical transition-shadow">
                  <CardContent className="p-lg">
                    <div className="flex items-start gap-md">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-medical-sm bg-muted"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-sm">
                          <div>
                            <h4 className="font-semibold text-heading text-medical-lg">{product.name}</h4>
                            <p className="text-medical-sm text-muted">{product.category}</p>
                            <p className="text-medical-sm text-primary font-medium">{product.price}</p>
                          </div>
                          <Badge className={cn("text-xs", getStatusColor(product.status))}>
                            {product.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md text-medical-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted" />
                            <span>{product.views.toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-muted" />
                            <span>{product.inquiries} inquiries</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted">Updated:</span>
                            <span>{new Date(product.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-sm">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leads Dashboard */}
          <TabsContent value="leads" className="space-y-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-medical-lg font-semibold text-heading">Sales Leads</h3>
              <Button variant="outline">Export Leads</Button>
            </div>
            
            <div className="space-y-md">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-medical transition-shadow">
                  <CardContent className="p-lg">
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex-1">
                        <div className="flex items-start gap-md mb-sm">
                          <div>
                            <h4 className="font-semibold text-heading">{lead.company}</h4>
                            <p className="text-medical-sm text-muted">{lead.contact}</p>
                          </div>
                          <Badge className={cn("text-xs", getStatusColor(lead.status))}>
                            {lead.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md text-medical-sm">
                          <div>
                            <span className="text-muted">Product:</span>
                            <p className="font-medium text-body">{lead.product}</p>
                          </div>
                          <div>
                            <span className="text-muted">Potential Value:</span>
                            <p className="font-medium text-primary">{lead.value}</p>
                          </div>
                          <div>
                            <span className="text-muted">Date:</span>
                            <p className="font-medium text-body">{new Date(lead.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {lead.notes && (
                          <div className="mt-sm pt-sm border-t border-border">
                            <p className="text-medical-sm text-muted">{lead.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-sm">
                        <Button variant="outline" size="sm">Update</Button>
                        <Button size="sm">Contact</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.label} className="space-y-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-medical-sm font-medium">{metric.label}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={cn("h-4 w-4", {
                            "text-success": metric.trend === "up",
                            "text-destructive": metric.trend === "down",
                            "text-muted": metric.trend === "neutral"
                          })} />
                          <span className={cn("text-medical-sm font-medium", {
                            "text-success": metric.trend === "up",
                            "text-destructive": metric.trend === "down",
                            "text-muted": metric.trend === "neutral"
                          })}>
                            {metric.trend !== "neutral" ? `${metric.change > 0 ? '+' : ''}${metric.change}%` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="text-medical-2xl font-bold text-heading">
                        {formatValue(metric.value, metric.label)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-md">
                  {[
                    { stage: "New Leads", count: 45, percentage: 100 },
                    { stage: "Contacted", count: 38, percentage: 84 },
                    { stage: "Qualified", count: 28, percentage: 62 },
                    { stage: "Proposal", count: 15, percentage: 33 },
                    { stage: "Won", count: 8, percentage: 18 }
                  ].map((stage) => (
                    <div key={stage.stage} className="space-y-sm">
                      <div className="flex justify-between">
                        <span className="text-medical-sm font-medium">{stage.stage}</span>
                        <span className="text-medical-sm text-muted">{stage.count} ({stage.percentage}%)</span>
                      </div>
                      <Progress value={stage.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="space-y-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-medical-lg font-semibold text-heading">Buyer Messages</h3>
              <Badge variant="secondary">{chatMessages.reduce((sum, msg) => sum + msg.unread, 0)} unread</Badge>
            </div>
            
            {chatMessages.length > 0 ? (
              <div className="space-y-md">
                {chatMessages.map((message) => (
                  <Card key={message.id} className={cn("hover:shadow-medical transition-shadow cursor-pointer", {
                    "border-primary/50 bg-primary/5": message.unread > 0
                  })}>
                    <CardContent className="p-lg">
                      <div className="flex items-start gap-md">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={message.avatar} alt={message.buyer} />
                          <AvatarFallback>
                            {message.buyer.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-sm">
                            <div>
                              <h4 className="font-semibold text-heading">{message.buyer}</h4>
                              <p className="text-medical-sm text-muted">{message.company}</p>
                              <p className="text-medical-sm text-primary">Re: {message.product}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-medical-sm text-muted">
                                {new Date(message.timestamp).toLocaleDateString()}
                              </p>
                              {message.unread > 0 && (
                                <Badge variant="destructive" className="mt-1">
                                  {message.unread} new
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-medical-sm text-body">{message.lastMessage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageCircle className="h-6 w-6" />}
                title="No messages"
                description="Buyer inquiries and messages will appear here."
                action={
                  <Button variant="outline">
                    View All Inquiries
                  </Button>
                }
              />
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Company Name</label>
                    <p className="text-body">{companyProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Industry</label>
                    <p className="text-body">{companyProfile.industry}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Website</label>
                    <p className="text-primary">{companyProfile.website}</p>
                  </div>
                  <div>
                    <label className="text-medical-sm font-medium text-heading">Location</label>
                    <p className="text-body">{companyProfile.location}</p>
                  </div>
                </div>
                <div>
                  <label className="text-medical-sm font-medium text-heading">Company Description</label>
                  <p className="text-body">{companyProfile.description}</p>
                </div>
                <Button variant="outline">Edit Company Profile</Button>
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
                    <p className="font-semibold text-heading">{companyProfile.subscriptionPlan}</p>
                    <p className="text-medical-sm text-muted">
                      Advanced analytics, unlimited product listings, and priority support
                    </p>
                  </div>
                  <div className="flex gap-sm">
                    <Button variant="outline">Manage Subscription</Button>
                    <Button>Renew Plan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}