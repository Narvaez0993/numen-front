import { Result, err, ok } from '@/shared/domain';

import type { BudgetsRepository } from '../ports/BudgetsRepository';

export class DeleteBudgetUseCase {
  constructor(private readonly budgetsRepository: BudgetsRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    try {
      return ok(await this.budgetsRepository.remove(id));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown budget error'));
    }
  }
}
