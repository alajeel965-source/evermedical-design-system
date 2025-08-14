import React, { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Search, 
  Database, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Settings,
  TrendingUp,
  Globe,
  Calendar,
  Users
} from "lucide-react";
import { useI18n, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const AIAgent = () => {
  const { isRTL } = useI18n();
  const { t } = useTranslation();
  const [activeJobs, setActiveJobs] = useState(2);
  const [completedJobs, setCompletedJobs] = useState(45);
  const [eventsDiscovered, setEventsDiscovered] = useState(1247);
  const [eventsApproved, setEventsApproved] = useState(892);

  const stats = [
    {
      title: "Active Crawl Jobs",
      value: activeJobs,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Events Discovered",
      value: eventsDiscovered,
      icon: Search,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Pending Review",
      value: 34,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Published Events",
      value: eventsApproved,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  const recentJobs = [
    {
      id: "1",
      source: "American Medical Association",
      status: "completed",
      discovered: 12,
      approved: 8,
      duration: "2m 34s",
      confidence: 0.89
    },
    {
      id: "2", 
      source: "European Society of Cardiology",
      status: "running",
      discovered: 6,
      approved: 0,
      duration: "1m 12s",
      confidence: 0.92
    },
    {
      id: "3",
      source: "Journal of Emergency Medicine",
      status: "completed",
      discovered: 23,
      approved: 18,
      duration: "4m 18s",
      confidence: 0.76
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge variant="outline" className="text-warning border-warning">Running</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-success border-success">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="text-destructive border-destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <AppShell>
      <div className="space-y-lg">
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("space-y-sm", isRTL && "text-right")}>
            <h1 className="text-heading text-medical-4xl font-bold">
              AI Event Agent
            </h1>
            <p className="text-body text-medical-lg max-w-2xl">
              Intelligent medical event discovery and classification system. Automatically finds, extracts, and categorizes medical conferences, workshops, and webinars.
            </p>
          </div>
          
          <div className={cn(
            "flex items-center space-x-md",
            isRTL && "space-x-reverse"
          )}>
            <Button variant="outline" size="sm">
              <Settings className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              Settings
            </Button>
            <Button>
              <Play className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              Run Discovery
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-lg">
                <div className={cn(
                  "flex items-center justify-between",
                  isRTL && "flex-row-reverse"
                )}>
                  <div className={cn("space-y-sm", isRTL && "text-right")}>
                    <p className="text-muted text-medical-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-heading text-medical-3xl font-bold">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={cn(
                    "w-12 h-12 rounded-medical-sm flex items-center justify-center",
                    stat.bgColor
                  )}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-lg">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Crawl Jobs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-lg">
            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center",
                  isRTL && "flex-row-reverse space-x-reverse space-x-sm"
                )}>
                  <Bot className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
                  Recent Discovery Jobs
                </CardTitle>
                <CardDescription>
                  Latest automated discovery and classification results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-md">
                  {recentJobs.map((job) => (
                    <div key={job.id} className={cn(
                      "flex items-center justify-between p-md bg-surface rounded-medical-sm",
                      isRTL && "flex-row-reverse"
                    )}>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-heading text-medical-sm font-medium">
                          {job.source}
                        </p>
                        <p className="text-muted text-medical-xs">
                          {job.discovered} discovered • {job.approved} approved • {job.duration}
                        </p>
                      </div>
                      
                      <div className={cn(
                        "flex items-center space-x-md",
                        isRTL && "space-x-reverse"
                      )}>
                        <div className={cn("text-right", isRTL && "text-left")}>
                          <p className="text-medical-xs text-muted">Confidence</p>
                          <p className="text-medical-sm font-medium">
                            {(job.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <Card className="hover:shadow-medical transition-shadow cursor-pointer">
                <CardContent className="p-lg text-center space-y-md">
                  <div className="w-12 h-12 bg-primary/10 rounded-medical-sm flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-heading text-medical-lg font-semibold">
                      Discover Events
                    </h3>
                    <p className="text-muted text-medical-sm">
                      Run new discovery job across configured sources
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-medical transition-shadow cursor-pointer">
                <CardContent className="p-lg text-center space-y-md">
                  <div className="w-12 h-12 bg-warning/10 rounded-medical-sm flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-heading text-medical-lg font-semibold">
                      Review Queue
                    </h3>
                    <p className="text-muted text-medical-sm">
                      Review and approve pending events
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-medical transition-shadow cursor-pointer">
                <CardContent className="p-lg text-center space-y-md">
                  <div className="w-12 h-12 bg-success/10 rounded-medical-sm flex items-center justify-center mx-auto">
                    <Database className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-heading text-medical-lg font-semibold">
                      Manage Sources
                    </h3>
                    <p className="text-muted text-medical-sm">
                      Configure crawl sources and settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Crawl Job History</CardTitle>
                <CardDescription>
                  All discovery and classification jobs with detailed results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted text-center py-8">
                  Crawl jobs interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Discovery performance, source effectiveness, and classification accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted text-center py-8">
                  Analytics dashboard coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-lg">
            <Card>
              <CardHeader>
                <CardTitle>Event Sources</CardTitle>
                <CardDescription>
                  Manage crawl sources, sitemaps, and RSS feeds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted text-center py-8">
                  Source management interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default AIAgent;