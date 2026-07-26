import { Result, err, ok } from '@/shared/domain';

import type { SubscriptionsRepository } from '../ports/SubscriptionsRepository';

export class DeleteSubscriptionUseCase {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    try {
      return ok(await this.subscriptionsRepository.remove(id));
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error('Unknown subscription error'),
      );
    }
  }
}
