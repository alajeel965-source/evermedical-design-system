import React, { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Globe, 
  Rss, 
  FileText, 
  Settings, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  Clock,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useI18n, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const AIAgentSources = () => {
  const { isRTL } = useI18n();
  const { t } = useTranslation();
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);

  const sources = [
    {
      id: "1",
      name: "American Medical Association Events",
      url: "https://www.ama-assn.org/events",
      type: "website",
      status: "active",
      lastCrawled: "2025-01-14T10:30:00Z",
      nextCrawl: "2025-01-15T10:30:00Z",
      successCount: 45,
      failureCount: 2,
      eventsFound: 127,
      crawlEnabled: true,
      crawlFrequency: "daily"
    },
    {
      id: "2",
      name: "European Society of Cardiology RSS",
      url: "https://www.escardio.org/Events/RSS",
      type: "rss",
      status: "active",
      lastCrawled: "2025-01-14T08:15:00Z",
      nextCrawl: "2025-01-14T20:15:00Z",
      successCount: 23,
      failureCount: 0,
      eventsFound: 89,
      crawlEnabled: true,
      crawlFrequency: "12-hours"
    },
    {
      id: "3",
      name: "Medical Conference Sitemap",
      url: "https://medicalconferences.org/sitemap.xml",
      type: "sitemap",
      status: "inactive",
      lastCrawled: "2025-01-13T15:45:00Z",
      nextCrawl: null,
      successCount: 12,
      failureCount: 8,
      eventsFound: 34,
      crawlEnabled: false,
      crawlFrequency: "weekly"
    },
    {
      id: "4",
      name: "Journal of Emergency Medicine Events",
      url: "https://www.jem-journal.com/events",
      type: "website",
      status: "error",
      lastCrawled: "2025-01-14T06:20:00Z",
      nextCrawl: "2025-01-14T18:20:00Z",
      successCount: 18,
      failureCount: 3,
      eventsFound: 56,
      crawlEnabled: true,
      crawlFrequency: "daily"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-muted border-muted">Inactive</Badge>;
      case "error":
        return <Badge className="bg-destructive/10 text-destructive border-destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "website":
        return <Globe className="w-4 h-4" />;
      case "rss":
        return <Rss className="w-4 h-4" />;
      case "sitemap":
        return <FileText className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  const AddSourceDialog = () => (
    <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Event Source</DialogTitle>
        </DialogHeader>
        <div className="space-y-lg">
          <div className="grid grid-cols-2 gap-lg">
            <div className="space-y-2">
              <Label htmlFor="source-name">Source Name</Label>
              <Input 
                id="source-name" 
                placeholder="e.g., Medical Conference Hub"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-type">Source Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="sitemap">XML Sitemap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-url">URL</Label>
            <Input 
              id="source-url" 
              type="url"
              placeholder="https://example.com/events"
            />
          </div>

          <div className="grid grid-cols-2 gap-lg">
            <div className="space-y-2">
              <Label htmlFor="crawl-frequency">Crawl Frequency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="6-hours">Every 6 Hours</SelectItem>
                  <SelectItem value="12-hours">Every 12 Hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-pages">Max Pages</Label>
              <Input 
                id="max-pages" 
                type="number"
                defaultValue="100"
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="css-selectors">CSS Selectors (Optional)</Label>
            <Textarea 
              id="css-selectors"
              placeholder="JSON configuration for custom selectors..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-sm">
            <Switch id="crawl-enabled" defaultChecked />
            <Label htmlFor="crawl-enabled">Enable crawling</Label>
          </div>

          <div className={cn(
            "flex justify-end space-x-sm",
            isRTL && "flex-row-reverse space-x-reverse"
          )}>
            <Button variant="outline" onClick={() => setShowAddSource(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddSource(false)}>
              Add Source
            </Button>
          </div>
        </div>
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
              <span>Sources</span>
            </div>
            <h1 className="text-heading text-medical-4xl font-bold">
              Event Sources
            </h1>
            <p className="text-body text-medical-lg max-w-2xl">
              Manage websites, RSS feeds, and sitemaps for automated event discovery. Configure crawl settings and monitor source performance.
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
            <Button onClick={() => setShowAddSource(true)}>
              <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              Add Source
            </Button>
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-md">
          {sources.map((source) => (
            <Card key={source.id} className="bg-card border-border">
              <CardContent className="p-lg">
                <div className={cn(
                  "flex items-start justify-between",
                  isRTL && "flex-row-reverse"
                )}>
                  <div className={cn("flex-1 space-y-md", isRTL && "text-right")}>
                    <div className={cn(
                      "flex items-center space-x-md",
                      isRTL && "flex-row-reverse space-x-reverse"
                    )}>
                      <div className={cn(
                        "flex items-center space-x-sm",
                        isRTL && "flex-row-reverse space-x-reverse"
                      )}>
                        {getTypeIcon(source.type)}
                        <h3 className="text-heading text-medical-lg font-semibold">
                          {source.name}
                        </h3>
                      </div>
                      {getStatusBadge(source.status)}
                    </div>

                    <p className="text-muted text-medical-sm font-mono">
                      {source.url}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted text-medical-xs">Last Crawled</p>
                        <p className="text-body text-medical-sm">
                          {formatDate(source.lastCrawled)}
                        </p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted text-medical-xs">Next Crawl</p>
                        <p className="text-body text-medical-sm">
                          {formatDate(source.nextCrawl)}
                        </p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted text-medical-xs">Success Rate</p>
                        <p className="text-body text-medical-sm">
                          {Math.round((source.successCount / (source.successCount + source.failureCount)) * 100)}%
                        </p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted text-medical-xs">Events Found</p>
                        <p className="text-body text-medical-sm">
                          {source.eventsFound}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-sm",
                    isRTL && "space-x-reverse"
                  )}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">Total Sources</p>
                <p className="text-heading text-medical-3xl font-bold">{sources.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">Active Sources</p>
                <p className="text-heading text-medical-3xl font-bold">
                  {sources.filter(s => s.status === "active").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">Total Events Found</p>
                <p className="text-heading text-medical-3xl font-bold">
                  {sources.reduce((sum, s) => sum + s.eventsFound, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg text-center">
              <div className="space-y-sm">
                <p className="text-muted text-medical-sm">Avg Success Rate</p>
                <p className="text-heading text-medical-3xl font-bold">
                  {Math.round(sources.reduce((sum, s) => 
                    sum + (s.successCount / (s.successCount + s.failureCount)) * 100, 0
                  ) / sources.length)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AddSourceDialog />
      </div>
    </AppShell>
  );
};

export default AIAgentSources;