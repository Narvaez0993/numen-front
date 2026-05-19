import type { Account } from './Account';
import type { CreditCard } from './CreditCard';

export type AccountsOverview = {
  accounts: readonly Account[];
  creditCards: readonly CreditCard[];
  debitTotal: number;
  tcDebt: number;
  netBalance: number;
  accountsCount: number;
  creditCardsCount: number;
};
