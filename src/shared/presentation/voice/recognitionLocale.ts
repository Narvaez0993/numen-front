/**
 * Which BCP-47 tag the recognizer should listen in. The device's own locales
 * win (they are supported by construction); the app language only picks WHICH
 * of them. With no match we fall back to the product's home dialects.
 */

export const FALLBACK_LOCALE: Record<'es' | 'en', string> = {
  // Colombia-first product: the slang the prompt understands ("lucas", "mil")
  // is the slang this dialect hears best.
  es: 'es-CO',
  en: 'en-US',
};

/** A second chance when the recognizer rejects the first tag. */
export const RETRY_LOCALE: Record<'es' | 'en', string> = {
  es: 'es-ES',
  en: 'en-US',
};

export function appLanguageKey(appLanguage: string): 'es' | 'en' {
  return appLanguage.startsWith('en') ? 'en' : 'es';
}

export function resolveRecognitionLocale(
  appLanguage: string,
  deviceTags: string[],
): string {
  const key = appLanguageKey(appLanguage);
  const match = deviceTags.find((tag) => tag.toLowerCase().startsWith(`${key}-`));
  return match ?? FALLBACK_LOCALE[key];
}
