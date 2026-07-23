import { create } from 'zustand';

import type { Transaction } from '../../domain/types/Transaction';

export type TransactionPatch = Partial<
  Pick<Transaction, 'description' | 'amount' | 'categoryId' | 'accountId'>
>;

type State = {
  initialized: boolean;
  transactions: Transaction[];
};

type Actions = {
  init: (transactions: Transaction[]) => void;
  updateTransaction: (id: string, patch: TransactionPatch) => void;
  removeTransaction: (id: string) => void;
};

export const useMovementsStore = create<State & Actions>((set) => ({
  initialized: false,
  transactions: [],

  init: (transactions) => set({ initialized: true, transactions: [...transactions] }),

  updateTransaction: (id, patch) =>
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
}));
