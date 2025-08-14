import { Clock, MessageSquare, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RFQCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  deadline: string;
  urgency: "low" | "medium" | "high";
  responseCount: number;
  isPublic: boolean;
  createdAt: string;
  onClick?: () => void;
}

export function RFQCard({
  title,
  description,
  category,
  budget,
  deadline,
  urgency,
  responseCount,
  isPublic,
  createdAt,
  onClick,
}: RFQCardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === "high") {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return <Clock className="h-3 w-3" />;
  };

  return (
    <Card 
      className="rounded-medical-md shadow-soft hover:shadow-medical transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-sm">
        <div className="flex items-start justify-between gap-md">
          <div className="space-y-xs flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-medical-xs">
                {category}
              </Badge>
              <Badge 
                variant={getUrgencyColor(urgency) as any} 
                className="text-medical-xs"
              >
                {getUrgencyIcon(urgency)}
                {urgency} priority
              </Badge>
            </div>
            <h3 className="font-semibold text-heading text-medical-lg line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          {!isPublic && (
            <Badge variant="secondary" className="text-medical-xs shrink-0">
              Private
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-md">
        <p className="text-body text-medical-sm line-clamp-3 leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-sm">
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Budget: {budget}</span>
          </div>
          
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Deadline: {deadline}</span>
          </div>
          
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>{responseCount} responses</span>
          </div>
        </div>
        
        <div className="text-muted-foreground text-medical-sm">
          Posted {createdAt}
        </div>
        
        <div className="pt-sm">
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              // Handle submit quote
            }}
          >
            Submit Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}