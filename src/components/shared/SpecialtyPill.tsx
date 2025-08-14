import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSpecialtyBySlug } from "@/lib/specialties";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SpecialtyPillProps {
  specialtySlug: string;
  variant?: "default" | "secondary" | "outline";
  showTooltip?: boolean;
  className?: string;
}

export const SpecialtyPill = ({ 
  specialtySlug, 
  variant = "secondary", 
  showTooltip = true,
  className = ""
}: SpecialtyPillProps) => {
  const { locale } = useTranslation();
  const specialty = getSpecialtyBySlug(specialtySlug);

  if (!specialty) {
    return (
      <Badge variant="outline" className={className}>
        {specialtySlug}
      </Badge>
    );
  }

  const displayName = locale === 'ar' ? specialty.arabic : specialty.name;
  const code = specialty.code;

  const pillContent = (
    <Badge 
      variant={variant} 
      className={`font-medium ${className}`}
      data-analytics="specialty-pill-view"
    >
      {code}
    </Badge>
  );

  if (!showTooltip) {
    return pillContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {pillContent}
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <p className="font-medium">{displayName}</p>
          {specialty.synonyms.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {specialty.synonyms.join(', ')}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};