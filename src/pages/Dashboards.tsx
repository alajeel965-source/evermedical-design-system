import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { DashboardCard } from "@/components/templates/cards/DashboardCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboards() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "analytics", label: "Analytics" },
    { value: "reports", label: "Reports" },
    { value: "goals", label: "Goals" },
  ];

  const dashboardData = [
    {
      title: "Total Revenue",
      value: "$2.4M",
      change: { value: 12.5, period: "last month", isPositive: true },
      description: "Total revenue from all sources",
    },
    {
      title: "Active RFQs",
      value: "47",
      change: { value: 8.2, period: "last week", isPositive: true },
      description: "Currently open requests for quotation",
    },
    {
      title: "Equipment Orders",
      value: "156",
      change: { value: 3.1, period: "last month", isPositive: false },
      description: "Medical equipment orders this month",
    },
    {
      title: "Vendor Partners",
      value: "89",
      change: { value: 15.3, period: "last quarter", isPositive: true },
      description: "Active verified vendor partners",
    },
    {
      title: "Event Registrations",
      value: "1,234",
      description: "Total registrations for upcoming events",
    },
    {
      title: "Network Connections",
      value: "456",
      change: { value: 22.1, period: "last month", isPositive: true },
      description: "Professional network connections made",
    },
    {
      title: "CME Credits Earned",
      value: "2,890",
      description: "Total CME credits earned by team members",
    },
    {
      title: "Cost Savings",
      value: "$340K",
      change: { value: 18.7, period: "last quarter", isPositive: true },
      description: "Savings through bulk procurement",
    },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-surface">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-lg py-xl">
            <div className="space-y-lg">
              <div className="text-center lg:text-left">
                <h1 className="text-heading font-bold text-medical-4xl">Analytics Dashboard</h1>
                <p className="text-body text-medical-lg mt-sm max-w-2xl mx-auto lg:mx-0">
                  Monitor your medical organization's performance and analytics
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
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-lg py-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {dashboardData.map((data, index) => (
              <DashboardCard key={index} {...data} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}