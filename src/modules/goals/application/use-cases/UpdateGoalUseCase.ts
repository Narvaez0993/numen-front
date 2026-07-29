import { Result, err, ok } from '@/shared/domain';

import type { Goal, GoalPatch } from '../../domain';
import type { GoalsRepository } from '../ports/GoalsRepository';

export class UpdateGoalUseCase {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  async execute(
    id: string,
    patch: GoalPatch,
    today: string,
  ): Promise<Result<Goal, Error>> {
    try {
      return ok(await this.goalsRepository.update(id, patch, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown goal error'));
    }
  }
}
