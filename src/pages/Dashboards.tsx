import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { DashboardCard } from "@/components/templates/cards/DashboardCard";
import { StatPill } from "@/components/shared/StatPill";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Dashboards() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "analytics", label: "Analytics" },
    { value: "reports", label: "Reports" },
    { value: "goals", label: "Goals" },
  ];

  // KPI Data for StatPills
  const kpiData = [
    { label: "Total Revenue", value: "$2.4M" },
    { label: "Active RFQs", value: "47" },
    { label: "Equipment Orders", value: "156" },
    { label: "Vendor Partners", value: "89" },
  ];

  // Chart data
  const revenueData = [
    { month: "Jan", revenue: 2100000, orders: 145 },
    { month: "Feb", revenue: 2250000, orders: 152 },
    { month: "Mar", revenue: 2180000, orders: 148 },
    { month: "Apr", revenue: 2320000, orders: 165 },
    { month: "May", revenue: 2400000, orders: 156 },
    { month: "Jun", revenue: 2450000, orders: 172 },
  ];

  const rfqData = [
    { week: "Week 1", submitted: 12, responded: 8, closed: 5 },
    { week: "Week 2", submitted: 15, responded: 11, closed: 7 },
    { week: "Week 3", submitted: 18, responded: 14, closed: 9 },
    { week: "Week 4", submitted: 22, responded: 18, closed: 12 },
  ];

  const dashboardData = [
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
        
        
        <div className="container mx-auto px-lg py-lg space-y-xl">
          {/* KPI Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {kpiData.map((kpi, index) => (
              <StatPill key={index} label={kpi.label} value={kpi.value} />
            ))}
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Revenue Chart */}
            <Card className="rounded-medical-md shadow-soft">
              <CardHeader>
                <CardTitle className="text-medical-lg font-semibold text-heading">
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-soft)'
                      }}
                      formatter={(value: any) => [`$${(value / 1000000).toFixed(2)}M`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* RFQ Activity Chart */}
            <Card className="rounded-medical-md shadow-soft">
              <CardHeader>
                <CardTitle className="text-medical-lg font-semibold text-heading">
                  RFQ Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={rfqData}>
                    <XAxis 
                      dataKey="week" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-soft)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        fontSize: '12px',
                        color: 'hsl(var(--body))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="submitted" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Submitted"
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responded" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Responded"
                      dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="closed" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      name="Closed"
                      dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Dashboard Cards */}
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