import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { getSpecialtyBySlug } from "@/lib/specialties";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SpecialtyBreadcrumbProps {
  specialtySlug?: string;
  currentPage?: string;
  className?: string;
}

export const SpecialtyBreadcrumb = ({ 
  specialtySlug, 
  currentPage,
  className = ""
}: SpecialtyBreadcrumbProps) => {
  const { locale } = useTranslation();
  const specialty = specialtySlug ? getSpecialtyBySlug(specialtySlug) : null;

  const breadcrumbItems = [
    { 
      label: locale === 'ar' ? 'الرئيسية' : 'Home', 
      href: '/',
      icon: <Home className="h-4 w-4" />
    },
    { 
      label: locale === 'ar' ? 'الأحداث' : 'Events', 
      href: '/events' 
    }
  ];

  if (specialty) {
    breadcrumbItems.push({
      label: locale === 'ar' ? specialty.arabic : specialty.name,
      href: `/specialty/${specialty.slug}`
    });
  }

  if (currentPage) {
    breadcrumbItems.push({
      label: currentPage,
      href: '#'
    });
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          )}
          
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-foreground font-medium flex items-center gap-1">
              {item.icon}
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.href}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              {item.icon}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};