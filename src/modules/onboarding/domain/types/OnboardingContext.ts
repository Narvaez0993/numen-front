import type { BankId } from './Bank';
import type { GoalId } from './Goal';

export type OnboardingContext = {
  name: string;
  email: string;
  goal: GoalId | null;
  bankId: BankId | null;
  sourceName: string | null;
  balance: number;
};

export const EMPTY_ONBOARDING_CONTEXT: OnboardingContext = {
  name: '',
  email: '',
  goal: null,
  bankId: null,
  sourceName: null,
  balance: 0,
};
