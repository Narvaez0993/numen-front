import type { GoalsSnapshot } from '../../domain';
import type { GoalsRepository } from '../ports/GoalsRepository';

export class GetGoalsUseCase {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  async execute(today: string): Promise<GoalsSnapshot> {
    return this.goalsRepository.getSnapshot(today);
  }
}
