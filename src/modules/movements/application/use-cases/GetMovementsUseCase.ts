import type { Movement } from '../../domain';
import type { MovementsQuery, MovementsRepository } from '../ports/MovementsRepository';

export class GetMovementsUseCase {
  constructor(private readonly movementsRepository: MovementsRepository) {}

  async execute(query: MovementsQuery): Promise<Movement[]> {
    return this.movementsRepository.list(query);
  }
}
