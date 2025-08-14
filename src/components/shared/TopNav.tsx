import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, ChevronDown, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface TopNavProps {
  language?: "en" | "ar";
  onLanguageChange?: (lang: "en" | "ar") => void;
}

export function TopNav({ language = "en", onLanguageChange }: TopNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isRTL = language === "ar";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/marketplace", label: language === "en" ? "Marketplace" : "السوق" },
    { href: "/events", label: language === "en" ? "Events" : "الأحداث" },
    { href: "/networking", label: language === "en" ? "Networking" : "التواصل" },
    { href: "/rfqs", label: language === "en" ? "Live RFQs" : "طلبات التسعير" },
  ];

  const isActiveLink = (href: string) => location.pathname === href;

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300",
      isScrolled 
        ? "bg-background/80 backdrop-blur-md shadow-soft" 
        : "bg-background"
    )}>
      <div className="container mx-auto">
        <div className={cn(
          "flex h-16 items-center justify-between px-lg",
          isRTL && "flex-row-reverse"
        )}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-sm font-bold text-medical-xl text-primary">
            <div className="w-8 h-8 bg-primary rounded-medical-sm flex items-center justify-center text-primary-foreground text-medical-sm font-bold">
              EM
            </div>
            <span className={cn(isRTL && "hidden sm:block")}>
              {language === "en" ? "EverMedical" : "إيفرميديكال"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-medical-sm font-medium transition-colors hover:text-primary",
                  isActiveLink(link.href) 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-body"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search & Controls */}
          <div className="flex items-center space-x-md">
            {/* Search with Filters - Desktop */}
            <div className="hidden md:flex items-center space-x-sm bg-surface rounded-medical-sm p-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="absolute left-sm top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  placeholder={language === "en" ? "Search medical equipment..." : "البحث عن المعدات الطبية..."}
                  className="pl-10 border-0 bg-transparent focus:ring-0 text-body"
                />
              </div>
              <Badge variant="secondary" shape="pill" className="flex items-center space-x-1 bg-primary/10 text-primary hover:bg-primary/20">
                <Filter className="h-3 w-3" />
                <span>{language === "en" ? "Filters" : "المرشحات"}</span>
              </Badge>
            </div>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {language === "en" ? "EN" : "العربية"}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onLanguageChange?.("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange?.("ar")}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
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
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  {language === "en" ? "Profile" : "الملف الشخصي"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  {language === "en" ? "Settings" : "الإعدادات"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  {language === "en" ? "Logout" : "تسجيل الخروج"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"}>
              <div className="flex flex-col space-y-lg mt-lg">
                <div className="flex items-center space-x-sm">
                  <div className="w-8 h-8 bg-primary rounded-medical-sm flex items-center justify-center text-primary-foreground text-medical-sm font-bold">
                    EM
                  </div>
                  <span className="font-bold text-medical-xl text-primary">
                    {language === "en" ? "EverMedical" : "إيفرميديكال"}
                  </span>
                </div>
                
                <div className="border-t pt-lg">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "block py-sm text-medical-base font-medium transition-colors hover:text-primary",
                        isActiveLink(link.href) ? "text-primary" : "text-body"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t pt-lg space-y-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
                    <Input 
                      placeholder={language === "en" ? "Search medical equipment..." : "البحث عن المعدات الطبية..."}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    {language === "en" ? "Filters" : "المرشحات"}
                  </Button>
                </div>

                <div className="border-t pt-lg space-y-sm">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => onLanguageChange?.(language === "en" ? "ar" : "en")}
                  >
                    {language === "en" ? "العربية" : "English"}
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    {language === "en" ? "Settings" : "الإعدادات"}
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === "en" ? "Logout" : "تسجيل الخروج"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}