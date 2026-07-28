import { Result, err, ok } from '@/shared/domain';

import type { Deuda } from '../../domain';
import type { DeudasRepository } from '../ports/DeudasRepository';

export class AddPaymentUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(
    id: string,
    amount: number,
    today: string,
    note?: string,
  ): Promise<Result<Deuda, Error>> {
    try {
      return ok(await this.deudasRepository.addPayment(id, amount, today, note));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown debt error'));
    }
  }
}
