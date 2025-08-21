import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlurredTextProps {
  text: string;
  isBlurred?: boolean;
  canReveal?: boolean;
  onReveal?: () => void;
  className?: string;
  maskPattern?: 'email' | 'phone' | 'custom';
  icon?: React.ReactNode;
}

export function BlurredText({ 
  text, 
  isBlurred = false,
  canReveal = false,
  onReveal,
  className,
  maskPattern = 'custom',
  icon
}: BlurredTextProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (canReveal && onReveal) {
      onReveal();
      setRevealed(true);
    }
  };

  const getMaskedText = () => {
    if (!isBlurred || revealed) return text;
    
    switch (maskPattern) {
      case 'email':
        return text.includes('@') 
          ? `${text.slice(0, 2)}***@${text.split('@')[1]}`
          : '***@***.***';
      case 'phone':
        return text.length > 3 
          ? `${text.slice(0, 3)}-***-****`
          : '***-***-****';
      default:
        return '***';
    }
  };

  const shouldShowBlurred = isBlurred && !revealed;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon}
      <span 
        className={cn(
          "transition-all duration-300",
          shouldShowBlurred && "filter blur-sm text-muted-foreground"
        )}
      >
        {getMaskedText()}
      </span>
      
      {shouldShowBlurred && (
        <>
          <Lock className="h-3 w-3 text-muted-foreground" />
          {canReveal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReveal}
              className="h-auto p-1 text-xs"
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

interface ContactInfoBlurProps {
  email?: string;
  phone?: string;
  website?: string;
  isAuthorized: boolean;
  canRequestAccess?: boolean;
  onRequestAccess?: () => void;
  loading?: boolean;
}

export function ContactInfoBlur({ 
  email, 
  phone, 
  website,
  isAuthorized,
  canRequestAccess = false,
  onRequestAccess,
  loading = false
}: ContactInfoBlurProps) {
  const handleRequestAccess = () => {
    if (canRequestAccess && onRequestAccess) {
      onRequestAccess();
    }
  };

  return (
    <div className="space-y-sm bg-muted/50 rounded-medical-sm p-sm border">
      <div className="flex items-center justify-between">
        <div className="text-medical-sm font-medium text-muted-foreground">
          Organizer Contact
        </div>
        {!isAuthorized && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Protected</span>
          </div>
        )}
      </div>
      
      {email && (
        <BlurredText
          text={email}
          isBlurred={!isAuthorized}
          maskPattern="email"
          icon={<div className="h-3 w-3" />}
          className="text-medical-sm"
        />
      )}
      
      {phone && (
        <BlurredText
          text={phone}
          isBlurred={!isAuthorized}
          maskPattern="phone"
          icon={<div className="h-3 w-3" />}
          className="text-medical-sm"
        />
      )}
      
      {website && (
        <div className="flex items-center gap-2 text-medical-sm">
          <div className="h-3 w-3" />
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Website
          </a>
        </div>
      )}

      {!isAuthorized && canRequestAccess && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRequestAccess}
          disabled={loading}
          className="w-full mt-sm"
        >
          {loading ? 'Loading...' : 'Request Access'}
        </Button>
      )}
      
      {!isAuthorized && !canRequestAccess && (
        <div className="text-xs text-muted-foreground mt-sm p-2 bg-warning/10 rounded border border-warning/20">
          Contact information is only available to verified users and event creators.
        </div>
      )}
    </div>
  );
}