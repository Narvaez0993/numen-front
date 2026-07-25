import { AxiosInstance } from 'axios';

import type { AccentColor, CurrencyCode } from '@/shared/domain';

import type { AccountsRepository } from '../../application';
import type {
  Account,
  AccountKind,
  AccountPatch,
  AccountsOverview,
  CreditCard,
  CreditCardPatch,
  NewAccount,
  NewCreditCard,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type AccountResponse = {
  id: string;
  kind: string;
  name: string;
  sub: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
};

type CreditCardResponse = {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  debt: number;
  limit: number;
  cutoff_day: number;
  due_day: number | null;
};

type OverviewResponse = {
  currency: string;
  accounts: AccountResponse[];
  credit_cards: CreditCardResponse[];
  debit_total: number;
  cash_total: number;
  tc_debt: number;
  net_balance: number;
  accounts_count: number;
  credit_cards_count: number;
};

export class HttpAccountsRepository implements AccountsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getOverview(): Promise<AccountsOverview> {
    try {
      const { data } = await this.http.get<OverviewResponse>('/accounts/overview');
      return {
        currency: data.currency as CurrencyCode,
        accounts: data.accounts.map(toAccount),
        creditCards: data.credit_cards.map(toCreditCard),
        debitTotal: data.debit_total,
        cashTotal: data.cash_total,
        tcDebt: data.tc_debt,
        netBalance: data.net_balance,
        accountsCount: data.accounts_count,
        creditCardsCount: data.credit_cards_count,
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async createAccount(input: NewAccount): Promise<Account> {
    try {
      const { data } = await this.http.post<AccountResponse>('/accounts', {
        kind: input.kind,
        name: input.name,
        sub: input.sub,
        icon: input.icon,
        color: input.color,
        balance: input.balance,
      });
      return toAccount(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async updateAccount(id: string, patch: AccountPatch): Promise<Account> {
    try {
      const { data } = await this.http.patch<AccountResponse>(`/accounts/${id}`, {
        name: patch.name,
        sub: patch.sub,
        icon: patch.icon,
        color: patch.color,
        balance: patch.balance,
      });
      return toAccount(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async removeAccount(id: string): Promise<void> {
    try {
      await this.http.delete(`/accounts/${id}`);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async createCard(input: NewCreditCard): Promise<CreditCard> {
    try {
      const { data } = await this.http.post<CreditCardResponse>('/credit-cards', {
        name: input.name,
        icon: input.icon,
        color: input.color,
        debt: input.debt,
        limit: input.limit,
        cutoff_day: input.cutoffDay,
        due_day: input.dueDay,
      });
      return toCreditCard(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async updateCard(id: string, patch: CreditCardPatch): Promise<CreditCard> {
    try {
      const { data } = await this.http.patch<CreditCardResponse>(`/credit-cards/${id}`, {
        name: patch.name,
        icon: patch.icon,
        color: patch.color,
        debt: patch.debt,
        limit: patch.limit,
        cutoff_day: patch.cutoffDay,
        due_day: patch.dueDay,
      });
      return toCreditCard(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async removeCard(id: string): Promise<void> {
    try {
      await this.http.delete(`/credit-cards/${id}`);
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toAccount(dto: AccountResponse): Account {
  return {
    id: dto.id,
    kind: dto.kind as AccountKind,
    name: dto.name,
    sub: dto.sub,
    icon: dto.icon,
    color: dto.color as AccentColor,
    currency: dto.currency as CurrencyCode,
    balance: dto.balance,
  };
}

function toCreditCard(dto: CreditCardResponse): CreditCard {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    color: dto.color as AccentColor,
    currency: dto.currency as CurrencyCode,
    debt: dto.debt,
    limit: dto.limit,
    cutoffDay: dto.cutoff_day,
    dueDay: dto.due_day,
  };
}
