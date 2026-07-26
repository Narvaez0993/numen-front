import type { MovementsSummary } from '../../domain';
import type { MovementsRepository } from '../ports/MovementsRepository';

export class SummarizeMovementsUseCase {
  constructor(private readonly movementsRepository: MovementsRepository) {}

  async execute(range: { from: string; to: string }): Promise<MovementsSummary> {
    return this.movementsRepository.summarize(range);
  }
}
