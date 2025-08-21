import { useState } from "react";
import { Calendar, MapPin, Users, Award, Clock, Phone, Mail, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SafeEventData, getSafeOrganizerDisplay, canAccessOrganizerData, type SafeOrganizerDisplay } from "@/lib/secureEventApi";
import { useAuth } from "@/hooks/auth";
import { ContactInfoBlur } from "@/components/shared/BlurredText";

interface SecureEventCardProps {
  event: SafeEventData;
  showContactInfo?: boolean;
  onClick?: () => void;
}

export function SecureEventCard({ 
  event, 
  showContactInfo = false,
  onClick 
}: SecureEventCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [organizerDisplay, setOrganizerDisplay] = useState<SafeOrganizerDisplay | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactRequested, setContactRequested] = useState(false);

  const isAlmostFull = event.registered_count && event.capacity 
    ? event.registered_count / event.capacity > 0.8 
    : false;
  const isFull = event.registered_count && event.capacity 
    ? event.registered_count >= event.capacity 
    : false;

  const handleLoadContactInfo = async (includeSensitive: boolean = false) => {
    setLoadingContact(true);
    
    try {
      const { data, error } = await getSafeOrganizerDisplay(event.id, includeSensitive);
      if (data) {
        setOrganizerDisplay(data);
        setContactRequested(true);
      } else if (error) {
        console.error('Failed to load organizer display:', error);
      }
    } catch (error) {
      console.error('Error loading organizer display:', error);
    } finally {
      setLoadingContact(false);
    }
  };

  return (
    <Card className="rounded-medical-md shadow-soft hover:shadow-medical transition-all duration-300 group cursor-pointer">
      <CardHeader className="pb-sm">
        <div className="flex items-start justify-between gap-md">
          <div className="space-y-xs">
            <Badge variant="outline" className="text-medical-xs">
              {event.specialty_slug?.replace('-', ' ').toUpperCase() || 'General'}
            </Badge>
            <h3 
              className="font-semibold text-heading text-medical-lg line-clamp-2 group-hover:text-primary transition-colors"
              onClick={onClick}
            >
              {event.title}
            </h3>
          </div>
          {event.has_cme && event.cme_hours && (
            <Badge variant="default" className="bg-warning text-medical-xs shrink-0">
              <Award className="h-3 w-3 mr-1" />
              {event.cme_hours} CME
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-md">
        <div className="space-y-sm">
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(event.start_date).toLocaleDateString()}</span>
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <span>{new Date(event.start_date).toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.format === 'virtual' ? 'Virtual Event' : 
               event.format === 'hybrid' ? `${event.venue_name || event.city} + Virtual` :
               event.venue_name || event.city || 'TBD'}
            </span>
          </div>
          
          {event.registered_count !== undefined && event.capacity && (
            <div className="flex items-center gap-2 text-body text-medical-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{event.registered_count} / {event.capacity} attendees</span>
              {isAlmostFull && !isFull && (
                <Badge variant="warning" className="text-medical-xs">
                  Almost Full
                </Badge>
              )}
              {isFull && (
                <Badge variant="destructive" className="text-medical-xs">
                  Full
                </Badge>
              )}
            </div>
          )}
        </div>

        {event.organizer && (
          <div className="bg-muted rounded-medical-sm p-sm">
            <div className="text-medical-sm text-muted-foreground mb-xs">Organized by</div>
            <div className="font-medium text-medical-sm">{event.organizer}</div>
            {event.organizer_website && (
              <div className="flex items-center gap-1 mt-xs">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <a 
                  href={event.organizer_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-medical-xs"
                >
                  Website
                </a>
              </div>
            )}
          </div>
        )}

        {/* Secure Contact Information Section with Blurring */}
        {showContactInfo && (
          <div className="border-t pt-md">
            {!organizerDisplay && (
              <Button
                variant="outline" 
                size="sm"
                onClick={() => handleLoadContactInfo(false)}
                disabled={loadingContact}
                className="w-full"
              >
                {loadingContact ? 'Loading...' : 'Show Contact Information'}
              </Button>
            )}

            {organizerDisplay && (
              <ContactInfoBlur
                email={organizerDisplay.organizer_email_masked}
                phone={organizerDisplay.organizer_phone_masked}
                website={organizerDisplay.organizer_website}
                isAuthorized={organizerDisplay.can_access_full_contact}
                canRequestAccess={isAuthenticated && !organizerDisplay.can_access_full_contact}
                onRequestAccess={() => handleLoadContactInfo(true)}
                loading={loadingContact}
              />
            )}
          </div>
        )}
        
        {event.registration_deadline && (
          <div className="text-muted-foreground text-medical-sm">
            Registration closes: {new Date(event.registration_deadline).toLocaleDateString()}
          </div>
        )}
        
        <div className="pt-sm">
          <Button
            className="w-full"
            variant={event.registered_count ? "secondary" : "default"}
            disabled={isFull}
            onClick={(e) => {
              e.stopPropagation();
              if (event.registration_url) {
                window.open(event.registration_url, '_blank');
              }
            }}
          >
            {isFull ? "Full" : "Register"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}