import type { Budget, BudgetsSnapshot, NewBudget } from '../../domain';

export interface BudgetsRepository {
  /** `today` is the device's local day: the period and the daily ceiling derive from it. */
  getSnapshot(today: string): Promise<BudgetsSnapshot>;
  create(input: NewBudget, today: string): Promise<Budget>;
  /** Only the number changes, and it applies to the month in progress. */
  update(id: string, target: number, today: string): Promise<Budget>;
  remove(id: string): Promise<void>;
}
