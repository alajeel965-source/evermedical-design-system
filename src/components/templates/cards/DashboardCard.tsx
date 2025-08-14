import { TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    isPositive: boolean;
  };
  description?: string;
  chart?: React.ReactNode;
  actions?: Array<{ label: string; onClick: () => void }>;
}

export function DashboardCard({
  title,
  value,
  change,
  description,
  chart,
  actions,
}: DashboardCardProps) {
  return (
    <Card className="rounded-medical-md shadow-soft hover:shadow-medical transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-medical-base font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {actions && actions.length > 0 && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-md">
        <div className="space-y-sm">
          <div className="text-heading font-bold text-medical-3xl">{value}</div>
          
          {change && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={change.isPositive ? "secondary" : "destructive"}
                className="text-medical-xs"
              >
                {change.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {change.isPositive ? "+" : ""}{change.value}%
              </Badge>
              <span className="text-muted-foreground text-medical-sm">
                vs {change.period}
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-body text-medical-sm">{description}</p>
          )}
        </div>
        
        {chart && (
          <div className="mt-lg">
            {chart}
          </div>
        )}
      </CardContent>
    </Card>
  );
}