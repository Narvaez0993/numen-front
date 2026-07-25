import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';

import { formatAmountDigits, formatMoney } from '../formatMoney';

// Amounts are integers in the minor unit of the currency (COP pesos, USD cents).
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

    it('honors an explicit currency over the store', () => {
      expect(formatMoney(45000, 'USD')).toBe('$450,00');
      expect(formatMoney(45000, 'COP')).toBe('$45.000');
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

    it('reads the amount as cents', () => {
      expect(formatMoney(123450)).toBe('$1,234.50');
    });

    it('pads amounts below one unit', () => {
      expect(formatMoney(5)).toBe('$0.05');
      expect(formatMoney(0)).toBe('$0.00');
    });
  });
});

describe('formatAmountDigits', () => {
  beforeAll(() => {
    useCurrencyStore.setState({ currency: 'COP' });
  });

  it('is empty for empty input so the placeholder shows', () => {
    expect(formatAmountDigits('')).toBe('');
  });

  it('groups keystrokes in a zero-decimal currency', () => {
    expect(formatAmountDigits('450000')).toBe('450.000');
  });

  it('inserts the decimals from the right in a two-decimal currency', () => {
    expect(formatAmountDigits('45000', 'USD')).toBe('450,00');
    expect(formatAmountDigits('7', 'USD')).toBe('0,07');
  });
});
