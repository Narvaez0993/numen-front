import type { Goal, GoalPatch, GoalsSnapshot, NewGoal } from '../../domain';

export interface GoalsRepository {
  /** `today` is the device's local day: the pace projections derive from it. */
  getSnapshot(today: string): Promise<GoalsSnapshot>;
  create(input: NewGoal, today: string): Promise<Goal>;
  update(id: string, patch: GoalPatch, today: string): Promise<Goal>;
  remove(id: string): Promise<void>;
  /** Money into the pocket: a real transfer — the account balance drops. */
  contribute(id: string, accountId: string, amount: number, today: string): Promise<Goal>;
  /** Money back to an account. More than the pocket holds → `goals.insufficient`. */
  withdraw(id: string, accountId: string, amount: number, today: string): Promise<Goal>;
}
