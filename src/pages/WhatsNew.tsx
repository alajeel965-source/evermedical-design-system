import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, Zap, Globe, Users, Wrench } from "lucide-react";

export default function WhatsNew() {
  const releases = [
    {
      version: "1.0.0",
      date: "August 2024",
      type: "Major Release",
      features: [
        {
          category: "Security & Performance",
          icon: Shield,
          items: [
            "Production-ready security headers (CSP, HSTS, X-Frame-Options)",
            "Enhanced database security with proper RLS policies",
            "Optimized Vite build configuration with code splitting",
            "Asset optimization and caching strategies"
          ]
        },
        {
          category: "Platform Foundation",
          icon: Zap,
          items: [
            "Multi-language support (English/Arabic) with RTL layout",
            "Comprehensive design system with medical-focused tokens",
            "WCAG 2.1 AA accessibility compliance",
            "Mobile-first responsive design"
          ]
        },
        {
          category: "Core Features",
          icon: Globe,
          items: [
            "Medical equipment marketplace with verified suppliers",
            "Live RFQ (Request for Quote) system",
            "Medical events and conference listings",
            "Professional networking for healthcare providers"
          ]
        },
        {
          category: "User Experience",
          icon: Users,
          items: [
            "Intuitive dashboard with real-time insights",
            "Advanced search and filtering capabilities",
            "Professional profile management",
            "Seamless navigation and user flows"
          ]
        },
        {
          category: "Technical Excellence",
          icon: Wrench,
          items: [
            "React 18 with TypeScript for type safety",
            "Supabase backend with real-time capabilities",
            "Tailwind CSS with custom design tokens",
            "Production-optimized build pipeline"
          ]
        }
      ]
    }
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-heading mb-4">
                What's New in EverMedical
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover the latest features, improvements, and enhancements to the 
                global medical equipment marketplace platform.
              </p>
            </header>

            {releases.map((release, index) => (
              <Card key={index} className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl text-heading">
                      Version {release.version}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{release.date}</Badge>
                      <Badge className="bg-primary text-primary-foreground">
                        {release.type}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    Launch of the complete medical equipment marketplace platform 
                    with advanced security, performance optimizations, and comprehensive 
                    feature set.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-8">
                    {release.features.map((category, categoryIndex) => (
                      <div key={categoryIndex}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <category.icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold text-heading">
                            {category.category}
                          </h3>
                        </div>
                        
                        <div className="grid gap-3">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span className="text-body leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-sky/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-heading mb-2">
                    Ready to Get Started?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Join thousands of healthcare professionals and suppliers on the 
                    world's most trusted medical equipment marketplace.
                  </p>
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <span>🌍 Global Reach</span>
                    <span>✅ Verified Suppliers</span>
                    <span>🔒 Secure Platform</span>
                    <span>📱 Mobile Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}