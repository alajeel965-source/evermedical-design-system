import { useState } from "react";
import { Calendar, MapPin, Users, Award, Clock, Phone, Mail, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SafeEventData, getOrganizerContactInfo, canAccessOrganizerData, type OrganizerContactInfo } from "@/lib/secureEventApi";
import { useAuth } from "@/hooks/auth";

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
  const { user } = useAuth();
  const [contactInfo, setContactInfo] = useState<OrganizerContactInfo | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  const isAlmostFull = event.registered_count && event.capacity 
    ? event.registered_count / event.capacity > 0.8 
    : false;
  const isFull = event.registered_count && event.capacity 
    ? event.registered_count >= event.capacity 
    : false;

  const handleLoadContactInfo = async () => {
    if (!user) return;
    
    setLoadingContact(true);
    
    try {
      // First check if user can access this data
      const hasAccess = await canAccessOrganizerData(event.id);
      setCanAccess(hasAccess);
      
      if (hasAccess) {
        const { data, error } = await getOrganizerContactInfo(event.id);
        if (data && data.length > 0) {
          setContactInfo(data[0]);
        } else if (error) {
          console.error('Failed to load contact info:', error);
        }
      }
    } catch (error) {
      console.error('Error loading organizer contact info:', error);
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

        {/* Secure Contact Information Section */}
        {showContactInfo && user && (
          <div className="border-t pt-md">
            {!contactInfo && canAccess === null && (
              <Button
                variant="outline" 
                size="sm"
                onClick={handleLoadContactInfo}
                disabled={loadingContact}
                className="w-full"
              >
                {loadingContact ? 'Loading...' : 'Show Contact Information'}
              </Button>
            )}

            {canAccess === false && (
              <Alert>
                <AlertDescription>
                  You don't have permission to view organizer contact information for this event.
                  Only event creators and verified admins can access this data.
                </AlertDescription>
              </Alert>
            )}

            {contactInfo && (
              <div className="space-y-sm bg-muted rounded-medical-sm p-sm">
                <div className="text-medical-sm font-medium text-muted-foreground">
                  Organizer Contact (Restricted Access)
                </div>
                
                {contactInfo.organizer_email && (
                  <div className="flex items-center gap-2 text-medical-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <a 
                      href={`mailto:${contactInfo.organizer_email}`}
                      className="text-primary hover:underline"
                    >
                      {contactInfo.organizer_email}
                    </a>
                  </div>
                )}
                
                {contactInfo.organizer_phone && (
                  <div className="flex items-center gap-2 text-medical-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <a 
                      href={`tel:${contactInfo.organizer_phone}`}
                      className="text-primary hover:underline"
                    >
                      {contactInfo.organizer_phone}
                    </a>
                  </div>
                )}

                {contactInfo.moderation_flags && contactInfo.moderation_flags.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      This event has moderation flags: {contactInfo.moderation_flags.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
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