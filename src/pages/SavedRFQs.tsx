import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { BookmarkX, ExternalLink, Share2, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { updatePageSEO } from "@/lib/seo";
import { useEffect } from "react";

interface SavedRFQ {
  id: string;
  title: string;
  category: string;
  country: string;
  dateCreated: string;
  status: "open" | "quoted" | "closed";
  budget?: string;
  deadline?: string;
  description: string;
}

export default function SavedRFQs() {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Mock data - replace with actual API call
  const [savedRFQs, setSavedRFQs] = useState<SavedRFQ[]>([
    {
      id: "1",
      title: "Hospital Equipment Procurement - ICU Ventilators",
      category: "Medical Equipment",
      country: "Saudi Arabia",
      dateCreated: "2024-01-20",
      status: "open",
      budget: "$50,000 - $100,000",
      deadline: "2024-02-15",
      description: "Seeking suppliers for high-quality ICU ventilators with advanced monitoring capabilities."
    },
    {
      id: "2",
      title: "Pharmaceutical Supply Chain - Antibiotics",
      category: "Pharmaceuticals",
      country: "Egypt",
      dateCreated: "2024-01-15",
      status: "quoted",
      budget: "$25,000 - $50,000",
      deadline: "2024-02-01",
      description: "Long-term supply contract for broad-spectrum antibiotics for regional hospitals."
    },
    {
      id: "3",
      title: "Laboratory Testing Equipment",
      category: "Laboratory",
      country: "UAE",
      dateCreated: "2024-01-10",
      status: "closed",
      budget: "$15,000 - $30,000",
      deadline: "2024-01-25",
      description: "PCR machines and related consumables for molecular diagnostics lab."
    }
  ]);

  useEffect(() => {
    updatePageSEO({
      title: "Saved RFQs - EverMedical",
      description: "Manage your saved Request for Quotations (RFQs) for medical equipment, pharmaceuticals, and healthcare supplies.",
      keywords: ["saved RFQs", "medical procurement", "healthcare RFQ", "medical equipment quotes", "pharmaceutical sourcing"]
    });
  }, []);

  const filteredRFQs = savedRFQs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rfq.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rfq.status === statusFilter;
    const matchesCountry = countryFilter === "all" || rfq.country === countryFilter;
    const matchesCategory = categoryFilter === "all" || rfq.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry && matchesCategory;
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
      open: "default",
      quoted: "secondary",
      closed: "outline"
    } as const;
    
    const colors = {
      open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      quoted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleUnsaveRFQ = (rfqId: string) => {
    setSavedRFQs(prev => prev.filter(rfq => rfq.id !== rfqId));
  };

  const handleShareRFQ = (rfq: SavedRFQ) => {
    // Mock share functionality
    navigator.share?.({
      title: rfq.title,
      text: rfq.description,
      url: window.location.origin + `/rfq/${rfq.id}`
    }).catch(() => {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/rfq/${rfq.id}`);
    });
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-heading text-3xl font-bold mb-2">Saved RFQs</h1>
          <p className="text-body">Manage your saved Request for Quotations and track their status</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search RFQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
                  <SelectItem value="Pharmaceuticals">Pharmaceuticals</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* RFQs Table */}
        {filteredRFQs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Saved RFQs ({filteredRFQs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ Details</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRFQs.map((rfq) => (
                      <TableRow key={rfq.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-heading mb-1">{rfq.title}</div>
                            <div className="text-sm text-body line-clamp-2">{rfq.description}</div>
                            {rfq.budget && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Budget: {rfq.budget}
                              </div>
                            )}
                            {rfq.deadline && (
                              <div className="text-sm text-muted-foreground">
                                Deadline: {formatDate(rfq.deadline)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rfq.category}</Badge>
                        </TableCell>
                        <TableCell>{rfq.country}</TableCell>
                        <TableCell>{formatDate(rfq.dateCreated)}</TableCell>
                        <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Open RFQ
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleShareRFQ(rfq)}
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUnsaveRFQ(rfq.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <BookmarkX className="w-4 h-4 mr-1" />
                              Unsave
                            </Button>
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
            icon={<Heart />}
            title="No saved RFQs yet"
            description="You haven't saved any RFQs yet. Explore live RFQs to find opportunities that match your expertise."
            action={
              <Button>
                Explore Live RFQs
              </Button>
            }
          />
        )}
      </div>
    </AppShell>
  );
}