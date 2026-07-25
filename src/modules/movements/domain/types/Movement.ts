import type { CurrencyCode } from '@/shared/domain';

export type MovementType = 'expense' | 'income' | 'transfer';
export type SourceType = 'account' | 'credit_card';
export type CapturedVia = 'manual' | 'voice' | 'photo' | 'text';

/** Where the money sits: an account or a credit card, so both parts are needed. */
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
