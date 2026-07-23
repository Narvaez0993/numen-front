import type {
  MovementsRepository,
  MovementsSnapshot,
} from '../ports/MovementsRepository';

export class GetMovementsUseCase {
  constructor(private readonly movementsRepository: MovementsRepository) {}

  async execute(): Promise<MovementsSnapshot> {
    return this.movementsRepository.getAll();
  }
}
