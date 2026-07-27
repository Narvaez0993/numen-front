import { Result, err, ok } from '@/shared/domain';

import type { NewSubscription, Subscription } from '../../domain';
import type { SubscriptionsRepository } from '../ports/SubscriptionsRepository';

export class CreateSubscriptionUseCase {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async execute(input: NewSubscription): Promise<Result<Subscription, Error>> {
    try {
      return ok(await this.subscriptionsRepository.create(input));
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error('Unknown subscription error'),
      );
    }
  }
}
