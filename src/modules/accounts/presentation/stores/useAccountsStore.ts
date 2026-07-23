import { create } from 'zustand';

import type { Account, AccountsOverview, CreditCard } from '../../domain';

type AccountPatch = Partial<Pick<Account, 'name' | 'sub' | 'balance'>>;
type CardPatch = Partial<Pick<CreditCard, 'name' | 'debt' | 'limit' | 'cutoffDay'>>;

type State = {
  initialized: boolean;
  accounts: Account[];
  creditCards: CreditCard[];
};

type Actions = {
  init: (overview: AccountsOverview) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, patch: AccountPatch) => void;
  removeAccount: (id: string) => void;
  addCard: (card: CreditCard) => void;
  updateCard: (id: string, patch: CardPatch) => void;
  removeCard: (id: string) => void;
};

export const useAccountsStore = create<State & Actions>((set) => ({
  initialized: false,
  accounts: [],
  creditCards: [],

  init: (overview) =>
    set({
      initialized: true,
      accounts: [...overview.accounts],
      creditCards: [...overview.creditCards],
    }),

  addAccount: (account) => set((s) => ({ accounts: [...s.accounts, account] })),

  updateAccount: (id, patch) =>
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  removeAccount: (id) =>
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

  addCard: (card) => set((s) => ({ creditCards: [...s.creditCards, card] })),

  updateCard: (id, patch) =>
    set((s) => ({
      creditCards: s.creditCards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  removeCard: (id) =>
    set((s) => ({ creditCards: s.creditCards.filter((c) => c.id !== id) })),
}));
