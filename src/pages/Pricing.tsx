import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PricingCard } from "@/components/templates/cards/PricingCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const pricingPlans = [
    {
      title: "Individual",
      price: billingPeriod === "monthly" ? "$29" : "$290",
      period: billingPeriod === "monthly" ? "month" : "year",
      description: "Perfect for individual healthcare practitioners",
      features: [
        "Personal marketplace access",
        "Basic RFQ submissions",
        "Community networking",
        "Standard support",
        "Basic analytics",
      ],
      ctaText: "Start Free Trial",
    },
    {
      title: "Professional",
      price: billingPeriod === "monthly" ? "$99" : "$100",
      period: billingPeriod === "monthly" ? "month" : "year",
      description: "Ideal for medical practices and small departments",
      features: [
        "Everything in Individual",
        "Up to 10 team members",
        "Advanced marketplace features",
        "Priority RFQ processing",
        "Event management tools",
        "Enhanced analytics",
        "Priority support",
      ],
      isPopular: true,
      ctaText: "Start Free Trial",
      savings: billingPeriod === "annual" ? "Save $1,088/year" : undefined,
    },
    {
      title: "Hospital & Organizers",
      price: "Custom",
      period: "",
      description: "Comprehensive solution for large healthcare organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "White-label platform",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced procurement workflows",
        "Multi-location management",
        "24/7 premium support",
        "Custom compliance tools",
      ],
      ctaText: "Contact Sales",
    },
  ];

  const faqs = [
    {
      question: "What's included in the free trial?",
      answer: "All plans include a 14-day free trial with full access to features. No credit card required to start."
    },
    {
      question: "Can I switch plans at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and can arrange invoicing for enterprise customers."
    },
    {
      question: "Is there a discount for annual billing?",
      answer: "Yes! Annual billing saves you approximately 17% compared to monthly billing across all plans."
    },
    {
      question: "Do you offer custom pricing for large organizations?",
      answer: "Absolutely. For hospitals and large healthcare systems, we offer custom pricing and features. Contact our sales team for a personalized quote."
    },
    {
      question: "What kind of support is included?",
      answer: "All plans include email support. Professional plans get priority support, and Hospital plans receive dedicated account management with 24/7 premium support."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no cancellation fees, and you'll retain access until the end of your billing period."
    },
    {
      question: "Is my data secure and compliant?",
      answer: "Yes, we're HIPAA compliant and use enterprise-grade security. All data is encrypted in transit and at rest, with regular security audits."
    }
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
              <div key={index} className="relative">
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <PricingCard
                  {...plan}
                  onSelect={() => {
                    // Stub checkout button
                    alert(`Selected ${plan.title} plan - Checkout integration pending`);
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-3xl">
            <div className="text-center mb-2xl">
              <h2 className="text-heading font-bold text-medical-3xl mb-md">Frequently Asked Questions</h2>
              <p className="text-body text-medical-lg">
                Everything you need to know about our pricing and plans
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-md">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card rounded-medical-md border border-border px-lg"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-lg">
                    <span className="font-semibold text-heading text-medical-base">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-lg">
                    <p className="text-body text-medical-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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