import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';

import { formatMoney } from '../formatMoney';

// Currency and language are pinned per block for determinism.
describe('formatMoney', () => {
  beforeAll(() => {
    useCurrencyStore.setState({ currency: 'COP' });
  });
  describe('COP + es', () => {
    beforeAll(async () => {
      await i18n.changeLanguage('es');
    });

    it('formats with dot thousand separators and no decimals', () => {
      expect(formatMoney(1234567)).toBe('$1.234.567');
    });

    it('keeps the minus sign for negatives', () => {
      expect(formatMoney(-1234567)).toBe('-$1.234.567');
    });

    it('handles zero and small amounts', () => {
      expect(formatMoney(0)).toBe('$0');
      expect(formatMoney(950)).toBe('$950');
    });
  });

  describe('COP + en', () => {
    beforeAll(async () => {
      await i18n.changeLanguage('en');
    });

    afterAll(async () => {
      await i18n.changeLanguage('es');
    });

    it('uses comma grouping in English', () => {
      expect(formatMoney(1234567)).toBe('$1,234,567');
    });
  });

  describe('USD + en', () => {
    beforeAll(async () => {
      useCurrencyStore.setState({ currency: 'USD' });
      await i18n.changeLanguage('en');
    });

    afterAll(async () => {
      useCurrencyStore.setState({ currency: 'COP' });
      await i18n.changeLanguage('es');
    });

    it('shows two decimals', () => {
      expect(formatMoney(1234.5)).toBe('$1,234.50');
    });
  });
});
