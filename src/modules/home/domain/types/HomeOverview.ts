import type { Movement } from '@/modules/movements/domain';
import type { CurrencyCode, Objective } from '@/shared/domain';

/**
 * Which figure the hero leads with. Chosen by the server from the user's objective
 * and the data they actually have — the objective says what is *preferred*, the data
 * says what is *possible*, and a figure is never shown without its data.
 *
 * - `start` — nothing registered yet: the getting-started checklist.
 * - `pace` — how fast the month is going and where it lands. The honest default.
 * - `debt` — what they owe on their cards, for whoever came to get out of debt.
 * - `saving` — what they put aside this month.
 * - `invite` — they told us their objective and we cannot answer it yet: ask for the
 *   missing piece. Read it together with `objective`.
 */
export type HeroFocus = 'start' | 'pace' | 'debt' | 'saving' | 'invite';

/**
 * Where the month lands at the current rate. `null` in the month's first days, when a
 * projection would be noise rather than information.
 *
 * This replaced *"available today"*, which divided the leftover income by the days
 * remaining: that figure **rose whenever the user held back**, which is the opposite
 * of what an app that helps you reach a goal should say.
 */
export type SpendingPace = {
  dailyAverage: number;
  projected: number;
};

/** The same stretch of last month — July 1–26 against June 1–26, never the whole month. */
export type PreviousMonth = {
  spent: number;
  income: number;
};

export type MonthSummary = {
  spent: number;
  income: number;
  /** `income - spent`. Negative when the month cost more than it brought in. */
  saved: number;
  /** 0..1 — share of the month's income not spent. 0 without income. */
  savingsRate: number;
  /** Transfers included: they are movements, they just are not spending. */
  movements: number;
  spentToday: number;
  previous: PreviousMonth | null;
  /** Signed share of change in spending. `null` on a first month. */
  change: number | null;
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
 * `currency`; `recent` carries plain movements, so renaming a category updates Home
 * for free — the client resolves every label from its own catalog.
 */
export type HomeOverview = {
  currency: CurrencyCode;
  /** `2026-07` — the month every figure belongs to. */
  period: string;
  /** Days remaining in the month, today included. */
  daysLeft: number;
  /** Days gone in the month, today included — the denominator of the pace. */
  daysElapsed: number;
  objective: Objective | null;
  focus: HeroFocus;
  netBalance: number;
  accountsCount: number;
  creditCardsCount: number;
  /** What is owed on cards — the only debt figure that exists today. */
  cardDebt: number;
  cardLimit: number;
  month: MonthSummary;
  pace: SpendingPace | null;
  topCategories: TopCategory[];
  recent: Movement[];
  upcoming: UpcomingCharge[];
};
