import type { Movement } from '@/modules/movements/domain';
import type { CurrencyCode } from '@/shared/domain';

/**
 * Where the daily figure comes from. The app says it out loud instead of
 * presenting a projection as advice:
 * - `income` — derived from the income registered this month.
 * - `budget` — a budget the user set (phase 3); it outranks income.
 * - `none` — nothing to divide, so there is no figure to show.
 */
export type AllowanceBasis = 'budget' | 'income' | 'none';

export type DailyAllowance = {
  /** Negative when the month is already overspent — never dressed up as zero. */
  available: number;
  spentToday: number;
  basis: AllowanceBasis;
};

export type MonthSummary = {
  spent: number;
  income: number;
  /** 0..1 — share of the month's income not spent. 0 without income. */
  savingsRate: number;
  /** Transfers included: they are movements, they just are not spending. */
  movements: number;
};

/**
 * A recurring charge about to land. `pending` means its day arrived and it is
 * waiting for an answer — `chargeId` is what confirm/skip act on. References only:
 * the name and icon come from the subscriptions catalog the client caches.
 */
export type UpcomingCharge = {
  subscriptionId: string;
  chargeOn: string;
  amount: number;
  status: 'pending' | 'scheduled';
  chargeId: string | null;
};

/** A category's weight in the month's expenses. `categoryId: null` = unclassified. */
export type TopCategory = {
  categoryId: string | null;
  spent: number;
  count: number;
  /** 0..1 — share of the month's expenses. */
  share: number;
};

/**
 * The whole Home screen in one read. Amounts are integers in the minor unit of
 * `currency`; `recent` carries plain movements, so renaming a category updates
 * Home for free — the client resolves every label from its own catalog.
 */
export type HomeOverview = {
  currency: CurrencyCode;
  /** `2026-07` — the month every figure belongs to. */
  period: string;
  /** Days remaining in the month, today included. */
  daysLeft: number;
  netBalance: number;
  accountsCount: number;
  creditCardsCount: number;
  month: MonthSummary;
  daily: DailyAllowance;
  topCategories: TopCategory[];
  recent: Movement[];
  upcoming: UpcomingCharge[];
};
