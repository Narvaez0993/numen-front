export const SUPPORTED_CURRENCIES = ['COP', 'USD', 'EUR', 'MXN'] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Digits after the decimal point per currency (ISO 4217 minor unit). Twin of the
 * backend's `shared/domain/money.py`: **every amount in the app is an integer in
 * the minor unit** (USD cents, COP pesos), so this table is the only place that
 * knows about decimals.
 */
export const MINOR_UNIT_EXPONENT: Record<CurrencyCode, number> = {
  COP: 0,
  USD: 2,
  EUR: 2,
  MXN: 2,
};

export function isSupportedCurrency(code: string): code is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}
