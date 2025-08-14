import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-xl text-center space-y-lg",
      className
    )}>
      {icon && (
        <div className="w-16 h-16 bg-muted rounded-medical-md flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      
      <div className="space-y-sm max-w-md">
        <h3 className="text-heading font-semibold text-medical-lg">
          {title}
        </h3>
        {description && (
          <p className="text-body text-medical-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="pt-sm">
          {action}
        </div>
      )}
    </div>
  );
}