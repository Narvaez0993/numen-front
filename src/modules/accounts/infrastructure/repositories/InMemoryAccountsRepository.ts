import type { Account, AccountsOverview, CreditCard } from '../../domain';
import type { AccountsRepository } from '../../application';

const ACCOUNTS: readonly Account[] = [
  {
    id: 'bbva',
    kind: 'debit',
    name: 'BBVA Débito',
    sub: 'Cuenta de ahorros',
    icon: 'building-bank',
    color: 'mint',
    balance: 2_845_000,
  },
  {
    id: 'bancolombia',
    kind: 'debit',
    name: 'Bancolombia',
    sub: 'Cuenta corriente',
    icon: 'building-bank',
    color: 'purple',
    balance: 2_245_000,
  },
  {
    id: 'cash',
    kind: 'cash',
    name: 'Efectivo',
    sub: 'Bolsillo',
    icon: 'cash',
    color: 'amber',
    balance: 155_000,
  },
];

const CREDIT_CARDS: readonly CreditCard[] = [
  {
    id: 'bbva_credit',
    name: 'BBVA Crédito',
    icon: 'credit-card',
    color: 'coral',
    cutoffDay: 25,
    dueLabel: '5 jun',
    debt: 850_000,
    limit: 5_000_000,
  },
];

export class InMemoryAccountsRepository implements AccountsRepository {
  async getOverview(): Promise<AccountsOverview> {
    const debitTotal = ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);
    const tcDebt = CREDIT_CARDS.reduce((sum, t) => sum + t.debt, 0);
    return {
      accounts: ACCOUNTS,
      creditCards: CREDIT_CARDS,
      debitTotal,
      tcDebt,
      netBalance: debitTotal - tcDebt,
      accountsCount: ACCOUNTS.length,
      creditCardsCount: CREDIT_CARDS.length,
    };
  }
}
