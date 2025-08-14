import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log error only in development, use proper error reporting in production
    if (process.env.NODE_ENV === 'development') {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
    // In production, send to error reporting service:
    // errorReportingService.track('404_error', { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="max-w-md mx-auto text-center p-xl">
        <AlertCircle className="h-16 w-16 text-muted mx-auto mb-lg" />
        <h1 className="text-heading font-bold text-medical-4xl mb-md">404</h1>
        <h2 className="text-heading font-semibold text-medical-xl mb-md">Page Not Found</h2>
        <p className="text-body text-medical-base mb-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
