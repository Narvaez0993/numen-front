import { type CurrencyCode, MINOR_UNIT_EXPONENT } from '@/shared/domain';
import { i18n } from '@/shared/infrastructure/i18n';

import { useCurrencyStore } from '../currency/useCurrencyStore';

const SYMBOLS: Record<CurrencyCode, string> = {
  COP: '$',
  USD: '$',
  EUR: '€',
  MXN: '$',
};

type Separators = { group: string; decimal: string };

const SEPARATORS: Record<string, Separators> = {
  es: { group: '.', decimal: ',' },
  en: { group: ',', decimal: '.' },
};

function groupDigits(digits: string, separator: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function activeCurrency(currency?: CurrencyCode): CurrencyCode {
  return currency ?? useCurrencyStore.getState().currency;
}

function separators(): Separators {
  const language = i18n.language?.split('-')[0] ?? 'es';
  return SEPARATORS[language] ?? SEPARATORS.es!;
}

/** Splits a minor-unit amount into its grouped integer part and decimals. */
function splitMinor(minor: number, currency: CurrencyCode): string {
  const exponent = MINOR_UNIT_EXPONENT[currency];
  const { group, decimal } = separators();
  const digits = Math.abs(Math.trunc(minor))
    .toString()
    .padStart(exponent + 1, '0');
  const cut = digits.length - exponent;
  const grouped = groupDigits(digits.slice(0, cut), group);
  return exponent > 0 ? `${grouped}${decimal}${digits.slice(cut)}` : grouped;
}

/**
 * Deterministic, locale-aware money formatter. `minor` is an integer in the
 * minor unit of `currency` (defaults to the user's home currency):
 * COP + es → `$1.234.567` · USD + en → `$1,234.56`.
 * Intentionally not Intl-based so output is identical across devices and tests.
 */
export function formatMoney(minor: number, currency?: CurrencyCode): string {
  const code = activeCurrency(currency);
  const sign = minor < 0 ? '-' : '';
  return `${sign}${SYMBOLS[code]}${splitMinor(minor, code)}`;
}

/**
 * Formats the raw digits of a money input. Digits are typed left to right into
 * the minor unit (ATM style): in USD `45000` reads `450.00`, in COP `450000`
 * reads `450.000`. Returns '' for empty input so the placeholder can show.
 */
export function formatAmountDigits(digits: string, currency?: CurrencyCode): string {
  if (!digits) return '';
  return splitMinor(Number(digits), activeCurrency(currency));
}

/** The currency symbol to render next to an amount input. */
export function currencySymbol(currency?: CurrencyCode): string {
  return SYMBOLS[activeCurrency(currency)];
}
