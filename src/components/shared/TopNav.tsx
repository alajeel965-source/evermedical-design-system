import { Search, Globe, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  language?: "en" | "ar";
  onLanguageChange?: (lang: "en" | "ar") => void;
}

export function TopNav({ language = "en", onLanguageChange }: TopNavProps) {
  const isRTL = language === "ar";

  return (
    <header className={`w-full bg-background border-b border-border sticky top-0 z-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-lg">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-lg">
            <div className="flex items-center space-x-sm">
              <div className="w-8 h-8 bg-primary rounded-medical-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">E</span>
              </div>
              <span className="text-heading font-semibold text-medical-lg">EverMedical</span>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-lg">
            <Button variant="ghost" className="text-body hover:text-heading">
              Marketplace
            </Button>
            <Button variant="ghost" className="text-body hover:text-heading">
              Events
            </Button>
            <Button variant="ghost" className="text-body hover:text-heading">
              Networking
            </Button>
            <Button variant="ghost" className="text-body hover:text-heading">
              Live RFQs
            </Button>
          </nav>

          {/* Search & Controls */}
          <div className="flex items-center space-x-md">
            {/* Search with Filters */}
            <div className="hidden lg:flex items-center space-x-sm bg-surface rounded-medical-sm p-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-sm top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  placeholder="Search medical equipment, suppliers..."
                  className="pl-10 border-0 bg-transparent focus:ring-0 text-body"
                />
              </div>
              <Badge variant="secondary" className="flex items-center space-x-1 bg-primary/10 text-primary hover:bg-primary/20">
                <Filter className="h-3 w-3" />
                <span>Filters</span>
              </Badge>
            </div>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Globe className="h-4 w-4" />
                  <span className="text-body uppercase">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem 
                  onClick={() => onLanguageChange?.("en")}
                  className={language === "en" ? "bg-accent" : ""}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onLanguageChange?.("ar")}
                  className={language === "ar" ? "bg-accent" : ""}
                >
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Dashboard</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}