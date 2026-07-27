import { Result, err, ok } from '@/shared/domain';

import type { Budget } from '../../domain';
import type { BudgetsRepository } from '../ports/BudgetsRepository';

export class UpdateBudgetUseCase {
  constructor(private readonly budgetsRepository: BudgetsRepository) {}

  async execute(
    id: string,
    target: number,
    today: string,
  ): Promise<Result<Budget, Error>> {
    try {
      return ok(await this.budgetsRepository.update(id, target, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown budget error'));
    }
  }
}
