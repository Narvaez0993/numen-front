import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function resolveInitialLanguage(): SupportedLanguage {
  const deviceLocale = getLocales()[0]?.languageCode;
  if (deviceLocale && (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLocale)) {
    return deviceLocale as SupportedLanguage;
  }
  return 'es';
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: resolveInitialLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export { i18n };
