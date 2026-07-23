import type { AccentColor } from '@/shared/domain';

export type DebitAccount = {
  id: string;
  kind: 'debit';
  name: string;
  sub: string;
  icon: string;
  color: AccentColor;
  balance: number;
};

export type CashAccount = {
  id: string;
  kind: 'cash';
  name: string;
  sub: string;
  icon: string;
  color: AccentColor;
  balance: number;
};

export type Account = DebitAccount | CashAccount;
