import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PricingCard } from "@/components/templates/cards/PricingCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const pricingPlans = [
    {
      title: "Starter",
      price: billingPeriod === "monthly" ? "$99" : "$990",
      period: billingPeriod === "monthly" ? "month" : "year",
      description: "Perfect for small clinics and individual practitioners",
      features: [
        "Up to 5 team members",
        "Basic marketplace access",
        "Standard support",
        "Monthly analytics reports",
        "Basic RFQ submissions",
      ],
      ctaText: "Start Free Trial",
    },
    {
      title: "Professional",
      price: billingPeriod === "monthly" ? "$299" : "$2,990",
      period: billingPeriod === "monthly" ? "month" : "year",
      description: "Ideal for growing medical practices and departments",
      features: [
        "Up to 25 team members",
        "Full marketplace access",
        "Priority support",
        "Advanced analytics & reporting",
        "Unlimited RFQ submissions",
        "Custom vendor negotiations",
        "CME event planning tools",
      ],
      isPopular: true,
      ctaText: "Start Free Trial",
    },
    {
      title: "Enterprise",
      price: billingPeriod === "monthly" ? "$699" : "$6,990",
      period: billingPeriod === "monthly" ? "month" : "year",
      description: "Comprehensive solution for large hospital systems",
      features: [
        "Unlimited team members",
        "White-label marketplace",
        "Dedicated account manager",
        "Custom integrations & API access",
        "Advanced procurement workflows",
        "Multi-location management",
        "Custom contracts & compliance",
        "24/7 premium support",
      ],
      ctaText: "Contact Sales",
    },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-surface">
        <div className="container mx-auto px-lg py-2xl">
          <div className="text-center space-y-lg mb-2xl">
            <h1 className="text-heading font-bold text-medical-4xl">Pricing Plans</h1>
            <p className="text-body text-medical-lg max-w-2xl mx-auto">
              Choose the plan that best fits your medical organization's needs
            </p>
            
            <div className="flex justify-center">
              <Tabs value={billingPeriod} onValueChange={setBillingPeriod} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annual">
                    Annual
                    <span className="ml-2 text-xs bg-success text-success-foreground px-1.5 py-0.5 rounded">
                      Save 17%
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                {...plan}
                onSelect={() => {
                  // Handle plan selection
                  console.log(`Selected plan: ${plan.title}`);
                }}
              />
            ))}
          </div>
          
          <div className="text-center mt-2xl">
            <p className="text-muted-foreground text-medical-sm mb-md">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <p className="text-body text-medical-sm">
              Need a custom plan for your organization?{" "}
              <a href="#" className="text-primary hover:underline">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}