import { Result, err, ok } from '@/shared/domain';

import type { Budget, NewBudget } from '../../domain';
import type { BudgetsRepository } from '../ports/BudgetsRepository';

export class CreateBudgetUseCase {
  constructor(private readonly budgetsRepository: BudgetsRepository) {}

  async execute(input: NewBudget, today: string): Promise<Result<Budget, Error>> {
    try {
      return ok(await this.budgetsRepository.create(input, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown budget error'));
    }
  }
}
