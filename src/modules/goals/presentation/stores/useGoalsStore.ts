import { create } from 'zustand';

import type { Goal } from '../../domain/types/Goal';
import { MOCK_GOALS } from '../constants/mockGoals';

export type GoalPatch = Partial<Pick<Goal, 'name' | 'target'>>;

type State = {
  goals: Goal[];
};

type Actions = {
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, patch: GoalPatch) => void;
  removeGoal: (id: string) => void;
  addContribution: (id: string, amount: number) => void;
};

export const useGoalsStore = create<State & Actions>((set) => ({
  goals: [...MOCK_GOALS],

  addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),

  updateGoal: (id, patch) =>
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    })),

  removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

  addContribution: (id, amount) =>
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, saved: g.saved + amount } : g)),
    })),
}));
