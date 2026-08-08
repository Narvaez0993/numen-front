import type { AccentColor } from '@/shared/domain';

/**
 * A debt is a **ledger of its own**, and the cash that crosses it is real.
 *
 * Lending is not spending: the money leaves your account as a **transfer** into the
 * debt, so you are no poorer and the month's expenses do not move. A repayment is the
 * same transfer backwards. The only moment a loan becomes an expense is when it is
 * written off — the moment the loss actually happens.
 *
 * That is why `accountId` travels with a new debt and is required for a repayment: a
 * balance really moves. A debt with no account moved no cash — a dinner split, where
 * the bill already left as one expense.
 *
 * `remaining`, `paidTotal` and `status` come **from the server**, derived for the
 * snapshot's `today` — the prototype stored a `balance` and displayed dates ("21 may"),
 * and both went stale. The client no longer computes any of them.
 */

export type DebtDirection = 'incoming' | 'outgoing';

/** `written_off` and `paid` are two words for the same zero: one was collected, the
 *  other was lost. Calling them both PAGADO would say a friend paid you back when
 *  nobody did. */
export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'written_off';

export type Payment = {
  /** The **movement's** id: a repayment and the transfer that carried it are one
   *  thing, so deleting it in Movimientos undoes the instalment too. */
  id: string;
  amount: number;
  paidOn: string;
  note: string | null;
};

export type Counterparty = {
  id: string;
  name: string;
  color: AccentColor;
};

export type Deuda = {
  id: string;
  /** `incoming` = they owe me · `outgoing` = I owe them. */
  direction: DebtDirection;
  counterpartyId: string;
  amount: number;
  paidTotal: number;
  remaining: number;
  status: DebtStatus;
  /** `YYYY-MM-DD` or nothing — never a display string. */
  dueOn: string | null;
  note: string | null;
  eventId: string | null;
  /** The day the user gave up on it. What it cost is not here — it is the expense the
   *  write-off recorded, and it reads in Movimientos like any other. */
  writtenOffOn: string | null;
  payments: Payment[];
  createdAt: string;
};

/** The split moment that grouped some debts. Display only: the money lives in them. */
export type SharedEvent = {
  id: string;
  name: string;
  /** What the whole thing cost, the user's own share included. */
  total: number;
  occurredOn: string;
};

export type DirectionTotal = { total: number; count: number };

export type DebtsSnapshot = {
  currency: string;
  today: string;
  iOwe: DirectionTotal;
  owedToMe: DirectionTotal;
  counterparties: Counterparty[];
  events: SharedEvent[];
  /** Paid ones included — the history reads them; screens filter by `status`. */
  debts: Deuda[];
};

export type NewDebt = {
  direction: DebtDirection;
  /** An existing person, or a name that creates one inline — one of the two. */
  counterpartyId?: string;
  counterpartyName?: string;
  amount: number;
  /** The account the cash moved on. Omitted when it moved none — a dinner split,
   *  where the bill already left as one expense. */
  accountId?: string | null;
  dueOn?: string | null;
  note?: string | null;
};

export type NewSplit = {
  counterpartyId?: string;
  counterpartyName?: string;
  amount: number;
};

export type NewSharedEvent = {
  direction: DebtDirection;
  name: string;
  total: number;
  dueOn?: string | null;
  /** One per person who owes; the user's own share is the rest and is nobody's debt. */
  splits: NewSplit[];
};

/** Share repaid, `0..1`. Derived from server figures — never from a stored balance. */
export function debtProgress(debt: Deuda): number {
  if (debt.amount <= 0) return 0;
  return debt.paidTotal / debt.amount;
}

/** The letter an avatar wears. Derived — the prototype persisted it. */
export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export const MS_PER_DAY = 86_400_000;

/** Whole days from `todayStr` to `dateStr`; negative once it passed. Display only. */
export function dayDiff(dateStr: string, todayStr: string): number {
  const today = new Date(todayStr);
  const target = new Date(dateStr);
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}
