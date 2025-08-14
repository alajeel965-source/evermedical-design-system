import { MapPin, DollarSign, Clock, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const liveRFQs = [
  {
    id: 1,
    title: "Portable X-Ray Systems",
    location: "UAE, Dubai",
    budget: "$50K - $75K",
    timeLeft: "2 days",
    urgency: "high"
  },
  {
    id: 2,
    title: "ICU Ventilators",
    location: "Saudi Arabia",
    budget: "$120K - $180K", 
    timeLeft: "5 days",
    urgency: "medium"
  }
];

export function LiveRFQsWidget() {
  return (
    <Card className="rounded-2xl border-border/50 shadow-medical-lg hover:shadow-medical-xl transition-all duration-300">
      <CardHeader className="pb-md">
        <CardTitle className="text-heading text-medical-lg flex items-center space-x-sm">
          <span>Live RFQs</span>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" aria-label="Live indicator" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-lg">
        {/* RFQ Cards */}
        <div className="space-y-md">
          {liveRFQs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-surface border border-border/50 rounded-medical-md p-lg hover:bg-surface/80 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`View RFQ for ${rfq.title}`}
            >
              <div className="space-y-sm">
                <h4 className="text-heading font-medium text-medical-sm group-hover:text-primary transition-colors">
                  {rfq.title}
                </h4>
                <div className="space-y-xs text-medical-xs">
                  <div className="flex items-center text-muted">
                    <MapPin className="h-3 w-3 mr-xs" />
                    <span>{rfq.location}</span>
                  </div>
                  <div className="flex items-center text-muted">
                    <DollarSign className="h-3 w-3 mr-xs" />
                    <span>{rfq.budget}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted">
                      <Clock className="h-3 w-3 mr-xs" />
                      <span>{rfq.timeLeft}</span>
                    </div>
                    <Badge 
                      variant={rfq.urgency === "high" ? "destructive" : rfq.urgency === "medium" ? "warning" : "secondary"}
                      className="text-medical-2xs"
                    >
                      {rfq.urgency}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Login Required Message */}
        <div className="bg-warning/10 border border-warning/20 rounded-medical-md p-md text-center">
          <div className="flex items-center justify-center space-x-sm text-warning mb-sm">
            <Lock className="h-4 w-4" />
            <span className="text-medical-sm font-medium">Login Required</span>
          </div>
          <p className="text-muted text-medical-xs mb-md">
            Sign in to view complete RFQ details and submit quotes
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            className="hover-scale"
            aria-label="Sign in to access full RFQ details"
          >
            Sign In
          </Button>
        </div>

        {/* View All Button */}
        <Button 
          variant="outline" 
          className="w-full hover-scale" 
          aria-label="View all available RFQs"
        >
          <ExternalLink className="h-4 w-4 mr-sm" />
          View All RFQs
        </Button>
      </CardContent>
    </Card>
  );
}