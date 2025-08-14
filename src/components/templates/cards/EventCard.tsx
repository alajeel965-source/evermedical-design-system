import { Calendar, MapPin, Users, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  attendeeCount: number;
  maxAttendees: number;
  cmeCredits?: number;
  category: string;
  isRegistered?: boolean;
  registrationDeadline?: string;
  onClick?: () => void;
}

export function EventCard({
  title,
  date,
  time,
  location,
  isVirtual,
  attendeeCount,
  maxAttendees,
  cmeCredits,
  category,
  isRegistered = false,
  registrationDeadline,
  onClick,
}: EventCardProps) {
  const isAlmostFull = attendeeCount / maxAttendees > 0.8;
  const isFull = attendeeCount >= maxAttendees;

  return (
    <Card 
      className="rounded-medical-md shadow-soft hover:shadow-medical transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-sm">
        <div className="flex items-start justify-between gap-md">
          <div className="space-y-xs">
            <Badge variant="outline" className="text-medical-xs">
              {category}
            </Badge>
            <h3 className="font-semibold text-heading text-medical-lg line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          {cmeCredits && (
            <Badge variant="default" className="bg-warning text-medical-xs shrink-0">
              <Award className="h-3 w-3 mr-1" />
              {cmeCredits} CME
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-md">
        <div className="space-y-sm">
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{date}</span>
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <span>{time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{isVirtual ? "Virtual Event" : location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{attendeeCount} / {maxAttendees} attendees</span>
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
        </div>
        
        {registrationDeadline && (
          <div className="text-muted-foreground text-medical-sm">
            Registration closes: {registrationDeadline}
          </div>
        )}
        
        <div className="pt-sm">
          <Button
            className="w-full"
            variant={isRegistered ? "secondary" : "default"}
            disabled={isFull && !isRegistered}
            onClick={(e) => {
              e.stopPropagation();
              // Handle registration
            }}
          >
            {isRegistered ? "Registered" : isFull ? "Full" : "Register"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}