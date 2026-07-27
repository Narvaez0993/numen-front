import type { SubscriptionsOverview } from '../../domain';
import type { SubscriptionsRepository } from '../ports/SubscriptionsRepository';

export class GetSubscriptionsUseCase {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async execute(today: string): Promise<SubscriptionsOverview> {
    return this.subscriptionsRepository.getOverview(today);
  }
}
