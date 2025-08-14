import { useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { RFQCard } from "@/components/templates/cards/RFQCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RFQs() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

  const tabs = [
    { value: "browse", label: "Browse RFQs" },
    { value: "my-rfqs", label: "My RFQs" },
    { value: "quotes", label: "Submitted Quotes" },
    { value: "drafts", label: "Drafts" },
  ];

  const filters = [
    {
      title: "Category",
      items: [
        { value: "equipment", label: "Medical Equipment", count: 23 },
        { value: "supplies", label: "Medical Supplies", count: 45 },
        { value: "services", label: "Services", count: 18 },
        { value: "pharmaceuticals", label: "Pharmaceuticals", count: 12 },
      ],
    },
    {
      title: "Urgency",
      items: [
        { value: "high", label: "High Priority", count: 8 },
        { value: "medium", label: "Medium Priority", count: 34 },
        { value: "low", label: "Low Priority", count: 56 },
      ],
    },
    {
      title: "Budget Range",
      items: [
        { value: "under-5k", label: "Under $5,000", count: 28 },
        { value: "5k-25k", label: "$5,000 - $25,000", count: 34 },
        { value: "25k-100k", label: "$25,000 - $100,000", count: 19 },
        { value: "over-100k", label: "Over $100,000", count: 7 },
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
    <PageLayout
      title="Request for Quotations"
      subtitle="Submit and respond to Request for Quotations in real-time"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Search RFQs by title, category, or description..."
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filters={filters}
      view={view}
      onViewChange={setView}
    >
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {rfqs.map((rfq) => (
            <RFQCard key={rfq.id} {...rfq} />
          ))}
        </div>
      ) : (
        <div className="space-y-lg">
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
                  <TableCell>{rfq.category}</TableCell>
                  <TableCell>{rfq.budget}</TableCell>
                  <TableCell>{rfq.deadline}</TableCell>
                  <TableCell>{rfq.responseCount}</TableCell>
                  <TableCell>{rfq.isPublic ? "Public" : "Private"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
}