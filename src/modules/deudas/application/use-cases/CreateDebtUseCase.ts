import { Result, err, ok } from '@/shared/domain';

import type { Deuda, NewDebt } from '../../domain';
import type { DeudasRepository } from '../ports/DeudasRepository';

export class CreateDebtUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(input: NewDebt, today: string): Promise<Result<Deuda, Error>> {
    try {
      return ok(await this.deudasRepository.create(input, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown debt error'));
    }
  }
}
