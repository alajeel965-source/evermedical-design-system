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
      "bg-card border border-border/50 rounded-2xl p-xl shadow-medical-lg hover:shadow-medical-xl transition-all duration-300 group cursor-pointer",
      className
    )}>
      <div className="space-y-lg">
        <div className="w-12 h-12 bg-sky/10 border border-sky/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-sky/20 transition-all duration-300">
          {icon}
        </div>
        <div className="space-y-sm">
          <h3 className="text-heading font-semibold text-medical-lg group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-body text-medical-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}