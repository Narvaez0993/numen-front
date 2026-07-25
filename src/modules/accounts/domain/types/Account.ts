import type { AccentColor, CurrencyCode } from '@/shared/domain';

export type AccountKind = 'debit' | 'cash';

/** `balance` is an integer in the minor unit of `currency` (see formatMoney). */
type AccountBase = {
  id: string;
  name: string;
  sub: string;
  icon: string;
  color: AccentColor;
  currency: CurrencyCode;
  balance: number;
};

export type DebitAccount = AccountBase & { kind: 'debit' };

export type CashAccount = AccountBase & { kind: 'cash' };

export type Account = DebitAccount | CashAccount;

export type NewAccount = {
  kind: AccountKind;
  name: string;
  sub: string;
  icon: string;
  color: AccentColor;
  balance: number;
};

/** Absent keys keep their stored value. */
export type AccountPatch = {
  name?: string;
  sub?: string;
  icon?: string;
  color?: AccentColor;
  balance?: number;
};
