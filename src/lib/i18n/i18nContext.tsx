import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

const LANGUAGE_STORAGE_KEY = 'evermedical-language';

// Helper function to get initial language safely
function getInitialLanguage(): Language {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return 'en'; // Default for SSR
  }
  
  try {
    // Check localStorage first
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') {
      return stored;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ar')) {
      return 'ar';
    }
  } catch (error) {
    console.warn('Failed to access localStorage or navigator:', error);
  }
  
  return 'en';
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  const isRTL = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Only access localStorage and document in browser environment
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        
        // Update HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      } catch (error) {
        console.warn('Failed to update localStorage or document:', error);
      }
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const initialLang = getInitialLanguage();
        setLanguageState(initialLang);
        document.documentElement.lang = initialLang;
        document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize language:', error);
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // Update HTML attributes when language changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        document.documentElement.lang = language;
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      } catch (error) {
        console.warn('Failed to update document attributes:', error);
      }
    }
  }, [language, isRTL, isInitialized]);

  const contextValue = React.useMemo(() => ({
    language,
    setLanguage,
    isRTL
  }), [language, isRTL]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}