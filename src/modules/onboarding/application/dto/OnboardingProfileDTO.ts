import type { BankId, GoalId } from '../../domain';

export type OnboardingProfileDTO = {
  name: string;
  goal: GoalId | null;
  bankId: BankId | null;
  sourceName: string | null;
  balance: number;
};
