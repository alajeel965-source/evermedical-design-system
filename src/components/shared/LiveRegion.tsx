import { useEffect, useRef } from "react";

interface LiveRegionProps {
  message: string;
  level?: "polite" | "assertive" | "off";
  clearDelay?: number;
}

export function LiveRegion({ 
  message, 
  level = "polite", 
  clearDelay = 3000 
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set the message
      regionRef.current.textContent = message;

      // Clear message after delay
      if (clearDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          if (regionRef.current) {
            regionRef.current.textContent = "";
          }
        }, clearDelay);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearDelay]);

  return (
    <div
      ref={regionRef}
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    />
  );
}