import type { AccentColor, CurrencyCode } from '@/shared/domain';

/**
 * `debt` and `limit` are integers in the minor unit of `currency`. `cutoffDay`
 * and `dueDay` are days of the month, never display strings — the UI localizes
 * them.
 */
export type CreditCard = {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
  currency: CurrencyCode;
  cutoffDay: number;
  dueDay: number | null;
  debt: number;
  limit: number;
};

export type NewCreditCard = {
  name: string;
  icon: string;
  color: AccentColor;
  debt: number;
  limit: number;
  cutoffDay: number;
  dueDay: number | null;
};

/** Absent keys keep their stored value. */
export type CreditCardPatch = {
  name?: string;
  icon?: string;
  color?: AccentColor;
  debt?: number;
  limit?: number;
  cutoffDay?: number;
  dueDay?: number;
};
