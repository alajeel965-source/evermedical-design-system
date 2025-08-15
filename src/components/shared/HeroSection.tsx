import { Card } from "@/components/ui/card";
import { StatPill } from "./StatPill";
import { CTAGroup } from "./CTAGroup";

export function HeroSection() {
  return (
    <section 
      className="relative bg-gradient-to-br from-sky to-background overflow-hidden py-2xl"
      aria-labelledby="hero-title"
    >
      {/* Abstract Blob Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky/20 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>
      
      <div className="site-container relative">
        <div className="max-w-4xl mx-auto">
          {/* Hero Card */}
          <Card className="rounded-2xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm border-border/50 shadow-medical-lg p-2xl">
            <div className="text-center space-y-2xl">
              {/* Main Heading */}
              <div className="space-y-lg">
                <h1 
                  id="hero-title"
                  className="text-heading font-bold text-medical-5xl lg:text-6xl leading-tight animate-fade-in"
                >
                  Connect with Global 
                  <span className="text-primary block">Medical Suppliers</span>
                </h1>
                <p className="text-body text-medical-xl leading-relaxed max-w-3xl mx-auto animate-fade-in">
                  Streamline your medical equipment procurement with AI-powered supplier matching, 
                  real-time RFQs, and trusted global network of healthcare professionals.
                </p>
              </div>

              {/* CTA Buttons */}
              <CTAGroup className="justify-center animate-fade-in" />

              {/* Stats Row */}
              <div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-md max-w-3xl mx-auto pt-lg animate-fade-in"
                role="region"
                aria-label="Platform statistics"
              >
                <StatPill label="Active Suppliers" value="15K+" trend="up" />
                <StatPill label="Equipment Types" value="500+" trend="neutral" />
                <StatPill label="Countries" value="120+" trend="up" />
                <StatPill label="Monthly RFQs" value="10K+" trend="up" />
              </div>
            </div>
          </Card>

          {/* Floating Quick RFQ Visual */}
          <div className="relative mt-xl max-w-md mx-auto">
            <div className="bg-card border border-border rounded-medical-md p-xl shadow-medical-lg transform rotate-1 hover:rotate-0 transition-transform duration-500 animate-scale-in">
              <div className="space-y-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading font-semibold text-medical-lg">Quick RFQ Preview</h3>
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                </div>
                <div className="space-y-md">
                  <div className="h-4 bg-surface rounded-medical-sm animate-pulse" />
                  <div className="h-4 bg-surface rounded-medical-sm w-3/4 animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="h-4 bg-surface rounded-medical-sm w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="flex justify-between items-center pt-md border-t border-border">
                  <span className="text-muted text-medical-sm">5 suppliers matched</span>
                  <div className="w-20 h-8 bg-success/20 rounded-medical-sm animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Floating Status Badges */}
            <div className="absolute -top-md -right-md bg-warning text-warning-foreground rounded-medical-lg px-md py-sm shadow-medical animate-bounce">
              <span className="text-medical-sm font-semibold">Live Quote</span>
            </div>
            <div className="absolute -bottom-md -left-md bg-success text-success-foreground rounded-medical-lg px-md py-sm shadow-medical hover-scale">
              <span className="text-medical-sm font-semibold">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}