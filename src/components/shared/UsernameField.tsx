import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function UsernameField({ value, onChange, required = false, className }: UsernameFieldProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");

  const validateUsername = (username: string): string | null => {
    if (!username) return null;
    
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 30) return "Username must be 30 characters or less";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
    if (username.includes("__")) return "Username cannot contain consecutive underscores";
    
    return null;
  };

  const checkAvailability = async (username: string) => {
    if (!username || validateUsername(username)) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const { data, error } = await supabase.rpc('is_username_available', {
        username_input: username
      });

      if (error) throw error;
      setIsAvailable(data);
    } catch (err) {
      console.error('Error checking username availability:', err);
      setError("Unable to check availability");
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const validationError = validateUsername(value);
    if (validationError) {
      setError(validationError);
      setIsAvailable(null);
      return;
    }

    if (value) {
      const timeoutId = setTimeout(() => {
        checkAvailability(value);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
      setError("");
    }
  }, [value]);

  const getStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin text-muted" />;
    if (error) return <XCircle className="h-4 w-4 text-destructive" />;
    if (isAvailable === true) return <CheckCircle className="h-4 w-4 text-success" />;
    if (isAvailable === false) return <XCircle className="h-4 w-4 text-destructive" />;
    return null;
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (isAvailable === true) return "Username is available";
    if (isAvailable === false) return "Username is already taken";
    return "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="username">
        Username {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Input
          id="username"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="Enter your username"
          className={cn(
            "pr-10",
            error && "border-destructive",
            isAvailable === true && "border-success",
            isAvailable === false && "border-destructive"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      
      {(error || isAvailable !== null) && (
        <p className={cn(
          "text-sm",
          error || isAvailable === false ? "text-destructive" : "text-success"
        )}>
          {getStatusMessage()}
        </p>
      )}
      
      <p className="text-xs text-muted">
        Your username will be visible to other users and can be used to find your profile.
        Use 3-30 characters: letters, numbers, and underscores only.
      </p>
    </div>
  );
}