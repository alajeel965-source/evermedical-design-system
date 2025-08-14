import { ArrowRight, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatPill } from "./StatPill";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-sky to-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-lg py-2xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center">
          {/* Hero Content */}
          <div className="space-y-2xl">
            <div className="space-y-lg">
              <h1 className="text-heading font-bold text-medical-5xl lg:text-6xl leading-tight">
                Connect with Global 
                <span className="text-primary block">Medical Suppliers</span>
              </h1>
              <p className="text-body text-medical-xl leading-relaxed max-w-2xl">
                Streamline your medical equipment procurement with AI-powered supplier matching, 
                real-time RFQs, and trusted global network of healthcare professionals.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-md">
              <Button variant="hero" size="xl">
                <Search className="h-5 w-5" />
                Browse Equipment
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="hero-secondary" size="xl">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
              <Button variant="hero-ghost" size="xl">
                Create RFQ
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-md max-w-lg">
              <StatPill label="Active Suppliers" value="15K+" trend="up" />
              <StatPill label="Equipment Types" value="500+" trend="neutral" />
              <StatPill label="Countries" value="120+" trend="up" />
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-card border border-border rounded-medical-md p-xl shadow-medical-lg transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading font-semibold text-medical-lg">Quick RFQ</h3>
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                </div>
                <div className="space-y-md">
                  <div className="h-4 bg-surface rounded-medical-sm" />
                  <div className="h-4 bg-surface rounded-medical-sm w-3/4" />
                  <div className="h-4 bg-surface rounded-medical-sm w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-md border-t border-border">
                  <span className="text-muted text-medical-sm">5 suppliers matched</span>
                  <Button size="sm" variant="success">
                    Send RFQ
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-md -right-md bg-warning text-warning-foreground rounded-medical-lg p-md shadow-medical animate-bounce">
              <span className="text-medical-sm font-semibold">Live Quote</span>
            </div>
            <div className="absolute -bottom-md -left-md bg-success text-success-foreground rounded-medical-lg p-md shadow-medical">
              <span className="text-medical-sm font-semibold">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}