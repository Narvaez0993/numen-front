import type { BankId } from './Bank';
import type { GoalId } from './Goal';

export type OnboardingExpense = {
  desc: string;
  cat: string;
  icon: string;
  color: 'mint' | 'coral' | 'purple' | 'amber' | 'pink';
  amount: number;
};

export type OnboardingContext = {
  name: string;
  goal: GoalId | null;
  bankId: BankId | null;
  sourceName: string | null;
  balance: number;
  transcript: string | null;
  expense: OnboardingExpense | null;
};

export const EMPTY_ONBOARDING_CONTEXT: OnboardingContext = {
  name: '',
  goal: null,
  bankId: null,
  sourceName: null,
  balance: 0,
  transcript: null,
  expense: null,
};
