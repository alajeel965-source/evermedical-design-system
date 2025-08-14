import { Check, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  ctaText?: string;
  onSelect?: () => void;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  isPopular = false,
  isCurrentPlan = false,
  ctaText = "Get Started",
  onSelect,
}: PricingCardProps) {
  return (
    <Card 
      className={`rounded-medical-md shadow-soft hover:shadow-medical transition-all duration-300 relative ${
        isPopular ? "border-primary shadow-medical-lg" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-sm">
        <CardTitle className="text-heading text-medical-2xl">{title}</CardTitle>
        <div className="mt-sm">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-heading font-bold text-medical-4xl">{price}</span>
            <span className="text-muted-foreground text-medical-sm">/{period}</span>
          </div>
          <p className="text-body text-medical-sm mt-2">{description}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-lg">
        <div className="space-y-sm">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span className="text-body text-medical-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-lg">
          <Button
            className="w-full"
            variant={isPopular ? "default" : "outline"}
            disabled={isCurrentPlan}
            onClick={onSelect}
          >
            {isCurrentPlan ? "Current Plan" : ctaText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}