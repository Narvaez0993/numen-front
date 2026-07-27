/**
 * A cap the user set, and the month measured against it.
 *
 * Two things to keep in mind reading these types:
 *
 * - **Every figure below `target` is derived by the server.** The client divides nothing,
 *   so the ceiling shown here and the one in Home's hero are the same number by
 *   construction rather than by luck.
 * - **A cap is standing, not monthly.** `since` is the month its value was set in; it keeps
 *   applying to August and September until the user changes it.
 */

export type BudgetScope = 'global' | 'category';

/** The cap itself, as create/update return it. */
export type Budget = {
  id: string;
  scope: BudgetScope;
  categoryId: string | null;
  target: number;
  since: string;
};

/** A cap plus the month against it. Nothing here is stored. */
export type Cap = {
  id: string;
  target: number;
  spent: number;
  /** Negative once the user is over the cap — shown as such, never clamped to 0. */
  remaining: number;
  /** `spent / target`, uncapped: `1.4` is 140% and the bar draws the overflow. */
  used: number;
  /**
   * What each remaining day gets, today included. `null` once the cap is spent: there is
   * nothing left to divide, and a negative "per day" is not a thing.
   */
  perDay: number | null;
  /** Where the month closes at this rate. `null` in the first days of the month. */
  projected: number | null;
  /** How much past the cap it would close; `null` when it closes inside. */
  over: number | null;
};

export type Merchant = {
  /** What the user typed, in their most recent spelling. There is no catalog. */
  label: string;
  spent: number;
  count: number;
};

/** A watched category. Its name, icon and colour come from the categories catalog. */
export type CategoryCap = Cap & {
  categoryId: string;
  count: number;
  topMerchants: Merchant[];
};

export type BudgetsSnapshot = {
  currency: string;
  /** `YYYY-MM`, real: the month is never a hardcoded label. */
  period: string;
  daysLeft: number;
  daysElapsed: number;
  /** The month's ceiling; `null` when the user has not set one. */
  month: Cap | null;
  /**
   * Only the categories the user chose to watch, closest to their cap first.
   * **Not additive with `month`**: every expense counts against the ceiling anyway.
   */
  categories: CategoryCap[];
};

export type NewBudget = {
  scope: BudgetScope;
  categoryId?: string | null;
  target: number;
};
