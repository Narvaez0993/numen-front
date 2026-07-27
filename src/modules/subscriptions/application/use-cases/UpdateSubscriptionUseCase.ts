import { Result, err, ok } from '@/shared/domain';

import type { Subscription, SubscriptionPatch } from '../../domain';
import type { SubscriptionsRepository } from '../ports/SubscriptionsRepository';

export class UpdateSubscriptionUseCase {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async execute(
    id: string,
    patch: SubscriptionPatch,
  ): Promise<Result<Subscription, Error>> {
    try {
      return ok(await this.subscriptionsRepository.update(id, patch));
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error('Unknown subscription error'),
      );
    }
  }
}
