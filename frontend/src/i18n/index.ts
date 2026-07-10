import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'zh'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'portfolio_lang',
    },
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

const setHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
};
setHtmlLang(i18n.language);
i18n.on('languageChanged', setHtmlLang);

export default i18n;
