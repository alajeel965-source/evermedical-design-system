import { AppShell } from "@/components/shared/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Globe, Shield, Zap, Users, Building2 } from "lucide-react";

export default function WhatsNew() {
  const updates = [
    {
      category: "Platform",
      icon: <Globe className="h-5 w-5" />,
      title: "Global Medical Equipment Marketplace Launch",
      description: "EverMedical is now live with a comprehensive B2B platform connecting medical equipment suppliers and buyers worldwide.",
      features: [
        "Multi-language support (English/Arabic)",
        "Global supplier verification system", 
        "Advanced product categorization",
        "Real-time RFQ management"
      ]
    },
    {
      category: "Security",
      icon: <Shield className="h-5 w-5" />,
      title: "Enterprise-Grade Security",
      description: "Built with healthcare-grade security standards to protect sensitive medical equipment transactions.",
      features: [
        "End-to-end encryption",
        "GDPR compliance", 
        "Secure user authentication",
        "Data protection protocols"
      ]
    },
    {
      category: "Performance",
      icon: <Zap className="h-5 w-5" />,
      title: "Lightning-Fast Performance",
      description: "Optimized for speed with advanced caching and modern web technologies.",
      features: [
        "Sub-second page loads",
        "Optimized asset delivery",
        "Progressive web app features",
        "Mobile-first responsive design"
      ]
    }
  ];

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Version 1.0 - January 2025
          </Badge>
          <h1 className="text-4xl font-bold mb-4 text-heading">
            Welcome to EverMedical
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The world's most trusted B2B platform for medical equipment trading.
          </p>
        </div>

        <div className="space-y-6">
          {updates.map((update, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {update.icon}
                  </div>
                  <Badge variant="outline">{update.category}</Badge>
                </div>
                <CardTitle>{update.title}</CardTitle>
                <CardDescription>{update.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {update.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}