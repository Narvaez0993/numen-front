import { i18n } from '@/shared/infrastructure/i18n';

import { type CurrencyCode, useCurrencyStore } from '../currency/useCurrencyStore';

const SYMBOLS: Record<CurrencyCode, string> = {
  COP: '$',
  USD: '$',
  EUR: '€',
  MXN: '$',
};

/** Currencies whose minor unit is not used in practice. */
const ZERO_DECIMAL = new Set<CurrencyCode>(['COP']);

type Separators = { group: string; decimal: string };

const SEPARATORS: Record<string, Separators> = {
  es: { group: '.', decimal: ',' },
  en: { group: ',', decimal: '.' },
};

function groupDigits(digits: string, separator: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Deterministic, locale-aware money formatter for the user's home currency.
 * COP + es → `$1.234.567` · USD + en → `$1,234.56`.
 * Intentionally not Intl-based so output is identical across devices and tests.
 */
export function formatMoney(n: number): string {
  const { currency } = useCurrencyStore.getState();
  const language = i18n.language?.split('-')[0] ?? 'es';
  const { group, decimal } = SEPARATORS[language] ?? SEPARATORS.es!;
  const symbol = SYMBOLS[currency];
  const decimals = ZERO_DECIMAL.has(currency) ? 0 : 2;

  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const fixed = abs.toFixed(decimals);
  const [intPart = '0', decPart] = fixed.split('.');
  const grouped = groupDigits(intPart, group);
  const suffix = decimals > 0 && decPart ? `${decimal}${decPart}` : '';

  return `${sign}${symbol}${grouped}${suffix}`;
}
