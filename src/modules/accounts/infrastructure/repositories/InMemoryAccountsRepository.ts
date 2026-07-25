import type { AccountsRepository } from '../../application';
import type {
  Account,
  AccountPatch,
  AccountsOverview,
  CreditCard,
  CreditCardPatch,
  NewAccount,
  NewCreditCard,
} from '../../domain';

/** Offline double: amounts are minor units of COP (a zero-decimal currency). */
const CURRENCY = 'COP';

export class InMemoryAccountsRepository implements AccountsRepository {
  private accounts: Account[] = [];
  private cards: CreditCard[] = [];
  private seq = 0;

  async getOverview(): Promise<AccountsOverview> {
    const debitTotal = this.accounts
      .filter((a) => a.kind === 'debit')
      .reduce((sum, a) => sum + a.balance, 0);
    const cashTotal = this.accounts
      .filter((a) => a.kind === 'cash')
      .reduce((sum, a) => sum + a.balance, 0);
    const tcDebt = this.cards.reduce((sum, c) => sum + c.debt, 0);
    return {
      currency: CURRENCY,
      accounts: [...this.accounts],
      creditCards: [...this.cards],
      debitTotal,
      cashTotal,
      tcDebt,
      netBalance: debitTotal + cashTotal - tcDebt,
      accountsCount: this.accounts.length,
      creditCardsCount: this.cards.length,
    };
  }

  async createAccount(input: NewAccount): Promise<Account> {
    this.seq += 1;
    const account: Account = { id: `acc-${this.seq}`, ...input, currency: CURRENCY };
    this.accounts.push(account);
    return account;
  }

  async updateAccount(id: string, patch: AccountPatch): Promise<Account> {
    const existing = this.accounts.find((a) => a.id === id);
    if (!existing) {
      throw new Error('Account not found');
    }
    const updated: Account = { ...existing, ...patch };
    this.accounts = this.accounts.map((a) => (a.id === id ? updated : a));
    return updated;
  }

  async removeAccount(id: string): Promise<void> {
    this.accounts = this.accounts.filter((a) => a.id !== id);
  }

  async createCard(input: NewCreditCard): Promise<CreditCard> {
    this.seq += 1;
    const card: CreditCard = { id: `card-${this.seq}`, ...input, currency: CURRENCY };
    this.cards.push(card);
    return card;
  }

  async updateCard(id: string, patch: CreditCardPatch): Promise<CreditCard> {
    const existing = this.cards.find((c) => c.id === id);
    if (!existing) {
      throw new Error('Credit card not found');
    }
    const updated: CreditCard = { ...existing, ...patch };
    this.cards = this.cards.map((c) => (c.id === id ? updated : c));
    return updated;
  }

  async removeCard(id: string): Promise<void> {
    this.cards = this.cards.filter((c) => c.id !== id);
  }
}
