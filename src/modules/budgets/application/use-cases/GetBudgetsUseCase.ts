import type { BudgetsSnapshot } from '../../domain/types/Budget';
import type { BudgetsRepository } from '../ports/BudgetsRepository';

export class GetBudgetsUseCase {
  constructor(private readonly budgetsRepository: BudgetsRepository) {}

  async execute(): Promise<BudgetsSnapshot> {
    return this.budgetsRepository.getSnapshot();
  }
}
