import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Locale, Translations } from './types';
import { en } from './locales/en';
import { yo } from './locales/yo';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
}

const LOCALE_STORAGE_KEY = 'zimm_preferred_locale';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved === 'en' || saved === 'yo') return saved;
    // System language detection fallback
    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('yo')) return 'yo';
    return 'en';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'yo' : 'en');
  };

  const t = useMemo(() => (locale === 'yo' ? yo : en), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
