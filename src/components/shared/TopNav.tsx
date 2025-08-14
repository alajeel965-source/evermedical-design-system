import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, ChevronDown, User, LogOut, Settings, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useI18n, useTranslation } from "@/lib/i18n";

export function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, isRTL } = useI18n();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/marketplace", label: t("common.navigation.marketplace") },
    { href: "/events", label: t("common.navigation.events") },
    { href: "/networking", label: t("common.navigation.networking") },
    { href: "/rfqs", label: t("common.navigation.rfqs") },
    { href: "/pricing", label: t("common.navigation.pricing") },
    { href: "/dashboards", label: t("common.navigation.dashboards") }
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
          <Link to="/" className={cn(
            "flex items-center font-bold text-medical-xl text-primary",
            isRTL ? "space-x-reverse space-x-sm" : "space-x-sm"
          )}>
            <div className="w-8 h-8 bg-primary rounded-medical-sm flex items-center justify-center text-primary-foreground text-medical-sm font-bold">
              EM
            </div>
            <span className={cn(isRTL && "hidden sm:block")}>
              {language === "en" ? "EverMedical" : "إيفرميديكال"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={cn(
            "hidden lg:flex items-center",
            isRTL ? "space-x-reverse space-x-lg" : "space-x-lg"
          )}>
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
          <div className={cn(
            "flex items-center",
            isRTL ? "space-x-reverse space-x-md" : "space-x-md"
          )}>
            {/* Search with Filters - Desktop */}
            <div className="hidden md:flex items-center bg-surface rounded-medical-sm p-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted",
                  isRTL ? "right-sm" : "left-sm"
                )} />
                <Input
                  placeholder={t("pages.marketplace.searchPlaceholder")}
                  className={cn(
                    "border-0 bg-transparent focus:ring-0 text-body",
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                />
              </div>
              <Badge variant="secondary" shape="pill" className={cn(
                "flex items-center bg-primary/10 text-primary hover:bg-primary/20",
                isRTL ? "space-x-reverse space-x-1" : "space-x-1"
              )}>
                <Filter className="h-3 w-3" />
                <span>{t("common.buttons.filter")}</span>
              </Badge>
            </div>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn(
                  "flex items-center",
                  isRTL ? "space-x-reverse space-x-1" : "space-x-1"
                )}>
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:block">{language === "en" ? "EN" : "العربية"}</span>
                  <ChevronDown className={cn("h-3 w-3", isRTL && "rotate-180")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  <span className={isRTL ? "ml-2" : "mr-2"}>🇺🇸</span>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ar")}>
                  <span className={isRTL ? "ml-2" : "mr-2"}>🇸🇦</span>
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
              <DropdownMenuContent align="end" className="w-48 bg-popover border border-border z-50">
                <DropdownMenuLabel>{t("common.labels.profile")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  <span>{t("common.labels.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  <span>{t("common.labels.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  <span>{t("common.labels.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"}>
                <div className="flex flex-col space-y-lg mt-lg">
                  <div className={cn(
                    "flex items-center",
                    isRTL ? "space-x-reverse space-x-sm" : "space-x-sm"
                  )}>
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
                      <Search className={cn(
                        "absolute top-3 h-4 w-4 text-muted",
                        isRTL ? "right-3" : "left-3"
                      )} />
                      <Input 
                        placeholder={t("pages.marketplace.searchPlaceholder")}
                        className={isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Filter className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t("common.buttons.filter")}
                    </Button>
                  </div>

                  <div className="border-t pt-lg space-y-sm">
                    <div className="flex items-center justify-between border-b border-border pb-sm">
                      <span className="text-medical-sm font-medium">{t("common.labels.language")}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                      >
                        {language === "en" ? "العربية" : "English"}
                      </Button>
                    </div>
                    
                    <div className="space-y-sm">
                      <Button variant="ghost" className={cn(
                        "w-full",
                        isRTL ? "justify-end" : "justify-start"
                      )}>
                        <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                        {t("common.labels.settings")}
                      </Button>
                      
                      <Button variant="ghost" className={cn(
                        "w-full",
                        isRTL ? "justify-end" : "justify-start"
                      )}>
                        <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                        {t("common.labels.logout")}
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}