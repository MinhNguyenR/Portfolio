import React, { createContext, useContext, useState, useEffect } from 'react';
import { locales } from '../utils/locales';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    return locales[lang]?.[key] || locales['vi']?.[key] || key;
  };

  const getLocalized = (obj, field) => {
    if (!obj) return '';
    if (lang === 'vi') return obj[field] || '';
    return obj.translations?.[lang]?.[field] || obj[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
