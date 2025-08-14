// SEO utilities for specialty pages and structured data

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: any;
}

export const updatePageSEO = (seoData: SEOData) => {
  // Update document title
  if (seoData.title) {
    document.title = seoData.title;
  }

  // Update meta description
  updateMetaTag('description', seoData.description);
  
  // Update keywords
  if (seoData.keywords.length > 0) {
    updateMetaTag('keywords', seoData.keywords.join(', '));
  }

  // Update canonical URL
  if (seoData.canonical) {
    updateLinkTag('canonical', seoData.canonical);
  }

  // Update Open Graph tags
  updateMetaTag('og:title', seoData.ogTitle || seoData.title, 'property');
  updateMetaTag('og:description', seoData.ogDescription || seoData.description, 'property');
  updateMetaTag('og:type', 'website', 'property');
  
  if (seoData.ogImage) {
    updateMetaTag('og:image', seoData.ogImage, 'property');
  }

  // Add Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', seoData.ogTitle || seoData.title);
  updateMetaTag('twitter:description', seoData.ogDescription || seoData.description);

  // Add structured data
  if (seoData.structuredData) {
    addStructuredData(seoData.structuredData);
  }
};

const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
  if (!content) return;

  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};

const updateLinkTag = (rel: string, href: string) => {
  if (!href) return;

  let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', rel);
    document.head.appendChild(linkTag);
  }
  
  linkTag.setAttribute('href', href);
};

const addStructuredData = (data: any) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Generate structured data for medical conferences
export const generateMedicalConferenceStructuredData = (event: {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  organizer?: string;
  url?: string;
  offers?: {
    price?: string;
    currency?: string;
    availability?: string;
  };
}) => {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "MedicalConference",
    "name": event.name,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };

  if (event.description) {
    structuredData.description = event.description;
  }

  if (event.location) {
    structuredData.location = {
      "@type": "Place",
      "name": event.location.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.location.city,
        "addressCountry": event.location.country,
        "streetAddress": event.location.address
      }
    };
  }

  if (event.organizer) {
    structuredData.organizer = {
      "@type": "Organization",
      "name": event.organizer
    };
  }

  if (event.url) {
    structuredData.url = event.url;
  }

  if (event.offers) {
    structuredData.offers = {
      "@type": "Offer",
      "price": event.offers.price || "0",
      "priceCurrency": event.offers.currency || "USD",
      "availability": "https://schema.org/InStock"
    };
  }

  return structuredData;
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

// Generate specialty page structured data
export const generateSpecialtyPageStructuredData = (specialty: {
  name: string;
  description: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": specialty.name,
    "description": specialty.description,
    "url": specialty.url,
    "about": {
      "@type": "MedicalSpecialty",
      "name": specialty.name
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": `${specialty.name} Medical Events`,
      "description": `List of medical conferences, workshops, and events in ${specialty.name}`
    }
  };
};