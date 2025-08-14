import { useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { ConnectionCard } from "@/components/templates/cards/ConnectionCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Networking() {
  const [activeTab, setActiveTab] = useState("find");
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

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
      view={view}
      onViewChange={setView}
    >
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
    </PageLayout>
  );
}