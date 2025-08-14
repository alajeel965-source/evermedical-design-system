import { ReactNode } from "react";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
  confirmNavigation?: boolean;
}

export function ExternalLink({ 
  href, 
  children, 
  className, 
  showIcon = true,
  confirmNavigation = false 
}: ExternalLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (confirmNavigation) {
      const confirmed = window.confirm(
        `You are about to leave EverMedical and navigate to:\n${href}\n\nDo you want to continue?`
      );
      if (!confirmed) {
        e.preventDefault();
        return;
      }
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 text-primary hover:text-primary-light transition-colors",
        className
      )}
      aria-label={`${children} (opens in new tab)`}
    >
      {children}
      {showIcon && (
        <ExternalLinkIcon 
          className="h-3 w-3 flex-shrink-0" 
          aria-hidden="true"
        />
      )}
    </a>
  );
}