import { Result, err, ok } from '@/shared/domain';

import type { Goal, NewGoal } from '../../domain';
import type { GoalsRepository } from '../ports/GoalsRepository';

export class CreateGoalUseCase {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  async execute(input: NewGoal, today: string): Promise<Result<Goal, Error>> {
    try {
      return ok(await this.goalsRepository.create(input, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown goal error'));
    }
  }
}
