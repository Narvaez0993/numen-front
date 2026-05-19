import type { SubscriptionsOverview } from '../../domain';
import type { SubscriptionsRepository } from '../ports/SubscriptionsRepository';

export class GetSubscriptionsUseCase {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async execute(): Promise<SubscriptionsOverview> {
    return this.subscriptionsRepository.getOverview();
  }
}
