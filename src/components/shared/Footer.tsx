import { Button } from "@/components/ui/button";

interface FooterProps {
  language?: "en" | "ar";
}

export function Footer({ language = "en" }: FooterProps) {
  const isRTL = language === "ar";

  return (
    <footer className={`bg-surface border-t border-border mt-2xl ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-lg py-2xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
          {/* Company */}
          <div className="space-y-lg">
            <div className="flex items-center space-x-sm">
              <div className="w-6 h-6 bg-primary rounded-medical-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">E</span>
              </div>
              <span className="text-heading font-semibold">EverMedical</span>
            </div>
            <p className="text-body text-medical-sm leading-relaxed">
              Connecting healthcare professionals with trusted medical equipment suppliers worldwide.
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-lg">
            <h3 className="text-heading font-semibold text-medical-base">Marketplace</h3>
            <div className="space-y-sm">
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Browse Equipment
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Find Suppliers
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Request Quotes
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Bulk Orders
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-lg">
            <h3 className="text-heading font-semibold text-medical-base">Services</h3>
            <div className="space-y-sm">
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start" asChild>
                <a href="/rfqs">Request for Quotations</a>
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Events & Trade Shows
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Professional Network
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start" asChild>
                <a href="/pricing">Pricing Plans</a>
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start" asChild>
                <a href="/dashboards">Analytics Dashboard</a>
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Market Intelligence
              </Button>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-lg">
            <h3 className="text-heading font-semibold text-medical-base">Support</h3>
            <div className="space-y-sm">
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Help Center
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Contact Us
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                Documentation
              </Button>
              <Button variant="link" className="h-auto p-0 text-body hover:text-heading justify-start">
                API Access
              </Button>
            </div>
          </div>
        </div>

        {/* Legal Row */}
        <div className="border-t border-border mt-2xl pt-lg">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-md md:space-y-0">
            <p className="text-muted text-medical-sm">
              © 2024 EverMedical. All rights reserved.
            </p>
            <div className="flex items-center space-x-lg">
              <Button variant="link" className="h-auto p-0 text-muted hover:text-body text-medical-sm" asChild>
                <a href="/legal/privacy">Privacy Policy</a>
              </Button>
              <Button variant="link" className="h-auto p-0 text-muted hover:text-body text-medical-sm" asChild>
                <a href="/legal/terms">Terms of Service</a>
              </Button>
              <Button variant="link" className="h-auto p-0 text-muted hover:text-body text-medical-sm" asChild>
                <a href="/legal/privacy#cookies">Cookie Policy</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}