import { useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { ConnectionCard } from "@/components/templates/cards/ConnectionCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Sparkles } from "lucide-react";

export default function Networking() {
  const [activeTab, setActiveTab] = useState("find");
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
    { value: "find", label: "Find Professionals" },
    { value: "connections", label: "My Connections" },
    { value: "groups", label: "Groups" },
    { value: "messages", label: "Messages" },
  ];

  const filters = [
    {
      title: "Specialty",
      items: [
        { value: "cardiology", label: "Cardiology", count: 234 },
        { value: "neurology", label: "Neurology", count: 156 },
        { value: "oncology", label: "Oncology", count: 189 },
        { value: "surgery", label: "Surgery", count: 312 },
      ],
    },
    {
      title: "Institution Type",
      items: [
        { value: "hospital", label: "Hospital", count: 445 },
        { value: "clinic", label: "Clinic", count: 223 },
        { value: "research", label: "Research Center", count: 78 },
        { value: "university", label: "University", count: 134 },
      ],
    },
    {
      title: "Experience Level",
      items: [
        { value: "resident", label: "Resident", count: 167 },
        { value: "attending", label: "Attending", count: 334 },
        { value: "chief", label: "Department Head", count: 89 },
        { value: "researcher", label: "Researcher", count: 112 },
      ],
    },
  ];

  const connections = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      institution: "Johns Hopkins Hospital",
      location: "Baltimore, MD",
      avatar: "/placeholder.svg",
      mutualConnections: 12,
      isConnected: false,
      connectionStatus: "not_connected" as const,
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Neurology",
      institution: "Mayo Clinic",
      location: "Rochester, MN",
      avatar: "/placeholder.svg",
      mutualConnections: 8,
      isConnected: true,
      connectionStatus: "connected" as const,
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Oncology",
      institution: "MD Anderson Cancer Center",
      location: "Houston, TX",
      avatar: "/placeholder.svg",
      mutualConnections: 5,
      isConnected: false,
      connectionStatus: "pending" as const,
    },
  ];

  return (
    <PageLayout
      title="Professional Networking"
      subtitle="Build professional relationships with healthcare providers and industry experts"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Search by name, specialty, or institution..."
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filters={filters}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      view={view}
      onViewChange={setView}
    >
      <div className="flex gap-lg">
        <div className="flex-1">
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {connections.map((connection) => (
                <ConnectionCard key={connection.id} {...connection} />
              ))}
            </div>
          ) : (
            <div className="space-y-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Mutual Connections</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell className="font-medium">{connection.name}</TableCell>
                      <TableCell>{connection.specialty}</TableCell>
                      <TableCell>{connection.institution}</TableCell>
                      <TableCell>{connection.location}</TableCell>
                      <TableCell>{connection.mutualConnections}</TableCell>
                      <TableCell>{connection.connectionStatus.replace("_", " ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        {/* Right rail */}
        <div className="hidden lg:block w-80">
          <div className="sticky top-24 space-y-lg">
            {/* Suggested connections */}
            <Card className="rounded-medical-md shadow-soft">
              <CardHeader className="pb-md">
                <CardTitle className="flex items-center gap-2 text-medical-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Suggested Connections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="space-y-sm">
                  <div className="flex items-center gap-3 p-sm hover:bg-accent/50 rounded-medical-sm transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-medical-sm truncate">Dr. Alex Kim</p>
                      <p className="text-muted-foreground text-medical-xs">Cardiology • 5 mutual</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-sm hover:bg-accent/50 rounded-medical-sm transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-medical-sm truncate">Dr. Maria Santos</p>
                      <p className="text-muted-foreground text-medical-xs">Neurology • 3 mutual</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-sm hover:bg-accent/50 rounded-medical-sm transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-medical-sm truncate">Dr. James Wilson</p>
                      <p className="text-muted-foreground text-medical-xs">Surgery • 7 mutual</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" size="sm">
                  View All Suggestions
                </Button>
              </CardContent>
            </Card>
            
            {/* Messaging CTA */}
            <Card className="rounded-medical-md shadow-soft">
              <CardContent className="p-lg space-y-md">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-heading text-medical-lg">Start Conversations</h3>
                  <p className="text-body text-medical-sm mt-2">
                    Connect with colleagues and expand your professional network through meaningful conversations.
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}