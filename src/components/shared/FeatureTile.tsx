import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureTileProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureTile({ icon, title, description, className }: FeatureTileProps) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-medical-md p-xl shadow-soft hover:shadow-medical transition-all group cursor-pointer",
      className
    )}>
      <div className="space-y-lg">
        <div className="w-12 h-12 bg-sky rounded-medical-md flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="space-y-sm">
          <h3 className="text-heading font-semibold text-medical-lg">{title}</h3>
          <p className="text-body text-medical-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}