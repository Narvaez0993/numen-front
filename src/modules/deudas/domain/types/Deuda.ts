import type { AccentColor } from '@/shared/domain';

export type DebtDirection = 'incoming' | 'outgoing';

export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export type Payment = {
  date: string;
  amount: number;
  account: string;
  note?: string;
};

export type Counterparty = {
  id: string;
  name: string;
  initial: string;
  color: AccentColor;
  custom?: boolean;
};

export type Deuda = {
  id: string;
  direction: DebtDirection;
  counterpartyId: string;
  amount: number;
  balance: number;
  createdAt: string;
  dueDate: string | null;
  note: string | null;
  payments: Payment[];
  eventId: string | null;
  isExpense?: boolean;
  category?: string | null;
};

export type SharedEvent = {
  id: string;
  name: string;
  icon: string;
  iconColor: AccentColor;
  totalAmount: number;
  date: string;
  debtIds: string[];
};

export type DebtsSnapshot = {
  today: string;
  counterparties: Counterparty[];
  debts: Deuda[];
  events: SharedEvent[];
};

export type DebtTotals = { incoming: number; outgoing: number };

export const MS_PER_DAY = 86_400_000;

export function dayDiff(dateStr: string, todayStr: string): number {
  const today = new Date(todayStr);
  const target = new Date(dateStr);
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function debtStatus(d: Deuda, todayStr: string): DebtStatus {
  if (d.balance === 0) return 'paid';
  if (d.dueDate && dayDiff(d.dueDate, todayStr) < 0) return 'overdue';
  if (d.balance < d.amount) return 'partial';
  return 'pending';
}

export function debtProgress(d: Deuda): number {
  if (d.amount <= 0) return 0;
  return (d.amount - d.balance) / d.amount;
}

export function totalsByDirection(debts: Deuda[], todayStr: string): DebtTotals {
  let incoming = 0;
  let outgoing = 0;
  for (const d of debts) {
    if (debtStatus(d, todayStr) === 'paid') continue;
    if (d.direction === 'incoming') incoming += d.balance;
    else outgoing += d.balance;
  }
  return { incoming, outgoing };
}
