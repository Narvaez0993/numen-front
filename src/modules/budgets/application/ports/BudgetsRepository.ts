import type { BudgetsSnapshot } from '../../domain/types/Budget';

export interface BudgetsRepository {
  getSnapshot(): Promise<BudgetsSnapshot>;
}
