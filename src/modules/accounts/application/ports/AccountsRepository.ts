import type {
  Account,
  AccountPatch,
  AccountsOverview,
  CreditCard,
  CreditCardPatch,
  NewAccount,
  NewCreditCard,
} from '../../domain';

export interface AccountsRepository {
  /** One read for the whole screen: sources, cards and totals. */
  getOverview(): Promise<AccountsOverview>;
  createAccount(input: NewAccount): Promise<Account>;
  updateAccount(id: string, patch: AccountPatch): Promise<Account>;
  removeAccount(id: string): Promise<void>;
  createCard(input: NewCreditCard): Promise<CreditCard>;
  updateCard(id: string, patch: CreditCardPatch): Promise<CreditCard>;
  removeCard(id: string): Promise<void>;
}
