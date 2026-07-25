import type { CurrencyCode } from '@/shared/domain';

import type { Account } from './Account';
import type { CreditCard } from './CreditCard';

/** Read view behind the Accounts screen; all totals in the minor unit of `currency`. */
export type AccountsOverview = {
  currency: CurrencyCode;
  accounts: readonly Account[];
  creditCards: readonly CreditCard[];
  debitTotal: number;
  cashTotal: number;
  tcDebt: number;
  netBalance: number;
  accountsCount: number;
  creditCardsCount: number;
};
