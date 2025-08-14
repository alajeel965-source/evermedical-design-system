import { Clock, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const liveRFQs = [
  {
    id: 1,
    title: "Digital X-Ray Machines",
    location: "Dubai, UAE",
    budget: "$50K - $75K",
    timeLeft: "2h left",
    urgency: "high"
  },
  {
    id: 2,
    title: "Ultrasound Equipment",
    location: "Riyadh, SA",
    budget: "$25K - $40K", 
    timeLeft: "6h left",
    urgency: "medium"
  },
  {
    id: 3,
    title: "MRI Contrast Agents",
    location: "Cairo, EG",
    budget: "$15K - $20K",
    timeLeft: "1d left",
    urgency: "low"
  }
];

export function LiveRFQsWidget() {
  return (
    <Card className="border-border shadow-medical">
      <CardHeader className="pb-md">
        <CardTitle className="text-heading text-medical-lg flex items-center justify-between">
          <span>Live RFQs</span>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-md">
        {liveRFQs.map((rfq) => (
          <div key={rfq.id} className="bg-surface rounded-medical-sm p-md hover:bg-accent transition-colors cursor-pointer group">
            <div className="space-y-sm">
              <div className="flex items-start justify-between">
                <h4 className="text-heading font-medium text-medical-sm group-hover:text-primary transition-colors">
                  {rfq.title}
                </h4>
                <Badge 
                  variant={rfq.urgency === "high" ? "destructive" : rfq.urgency === "medium" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {rfq.urgency}
                </Badge>
              </div>
              
              <div className="space-y-xs">
                <div className="flex items-center text-muted text-medical-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {rfq.location}
                </div>
                <div className="flex items-center text-muted text-medical-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {rfq.budget}
                </div>
                <div className="flex items-center text-muted text-medical-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {rfq.timeLeft}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full mt-lg">
          View All RFQs
        </Button>
      </CardContent>
    </Card>
  );
}