import { useI18n } from './i18nContext';
import { translations, TranslationKey } from './translations';

export function useTranslation() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English if translation is missing
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, language, locale: language };
}