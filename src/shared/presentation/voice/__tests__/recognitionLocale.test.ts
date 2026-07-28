import { resolveRecognitionLocale } from '../recognitionLocale';

describe('resolveRecognitionLocale', () => {
  it('prefers the device tag that matches the app language', () => {
    expect(resolveRecognitionLocale('es', ['es-MX', 'en-US'])).toBe('es-MX');
    expect(resolveRecognitionLocale('en', ['es-CO', 'en-GB'])).toBe('en-GB');
  });

  it('falls back to the home dialects when the device has no match', () => {
    expect(resolveRecognitionLocale('es', ['en-US'])).toBe('es-CO');
    expect(resolveRecognitionLocale('en', ['fr-FR'])).toBe('en-US');
  });

  it('treats regional app languages by their primary subtag', () => {
    expect(resolveRecognitionLocale('en-GB', ['en-AU'])).toBe('en-AU');
    expect(resolveRecognitionLocale('es-419', ['es-AR'])).toBe('es-AR');
  });
});
