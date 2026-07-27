import type { BudgetsSnapshot } from '../../domain';
import type { BudgetsRepository } from '../ports/BudgetsRepository';

export class GetBudgetsUseCase {
  constructor(private readonly budgetsRepository: BudgetsRepository) {}

  async execute(today: string): Promise<BudgetsSnapshot> {
    return this.budgetsRepository.getSnapshot(today);
  }
}
