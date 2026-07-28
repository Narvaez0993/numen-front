import { Result, err, ok } from '@/shared/domain';

import type { GoalsRepository } from '../ports/GoalsRepository';

export class DeleteGoalUseCase {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    try {
      return ok(await this.goalsRepository.remove(id));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown goal error'));
    }
  }
}
