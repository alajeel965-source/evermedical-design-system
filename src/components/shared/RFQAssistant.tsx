import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RFQAssistant() {
  return (
    <Card className="rounded-2xl border-border/50 shadow-medical-lg hover:shadow-medical-xl transition-all duration-300">
      <CardHeader className="pb-md">
        <div className="flex items-center justify-between">
          <div className="space-y-sm">
            <CardTitle className="text-heading text-medical-xl flex items-center space-x-sm">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span>AI RFQ Assistant</span>
            </CardTitle>
            <p className="text-muted text-medical-sm">
              Describe your needs and get matched with verified suppliers instantly
            </p>
          </div>
          <Badge 
            variant="draft" 
            className="bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
            aria-label="Draft status"
          >
            Draft
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-lg">
        <Textarea
          placeholder="e.g., 50 portable ultrasound devices for emergency department, FDA approved, delivery to Dubai within 30 days"
          className="min-h-[120px] rounded-medical-md border-border/50 focus:ring-primary resize-none hover:border-primary/50 transition-colors"
          aria-label="Describe your medical equipment requirements"
        />
        <div className="flex items-center justify-between">
          <p className="text-muted text-medical-xs">
            AI will optimize your request for better supplier matches
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover-scale"
            aria-label="Generate RFQ from description"
          >
            <Send className="h-4 w-4 mr-sm" />
            Generate RFQ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}