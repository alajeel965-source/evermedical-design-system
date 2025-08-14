import { cn } from "@/lib/utils";

interface StatPillProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatPill({ label, value, trend = "neutral", className }: StatPillProps) {
  const trendColors = {
    up: "text-success",
    down: "text-destructive", 
    neutral: "text-body"
  };

  return (
    <div className={cn(
      "bg-card border border-border rounded-medical-md p-lg shadow-soft hover:shadow-medical transition-all",
      className
    )}>
      <div className="text-center space-y-sm">
        <p className="text-muted text-medical-sm font-medium">{label}</p>
        <p className={cn("text-medical-2xl font-bold", trendColors[trend])}>
          {value}
        </p>
      </div>
    </div>
  );
}