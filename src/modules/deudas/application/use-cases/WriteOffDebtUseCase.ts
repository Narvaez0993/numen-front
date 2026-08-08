import { Result, err, ok } from '@/shared/domain';

import type { Deuda } from '../../domain';
import type { DeudasRepository } from '../ports/DeudasRepository';

/**
 * Giving up on a claim — the one moment lending becomes spending.
 *
 * It takes no amount: how much the loss costs is the ledger's to work out, because
 * only it knows what cash actually crossed. A dinner split moved none — the bill
 * already left as one expense — so writing it off costs nothing today.
 */
export class WriteOffDebtUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(id: string, today: string): Promise<Result<Deuda, Error>> {
    try {
      return ok(await this.deudasRepository.writeOff(id, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown debt error'));
    }
  }
}
