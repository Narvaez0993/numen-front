import { Result, err, ok } from '@/shared/domain';

import type { Goal } from '../../domain';
import type { GoalsRepository } from '../ports/GoalsRepository';

export type MoveDirection = 'in' | 'out';

/** One use case for both directions: the sheet is a single gesture with a toggle. */
export class MoveGoalFundsUseCase {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  async execute(
    id: string,
    direction: MoveDirection,
    accountId: string,
    amount: number,
    today: string,
  ): Promise<Result<Goal, Error>> {
    try {
      const goal =
        direction === 'in'
          ? await this.goalsRepository.contribute(id, accountId, amount, today)
          : await this.goalsRepository.withdraw(id, accountId, amount, today);
      return ok(goal);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown goal error'));
    }
  }
}
