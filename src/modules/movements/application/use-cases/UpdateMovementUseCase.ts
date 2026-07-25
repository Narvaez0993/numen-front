import { Result, err, ok } from '@/shared/domain';

import type { Movement, MovementPatch } from '../../domain';
import type { MovementsRepository } from '../ports/MovementsRepository';

export class UpdateMovementUseCase {
  constructor(private readonly movementsRepository: MovementsRepository) {}

  async execute(id: string, patch: MovementPatch): Promise<Result<Movement, Error>> {
    try {
      return ok(await this.movementsRepository.update(id, patch));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown movement error'));
    }
  }
}
