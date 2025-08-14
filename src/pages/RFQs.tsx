import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { RFQCard } from "@/components/templates/cards/RFQCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, Plus } from "lucide-react";

export default function RFQs() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const handleFilterChange = (groupTitle: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [groupTitle]: checked
        ? [...(prev[groupTitle] || []), value]
        : (prev[groupTitle] || []).filter(f => f !== value)
    }));
  };

  const tabs = [
    { value: "browse", label: "Browse RFQs" },
    { value: "my-rfqs", label: "My RFQs" },
    { value: "quotes", label: "Submitted Quotes" },
    { value: "drafts", label: "Drafts" },
  ];

  const filters = [
    {
      title: "Status",
      items: [
        { value: "open", label: "Open", count: 45 },
        { value: "in-review", label: "In Review", count: 23 },
        { value: "closed", label: "Closed", count: 18 },
        { value: "draft", label: "Draft", count: 12 },
      ],
    },
    {
      title: "Region",
      items: [
        { value: "north-america", label: "North America", count: 34 },
        { value: "europe", label: "Europe", count: 28 },
        { value: "asia-pacific", label: "Asia Pacific", count: 19 },
        { value: "middle-east", label: "Middle East", count: 15 },
        { value: "africa", label: "Africa", count: 8 },
      ],
    },
  ];

  const rfqs = [
    {
      id: "1",
      title: "50 Portable Ultrasound Devices for Rural Clinics",
      description: "We need portable ultrasound machines for our network of rural clinics. Devices should be lightweight, battery-powered, and capable of cardiac and abdominal imaging.",
      category: "Medical Equipment",
      budget: "$500,000 - $750,000",
      deadline: "March 30, 2024",
      urgency: "high" as const,
      responseCount: 12,
      isPublic: true,
      createdAt: "2 days ago",
    },
    {
      id: "2",
      title: "Surgical Masks - Bulk Order",
      description: "Hospital system looking for N95 surgical masks. Need FDA approved masks with proper certifications. Ongoing supply contract preferred.",
      category: "Medical Supplies",
      budget: "$75,000 - $100,000",
      deadline: "April 15, 2024",
      urgency: "medium" as const,
      responseCount: 8,
      isPublic: true,
      createdAt: "1 week ago",
    },
    {
      id: "3",
      title: "Medical Waste Management Service",
      description: "Seeking medical waste disposal service for 5 clinic locations in the metro area. Must be licensed and provide regular pickup schedules.",
      category: "Services",
      budget: "$25,000 - $40,000",
      deadline: "May 1, 2024",
      urgency: "low" as const,
      responseCount: 5,
      isPublic: false,
      createdAt: "3 days ago",
    },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-surface">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-lg py-xl">
            <div className="space-y-lg">
              <div className="text-center lg:text-left">
                <h1 className="text-heading font-bold text-medical-4xl">Request for Quotations</h1>
                <p className="text-body text-medical-lg mt-sm max-w-2xl mx-auto lg:mx-0">
                  Submit and respond to Request for Quotations in real-time
                </p>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:inline-flex">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              {/* Search and View Controls */}
              <div className="flex flex-col lg:flex-row gap-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search RFQs by title, category, or description..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-md">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <div className="flex border border-border rounded-md">
                    <Button
                      variant={view === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setView("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={view === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setView("table")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-lg py-lg">
          <div className="flex gap-lg">
            <div className="flex-1">
              {rfqs.length === 0 ? (
                <EmptyState
                  title="No RFQs found"
                  description="Try adjusting your filters or search terms"
                  action={
                    <Button variant="outline" onClick={() => setSelectedFilters({})}>
                      Clear filters
                    </Button>
                  }
                />
              ) : view === "grid" ? (
                <div className="space-y-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-lg">
                    {rfqs.map((rfq) => (
                      <RFQCard key={rfq.id} {...rfq} />
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Pagination />
                  </div>
                </div>
              ) : (
                <div className="space-y-lg">
                  <Card className="rounded-medical-md shadow-soft">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>RFQ Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Deadline</TableHead>
                          <TableHead>Responses</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rfqs.map((rfq) => (
                          <TableRow key={rfq.id}>
                            <TableCell className="font-medium">{rfq.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{rfq.category}</Badge>
                            </TableCell>
                            <TableCell>{rfq.budget}</TableCell>
                            <TableCell>{rfq.deadline}</TableCell>
                            <TableCell>{rfq.responseCount}</TableCell>
                            <TableCell>
                              <Badge variant={rfq.isPublic ? "default" : "outline"}>
                                {rfq.isPublic ? "Public" : "Private"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                  <div className="flex justify-center">
                    <Pagination />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right rail */}
            <div className="hidden lg:block w-80">
              <div className="sticky top-24">
                <Card className="rounded-medical-md shadow-soft">
                  <CardContent className="p-lg space-y-md">
                    <h3 className="font-semibold text-heading text-medical-lg">Create New RFQ</h3>
                    <p className="text-body text-medical-sm">
                      Submit a request for quotation to connect with verified suppliers.
                    </p>
                    <Button className="w-full" size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Create RFQ
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}