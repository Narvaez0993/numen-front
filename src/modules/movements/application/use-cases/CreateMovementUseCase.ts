import { Result, err, ok } from '@/shared/domain';

import type { Movement, NewMovement } from '../../domain';
import type { MovementsRepository } from '../ports/MovementsRepository';

export class CreateMovementUseCase {
  constructor(private readonly movementsRepository: MovementsRepository) {}

  async execute(
    input: NewMovement,
    idempotencyKey?: string,
  ): Promise<Result<Movement, Error>> {
    try {
      return ok(await this.movementsRepository.create(input, idempotencyKey));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown movement error'));
    }
  }
}
