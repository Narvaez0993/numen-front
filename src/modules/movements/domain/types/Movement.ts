import type { CurrencyCode } from '@/shared/domain';

export type MovementType = 'expense' | 'income' | 'transfer';
/** `goal` is a pocket: a valid transfer endpoint, never something you spend from.
 * The capture forms only ever offer accounts and cards — pocket transfers are born
 * in the Metas screen. */
export type SourceType = 'account' | 'credit_card' | 'goal';
/** `recurring` is a charge the subscription engine registered, not a user capture. */
export type CapturedVia = 'manual' | 'voice' | 'photo' | 'text' | 'recurring';

/** Where the money sits: an account, a card or a goal's pocket — both parts needed. */
export type SourceRef = {
  type: SourceType;
  id: string;
};

/**
 * A registered movement of money. `amount` is always **positive** in the minor
 * unit of `currency` — the sign is a consequence of `type`, never stored.
 * `occurredOn` is a day (`YYYY-MM-DD`), not an instant, and its display label is
 * derived at render time (a stored "sáb 11 may" is a lie the next day).
 */
export type Movement = {
  id: string;
  type: MovementType;
  description: string;
  amount: number;
  currency: CurrencyCode;
  source: SourceRef;
  destination: SourceRef | null;
  categoryId: string | null;
  occurredOn: string;
  capturedVia: CapturedVia;
  /** Set when a subscription's charge produced it — that is where the "recurring"
   * badge comes from. Read-only: only the server sets it. */
  subscriptionId: string | null;
};

export type NewMovement = {
  type: MovementType;
  description: string;
  amount: number;
  source: SourceRef;
  destination: SourceRef | null;
  categoryId: string | null;
  occurredOn: string;
  capturedVia?: CapturedVia;
};

/**
 * Absent keys keep their stored value. `type` is not here: turning an expense into
 * a transfer changes the whole shape, so it is a different movement, not an edit.
 */
export type MovementPatch = {
  description?: string;
  amount?: number;
  source?: SourceRef;
  destination?: SourceRef;
  categoryId?: string;
  occurredOn?: string;
};

/**
 * How this movement changed your position, for totals: an expense subtracts, an
 * income adds and a **transfer is zero** — moving money between your own sources
 * never makes you richer or poorer (see the cash-basis rule).
 */
export function signedAmount(movement: Movement): number {
  if (movement.type === 'expense') return -movement.amount;
  if (movement.type === 'income') return movement.amount;
  return 0;
}

/** Expenses of a period grouped by category. `categoryId: null` = unclassified. */
export type CategorySpend = {
  categoryId: string | null;
  spent: number;
  count: number;
};

/**
 * What a period added up to, aggregated by the API. Transfers are in `count` but
 * in neither total: moving money between your own sources is not spending.
 */
export type MovementsSummary = {
  from: string;
  to: string;
  expenseTotal: number;
  incomeTotal: number;
  count: number;
  byCategory: CategorySpend[];
};
