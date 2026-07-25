import { Result, err, ok } from '@/shared/domain';

import type { MovementsRepository } from '../ports/MovementsRepository';

export class DeleteMovementUseCase {
  constructor(private readonly movementsRepository: MovementsRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    try {
      await this.movementsRepository.remove(id);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown movement error'));
    }
  }
}
