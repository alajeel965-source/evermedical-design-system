import specialtiesConfig from '../../config/specialties.json';

export interface MedicalSpecialty {
  name: string;
  arabic: string;
  slug: string;
  code: string;
  synonyms: string[];
  subspecialties: string[];
}

export interface SpecialtiesConfig {
  version: string;
  lastUpdated: string;
  medicalSpecialties: MedicalSpecialty[];
}

// Load specialties from config
export const specialties: SpecialtiesConfig = specialtiesConfig as SpecialtiesConfig;

// Utility functions
export const getSpecialtyBySlug = (slug: string): MedicalSpecialty | undefined => {
  return specialties.medicalSpecialties.find(s => s.slug === slug);
};

export const getSpecialtyByCode = (code: string): MedicalSpecialty | undefined => {
  return specialties.medicalSpecialties.find(s => s.code === code);
};

export const getSpecialtyOptions = (locale: 'en' | 'ar' = 'en') => {
  return specialties.medicalSpecialties.map(specialty => ({
    value: specialty.slug,
    label: locale === 'ar' ? specialty.arabic : specialty.name,
    code: specialty.code
  }));
};

export const searchSpecialties = (query: string, locale: 'en' | 'ar' = 'en'): MedicalSpecialty[] => {
  const searchTerm = query.toLowerCase();
  
  return specialties.medicalSpecialties.filter(specialty => {
    const name = locale === 'ar' ? specialty.arabic : specialty.name;
    const synonyms = specialty.synonyms.join(' ').toLowerCase();
    
    return (
      name.toLowerCase().includes(searchTerm) ||
      specialty.code.toLowerCase().includes(searchTerm) ||
      synonyms.includes(searchTerm) ||
      specialty.subspecialties.some(sub => sub.toLowerCase().includes(searchTerm))
    );
  });
};

export const validateSpecialtySlug = (slug: string): boolean => {
  return specialties.medicalSpecialties.some(s => s.slug === slug);
};

// Analytics event helpers
export const trackSpecialtyEvent = (eventName: string, specialtySlug: string, additionalData?: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      specialty_slug: specialtySlug,
      ...additionalData
    });
  }
  
  // Add custom analytics tracking here
  const analyticsData = {
    event: eventName,
    specialty_slug: specialtySlug,
    timestamp: new Date().toISOString(),
    ...additionalData
  };
  
  console.log('Specialty Analytics:', analyticsData);
};

// SEO helpers
export const getSpecialtySEOData = (specialty: MedicalSpecialty, locale: 'en' | 'ar' = 'en') => {
  const specialtyName = locale === 'ar' ? specialty.arabic : specialty.name;
  
  return {
    title: locale === 'ar' 
      ? `مؤتمرات وفعاليات ${specialtyName} | أحداث طبية`
      : `${specialtyName} Conferences, Workshops, Webinars & Expos | MedicalEvents`,
    description: locale === 'ar'
      ? `اكتشف أحدث المؤتمرات والورش والندوات في ${specialtyName}. انضم للمتخصصين من جميع أنحاء العالم.`
      : `Discover the latest ${specialtyName} conferences, workshops, and webinars. Connect with specialists worldwide and earn CME credits.`,
    keywords: [
      specialtyName,
      specialty.code,
      ...specialty.synonyms,
      ...(locale === 'ar' 
        ? ['مؤتمر', 'ندوة', 'تدريب', 'CME']
        : ['conference', 'workshop', 'webinar', 'CME', 'medical education'])
    ]
  };
};