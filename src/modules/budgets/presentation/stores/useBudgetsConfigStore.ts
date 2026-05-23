import { create } from 'zustand';

import type { BudgetsSnapshot, CategoryBudget } from '../../domain/types/Budget';

type State = {
  initialized: boolean;
  techo: number | null;
  topes: Record<string, number>;
  customCategories: CategoryBudget[];

  initFromSnapshot: (snapshot: BudgetsSnapshot) => void;
  setTecho: (amount: number) => void;
  deleteTecho: () => void;
  setTope: (catId: string, amount: number) => void;
  deleteTope: (catId: string) => void;
  setTopes: (topes: Record<string, number>) => void;
  addCustomCategory: (cat: CategoryBudget) => void;
  reset: () => void;
};

export const useBudgetsConfigStore = create<State>((set) => ({
  initialized: false,
  techo: null,
  topes: {},
  customCategories: [],

  initFromSnapshot: (snapshot) =>
    set((s) => {
      if (s.initialized) return s;
      const seedTopes: Record<string, number> = {};
      for (const c of snapshot.categories) seedTopes[c.id] = c.target;
      return {
        initialized: true,
        techo: snapshot.month.target,
        topes: seedTopes,
        customCategories: [],
      };
    }),

  setTecho: (amount) => set({ techo: amount }),

  deleteTecho: () => set({ techo: null, topes: {} }),

  setTope: (catId, amount) => set((s) => ({ topes: { ...s.topes, [catId]: amount } })),

  deleteTope: (catId) =>
    set((s) => {
      const next = { ...s.topes };
      delete next[catId];
      return { topes: next };
    }),

  setTopes: (topes) => set({ topes }),

  addCustomCategory: (cat) =>
    set((s) => ({ customCategories: [...s.customCategories, cat] })),

  reset: () =>
    set({
      initialized: false,
      techo: null,
      topes: {},
      customCategories: [],
    }),
}));
