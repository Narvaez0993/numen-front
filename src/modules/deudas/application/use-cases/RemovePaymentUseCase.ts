import { Result, err, ok } from '@/shared/domain';

import type { Deuda } from '../../domain';
import type { DeudasRepository } from '../ports/DeudasRepository';

export class RemovePaymentUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(
    id: string,
    paymentId: string,
    today: string,
  ): Promise<Result<Deuda, Error>> {
    try {
      return ok(await this.deudasRepository.removePayment(id, paymentId, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown debt error'));
    }
  }
}
