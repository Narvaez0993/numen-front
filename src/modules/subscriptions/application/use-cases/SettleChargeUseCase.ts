import { Result, err, ok } from '@/shared/domain';

import type { SubscriptionCharge } from '../../domain';
import type { SubscriptionsRepository } from '../ports/SubscriptionsRepository';

/**
 * Confirming and skipping a charge, together: both answer the same question ("did
 * this happen?") and both are the only ways a charge stops being pending from the
 * client. Keeping them in one place means the screen cannot wire one and forget the
 * other.
 */
export class SettleChargeUseCase {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async confirm(id: string, amount?: number): Promise<Result<SubscriptionCharge, Error>> {
    try {
      return ok(await this.subscriptionsRepository.confirmCharge(id, amount));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown charge error'));
    }
  }

  async skip(id: string): Promise<Result<SubscriptionCharge, Error>> {
    try {
      return ok(await this.subscriptionsRepository.skipCharge(id));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown charge error'));
    }
  }
}
