import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RFQAssistant() {
  return (
    <Card className="border-border shadow-medical">
      <CardHeader className="pb-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-heading text-medical-lg flex items-center space-x-sm">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>RFQ Assistant</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
            Draft
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-lg">
        <Textarea
          placeholder="Describe your medical equipment needs... (e.g., 'Need 50 digital thermometers for hospital procurement, ISO certified, delivery to Dubai')"
          className="min-h-[120px] border-border focus:ring-primary resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-muted text-medical-xs">
            AI will help optimize your request for better supplier matches
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft">
            <Send className="h-4 w-4 mr-sm" />
            Generate RFQ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}