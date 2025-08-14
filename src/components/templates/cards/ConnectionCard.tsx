import { MapPin, Building, Users, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConnectionCardProps {
  id: string;
  name: string;
  specialty: string;
  institution: string;
  location: string;
  avatar?: string;
  mutualConnections: number;
  isConnected: boolean;
  connectionStatus?: "pending" | "connected" | "not_connected";
  onClick?: () => void;
}

export function ConnectionCard({
  name,
  specialty,
  institution,
  location,
  avatar,
  mutualConnections,
  isConnected,
  connectionStatus = "not_connected",
  onClick,
}: ConnectionCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getConnectionButton = () => {
    switch (connectionStatus) {
      case "pending":
        return (
          <Button variant="outline" size="sm" disabled className="w-full">
            Pending
          </Button>
        );
      case "connected":
        return (
          <Button variant="outline" size="sm" className="w-full">
            <MessageCircle className="h-4 w-4 mr-1" />
            Message
          </Button>
        );
      default:
        return (
          <Button size="sm" className="w-full">
            Connect
          </Button>
        );
    }
  };

  return (
    <Card 
      className="rounded-medical-md shadow-soft hover:shadow-medical transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-sm">
        <div className="flex items-start gap-md">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-heading text-medical-base truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <Badge variant="outline" className="text-medical-xs mt-1">
              {specialty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-md">
        <div className="space-y-sm">
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <Building className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{institution}</span>
          </div>
          
          <div className="flex items-center gap-2 text-body text-medical-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          {mutualConnections > 0 && (
            <div className="flex items-center gap-2 text-body text-medical-sm">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{mutualConnections} mutual connections</span>
            </div>
          )}
        </div>
        
        <div className="pt-sm">
          <div
            onClick={(e) => {
              e.stopPropagation();
              // Handle connection action
            }}
          >
            {getConnectionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}