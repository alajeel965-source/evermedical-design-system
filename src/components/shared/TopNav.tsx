import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, ChevronDown, User, LogOut, Settings, Menu, Globe, Calendar, Bookmark, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useI18n, useTranslation } from "@/lib/i18n";
import { useSavedRFQsCount } from "@/hooks/useSavedRFQsCount";
import { useAuth } from "@/hooks/useAuth";

export function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, isRTL } = useI18n();
  const { t } = useTranslation();
  const { displayCount, hasCount } = useSavedRFQsCount();
  const { user, isAuthenticated, signOut } = useAuth();

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
    { href: "/networking", label: t("common.navigation.networking") }
  ];

  const isActiveLink = (href: string) => location.pathname === href;
  
  // Analytics helper
  const trackNavClick = (action: string) => {
    // TODO: Implement analytics tracking
    console.log(`Analytics: ${action}`);
  };

  // Handle logout
  const handleLogout = async () => {
    trackNavClick('nav_logout_click');
    await signOut();
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md shadow-soft" 
          : "bg-background"
      )}
      role="banner"
    >
      <div className="site-container">
        <div className={cn(
          "flex h-16 items-center justify-between",
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
          <nav 
            className={cn(
              "hidden lg:flex items-center",
              isRTL ? "space-x-reverse space-x-lg" : "space-x-lg"
            )}
            role="navigation"
            aria-label={t("common.labels.primaryNavigation")}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                 className={cn(
                   "text-medical-sm font-medium transition-colors hover:text-primary touch-target",
                   "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1",
                   isActiveLink(link.href) 
                     ? "text-primary border-b-2 border-primary pb-1" 
                     : "text-body"
                 )}
                aria-current={isActiveLink(link.href) ? "page" : undefined}
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
                )} aria-hidden="true" />
                <Input
                  placeholder={t("pages.marketplace.searchPlaceholder")}
                  className={cn(
                    "border-0 bg-transparent focus:ring-0 text-body",
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                  aria-label={t("pages.marketplace.searchPlaceholder")}
                  role="searchbox"
                />
              </div>
              <button 
                className={cn(
                  "flex items-center bg-primary/10 text-primary hover:bg-primary/20",
                  "rounded-medical-lg px-md py-sm transition-colors touch-target",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isRTL ? "space-x-reverse space-x-1" : "space-x-1"
                )}
                aria-label={t("common.buttons.openFilters")}
              >
                <Filter className="h-3 w-3" aria-hidden="true" />
                <span>{t("common.buttons.filter")}</span>
              </button>
            </div>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "flex items-center touch-target",
                    isRTL ? "space-x-reverse space-x-1" : "space-x-1"
                  )}
                  aria-label={t("common.labels.selectLanguage")}
                  aria-expanded="false"
                  aria-haspopup="menu"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:block">{language === "en" ? "EN" : "العربية"}</span>
                  <ChevronDown className={cn("h-3 w-3", isRTL && "rotate-180")} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-popover border border-border z-50"
                role="menu"
                aria-label={t("common.labels.languageOptions")}
              >
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  role="menuitem"
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  <span className={isRTL ? "ml-2" : "mr-2"} aria-hidden="true">🇺🇸</span>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("ar")}
                  role="menuitem"
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  <span className={isRTL ? "ml-2" : "mr-2"} aria-hidden="true">🇸🇦</span>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Section */}
            {isAuthenticated ? (
              /* User Menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-8 w-8 rounded-full hover:ring-2 hover:ring-primary/20 transition-all touch-target focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={t("common.labels.userMenu")}
                    aria-expanded="false"
                    aria-haspopup="menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" aria-hidden="true" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-popover border border-border z-50"
                  role="menu"
                  aria-label={t("common.labels.userMenuOptions")}
                >
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <Link to="/profile" onClick={() => trackNavClick('nav_profile_click')}>
                    <DropdownMenuItem 
                      role="menuitem" 
                      className={cn(
                        "focus:bg-accent focus:text-accent-foreground cursor-pointer",
                        isActiveLink("/profile") && "bg-accent text-accent-foreground"
                      )}
                      data-analytics="nav_profile_click"
                    >
                      <User className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} aria-hidden="true" />
                      <span>{t("common.labels.profile")}</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link to="/past-events" onClick={() => trackNavClick('nav_past_events_click')}>
                    <DropdownMenuItem 
                      role="menuitem" 
                      className={cn(
                        "focus:bg-accent focus:text-accent-foreground cursor-pointer",
                        isActiveLink("/past-events") && "bg-accent text-accent-foreground"
                      )}
                      data-analytics="nav_past_events_click"
                    >
                      <Calendar className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} aria-hidden="true" />
                      <span>Past Events</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link to="/saved-rfqs" onClick={() => trackNavClick('nav_saved_rfqs_click')}>
                    <DropdownMenuItem 
                      role="menuitem" 
                      className={cn(
                        "focus:bg-accent focus:text-accent-foreground cursor-pointer",
                        isActiveLink("/saved-rfqs") && "bg-accent text-accent-foreground"
                      )}
                      data-analytics="nav_saved_rfqs_click"
                    >
                      <div className="flex items-center w-full">
                        <Bookmark className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} aria-hidden="true" />
                        <span className="flex-1">Saved RFQs</span>
                        {hasCount && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {displayCount}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  <Link to="/billing-history" onClick={() => trackNavClick('nav_billing_history_click')}>
                    <DropdownMenuItem 
                      role="menuitem" 
                      className={cn(
                        "focus:bg-accent focus:text-accent-foreground cursor-pointer",
                        isActiveLink("/billing-history") && "bg-accent text-accent-foreground"
                      )}
                      data-analytics="nav_billing_history_click"
                    >
                      <Receipt className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} aria-hidden="true" />
                      <span>Billing History</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    role="menuitem" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                    onClick={() => trackNavClick('nav_settings_click')}
                    data-analytics="nav_settings_click"
                  >
                    <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} aria-hidden="true" />
                    <span>{t("common.labels.settings")}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    role="menuitem" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                    onClick={handleLogout}
                    data-analytics="nav_logout_click"
                  >
                    <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} aria-hidden="true" />
                    <span>{t("common.labels.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Sign In / Sign Up Buttons */
              <div className={cn(
                "flex items-center",
                isRTL ? "space-x-reverse space-x-2" : "space-x-2"
              )}>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="lg:hidden touch-target"
                  aria-label={t("common.labels.openMobileMenu")}
                  aria-expanded="false"
                  aria-haspopup="dialog"
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={isRTL ? "left" : "right"}
                role="dialog"
                aria-label={t("common.labels.mobileNavigation")}
              >
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
                          "block py-sm text-medical-base font-medium transition-colors hover:text-primary relative",
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
                    
                    {isAuthenticated ? (
                      <div className="space-y-sm">
                        <Link to="/profile" onClick={() => trackNavClick('nav_profile_click')}>
                          <Button variant="ghost" className={cn(
                            "w-full",
                            isRTL ? "justify-end" : "justify-start",
                            isActiveLink("/profile") && "bg-accent text-accent-foreground"
                          )}>
                            <User className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t("common.labels.profile")}
                          </Button>
                        </Link>

                        <Link to="/past-events" onClick={() => trackNavClick('nav_past_events_click')}>
                          <Button variant="ghost" className={cn(
                            "w-full",
                            isRTL ? "justify-end" : "justify-start",
                            isActiveLink("/past-events") && "bg-accent text-accent-foreground"
                          )}>
                            <Calendar className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            Past Events
                          </Button>
                        </Link>

                        <Link to="/saved-rfqs" onClick={() => trackNavClick('nav_saved_rfqs_click')}>
                          <Button variant="ghost" className={cn(
                            "w-full",
                            isRTL ? "justify-end" : "justify-start",
                            isActiveLink("/saved-rfqs") && "bg-accent text-accent-foreground"
                          )}>
                            <div className="flex items-center w-full">
                              <Bookmark className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              <span className="flex-1">Saved RFQs</span>
                              {hasCount && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {displayCount}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        </Link>

                        <Link to="/billing-history" onClick={() => trackNavClick('nav_billing_history_click')}>
                          <Button variant="ghost" className={cn(
                            "w-full",
                            isRTL ? "justify-end" : "justify-start",
                            isActiveLink("/billing-history") && "bg-accent text-accent-foreground"
                          )}>
                            <Receipt className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            Billing History
                          </Button>
                        </Link>

                        <div className="border-t pt-sm">
                          <Button variant="ghost" className={cn(
                            "w-full",
                            isRTL ? "justify-end" : "justify-start"
                          )} onClick={() => trackNavClick('nav_settings_click')}>
                            <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t("common.labels.settings")}
                          </Button>
                          
                          <Button variant="ghost" className={cn(
                            "w-full",
                            isRTL ? "justify-end" : "justify-start"
                          )} onClick={handleLogout}>
                            <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t("common.labels.logout")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-sm">
                        <Link to="/auth">
                          <Button className="w-full">
                            Sign Up
                          </Button>
                        </Link>
                        <Link to="/auth">
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    )}
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