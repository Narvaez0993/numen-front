import { Result, err, ok } from '@/shared/domain';

import type { Deuda } from '../../domain';
import type { DeudasRepository } from '../ports/DeudasRepository';

/**
 * They paid after all. The claim comes back and the loss expense is deleted, so the
 * month it landed in stops showing a loss that never happened.
 *
 * It exists because writing off is a judgement made under uncertainty, and one the
 * user cannot take back is one they will hesitate to make at all.
 */
export class ReopenDebtUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(id: string, today: string): Promise<Result<Deuda, Error>> {
    try {
      return ok(await this.deudasRepository.reopen(id, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown debt error'));
    }
  }
}
