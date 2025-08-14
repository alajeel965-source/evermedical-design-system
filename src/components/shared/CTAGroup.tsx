import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTAGroupProps {
  primaryText?: string;
  secondaryText?: string;
  tertiaryText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onTertiaryClick?: () => void;
  className?: string;
}

export function CTAGroup({
  primaryText = "Post an RFQ",
  secondaryText = "Explore Marketplace", 
  tertiaryText = "Upcoming CME Events",
  onPrimaryClick,
  onSecondaryClick,
  onTertiaryClick,
  className
}: CTAGroupProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-md ${className || ""}`}>
      <Button 
        variant="hero" 
        size="xl" 
        onClick={onPrimaryClick}
        className="hover-scale"
      >
        {primaryText}
        <ArrowRight className="h-5 w-5" />
      </Button>
      <Button 
        variant="hero-secondary" 
        size="xl"
        onClick={onSecondaryClick}
        className="hover-scale"
      >
        {secondaryText}
      </Button>
      <Button 
        variant="hero-ghost" 
        size="xl"
        onClick={onTertiaryClick}
        className="hover-scale"
      >
        {tertiaryText}
      </Button>
    </div>
  );
}