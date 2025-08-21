import { useState } from "react";
import { Clock, MessageSquare, AlertTriangle, DollarSign, Lock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSafeRfqDisplay, type SafeRfqDisplay } from "@/lib/secureRfqApi";
import { RFQBlurredContent } from "@/components/shared/RFQBlurredContent";
import { useAuth } from "@/hooks/auth";

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
  id,
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
  const { user, isAuthenticated } = useAuth();
  const [secureDisplay, setSecureDisplay] = useState<SafeRfqDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadRequested, setLoadRequested] = useState(false);

  const handleLoadSecureData = async (includeSensitive: boolean = false) => {
    setLoading(true);
    try {
      const { data, error } = await getSafeRfqDisplay(id, includeSensitive);
      if (data) {
        setSecureDisplay(data);
        setLoadRequested(true);
      } else if (error) {
        console.error('Failed to load secure RFQ data:', error);
      }
    } catch (error) {
      console.error('Error loading secure RFQ data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use secure data if available, otherwise fall back to props
  const displayTitle = secureDisplay?.title || title;
  const displayDescription = secureDisplay?.description_masked || description;
  const displayBudget = secureDisplay?.budget_range_masked || budget;
  const isAuthorized = secureDisplay?.can_access_full_details ?? false;
  const isBuyer = secureDisplay?.is_buyer ?? false;
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
        {/* Load secure data if authenticated and not already loaded */}
        {!loadRequested && isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadSecureData(false);
            }}
            disabled={loading}
            className="w-full mb-md"
          >
            {loading ? 'Loading secure data...' : 'Load RFQ Details'}
          </Button>
        )}

        {/* Use blurred content for sensitive information */}
        {loadRequested && secureDisplay ? (
          <RFQBlurredContent
            title={displayTitle}
            description={displayDescription}
            budgetRange={displayBudget}
            isAuthorized={isAuthorized}
            isBuyer={isBuyer}
            canRequestAccess={isAuthenticated && !isAuthorized}
            onRequestAccess={() => handleLoadSecureData(true)}
            loading={loading}
          />
        ) : (
          <>
            <div className="space-y-sm">
              {!isAuthenticated && (
                <div className="bg-warning/10 border border-warning/20 rounded-medical-sm p-sm mb-sm">
                  <div className="flex items-center gap-2 text-warning text-medical-sm">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Authentication Required</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Sign in to view RFQ budget and detailed requirements.
                  </div>
                </div>
              )}
              
              <p className="text-body text-medical-sm line-clamp-3 leading-relaxed">
                {isAuthenticated ? displayDescription : 'RFQ details available after sign in...'}
              </p>
            </div>
          </>
        )}
        
        <div className="space-y-sm">
          {(isAuthenticated || !loadRequested) && (
            <div className="flex items-center gap-2 text-body text-medical-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                Budget: {isAuthenticated ? displayBudget : '[Protected from competitors]'}
              </span>
              {!isAuthenticated && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
          )}
          
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
            disabled={!isAuthenticated}
          >
            {isAuthenticated ? 'Submit Quote' : 'Sign in to Quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}