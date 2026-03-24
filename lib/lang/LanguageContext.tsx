'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

type Language = 'EN' | 'BN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('EN');
  const [mounted, setMounted] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && (savedLanguage === 'EN' || savedLanguage === 'BN')) {
      setLanguageState(savedLanguage);
    }
    setMounted(true);
  }, []);

  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Optional: Save to database if user is logged in
    // (can be implemented later with session/auth context)
  };

  // Translation helper function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to English if translation not found
    if (!value && language === 'BN') {
      let fallback: any = translations.EN;
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      return fallback || key;
    }
    
    return value || key;
  };

  // Always provide context value (even during SSR)
  // mounted state is only used to prevent hydration mismatch
  if (!mounted) {
    // Return a default value during SSR to prevent useLanguage errors
    return (
      <LanguageContext.Provider value={{ language: 'EN', setLanguage: () => {}, t }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
