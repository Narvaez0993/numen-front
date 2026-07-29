import { Result, err, ok } from '@/shared/domain';

import type { DeudasRepository } from '../ports/DeudasRepository';

export class DeleteDebtUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    try {
      return ok(await this.deudasRepository.remove(id));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown debt error'));
    }
  }
}
