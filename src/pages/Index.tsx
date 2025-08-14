import { useState } from "react";
import { Stethoscope, ShieldCheck, Zap, Users, Building2, Award } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { HeroSection } from "@/components/shared/HeroSection";
import { FeatureTile } from "@/components/shared/FeatureTile";
import { RFQAssistant } from "@/components/shared/RFQAssistant";
import { LiveRFQsWidget } from "@/components/shared/LiveRFQsWidget";

const Index = () => {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const features = [
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: "Medical Equipment Marketplace",
      description: "Access thousands of verified medical devices from trusted suppliers worldwide."
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Verified Suppliers",
      description: "All suppliers are thoroughly vetted with ISO certifications and quality compliance."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Matching",
      description: "Get instantly matched with the best suppliers for your specific requirements."
    }
  ];

  return (
    <AppShell language={language} onLanguageChange={setLanguage}>
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="container mx-auto px-lg py-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2xl">
          {/* Left Column - RFQ Assistant */}
          <div className="lg:col-span-2 space-y-2xl">
            <RFQAssistant />
            
            {/* Features Grid */}
            <div className="space-y-xl">
              <div className="text-center space-y-md">
                <h2 className="text-heading font-bold text-medical-3xl">
                  Why Choose EverMedical?
                </h2>
                <p className="text-body text-medical-lg max-w-2xl mx-auto">
                  Join thousands of healthcare professionals who trust our platform for their medical equipment needs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {features.map((feature, index) => (
                  <FeatureTile
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Live RFQs */}
          <div className="space-y-lg">
            <LiveRFQsWidget />
            
            {/* Trust Indicators */}
            <div className="bg-card border border-border rounded-medical-md p-lg shadow-soft">
              <h3 className="text-heading font-semibold text-medical-base mb-md">
                Trusted Worldwide
              </h3>
              <div className="space-y-sm text-medical-sm">
                <div className="flex justify-between">
                  <span className="text-body">Active Suppliers</span>
                  <span className="text-heading font-semibold">15,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Equipment Categories</span>
                  <span className="text-heading font-semibold">500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Global Reach</span>
                  <span className="text-heading font-semibold">120 Countries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Monthly RFQs</span>
                  <span className="text-heading font-semibold">10,000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Index;
