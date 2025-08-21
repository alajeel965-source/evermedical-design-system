import { useState } from "react";
import { Eye, Lock, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RFQBlurredContentProps {
  title: string;
  description: string;
  budgetRange?: string;
  isAuthorized: boolean;
  isBuyer: boolean;
  canRequestAccess?: boolean;
  onRequestAccess?: () => void;
  loading?: boolean;
  className?: string;
}

export function RFQBlurredContent({ 
  title,
  description,
  budgetRange,
  isAuthorized,
  isBuyer,
  canRequestAccess = false,
  onRequestAccess,
  loading = false,
  className
}: RFQBlurredContentProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (canRequestAccess && onRequestAccess) {
      onRequestAccess();
      setRevealed(true);
    }
  };

  const getAccessLevelBadge = () => {
    if (isBuyer) {
      return <Badge variant="default" className="text-xs"><Users className="h-3 w-3 mr-1" />Owner</Badge>;
    }
    if (isAuthorized) {
      return <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" />Verified Supplier</Badge>;
    }
    return <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />Restricted</Badge>;
  };

  return (
    <div className={cn("space-y-md", className)}>
      <div className="flex items-start justify-between gap-md">
        <h3 className="font-semibold text-heading text-medical-lg line-clamp-2">
          {title}
        </h3>
        {getAccessLevelBadge()}
      </div>
      
      {/* Description with blurring */}
      <div className="space-y-sm">
        <div className="text-medical-sm font-medium text-muted-foreground">
          Requirements
        </div>
        <div 
          className={cn(
            "text-medical-sm text-body transition-all duration-300",
            !isAuthorized && !revealed && "filter blur-sm"
          )}
        >
          {description}
        </div>
        
        {!isAuthorized && !revealed && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Detailed requirements require verification</span>
            {canRequestAccess && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReveal}
                disabled={loading}
                className="h-auto p-1 text-xs ml-2"
              >
                <Eye className="h-3 w-3 mr-1" />
                {loading ? 'Loading...' : 'Request Access'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Budget with masking */}
      {budgetRange && (
        <div className="space-y-sm">
          <div className="text-medical-sm font-medium text-muted-foreground">
            Budget Range
          </div>
          <div 
            className={cn(
              "text-medical-sm font-semibold transition-all duration-300",
              !isAuthorized && !revealed && "filter blur-sm"
            )}
          >
            {budgetRange}
          </div>
          
          {!isAuthorized && !revealed && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Budget details protected from competitors</span>
            </div>
          )}
        </div>
      )}

      {/* Access Requirements Notice */}
      {!isAuthorized && (
        <div className="bg-warning/10 border border-warning/20 rounded-medical-sm p-sm">
          <div className="flex items-center gap-2 text-warning text-medical-sm">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Verification Required</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Full RFQ details are only available to verified suppliers to prevent competitive intelligence gathering.
          </div>
        </div>
      )}

      {isAuthorized && !isBuyer && (
        <div className="bg-success/10 border border-success/20 rounded-medical-sm p-sm">
          <div className="flex items-center gap-2 text-success text-medical-sm">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Verified Supplier Access</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            You have access to view this RFQ as a verified supplier.
          </div>
        </div>
      )}
    </div>
  );
}