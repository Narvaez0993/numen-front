import type { SubscriptionCharge } from '../../domain';
import type { SubscriptionsRepository } from '../ports/SubscriptionsRepository';

export class GetChargesUseCase {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async execute(status?: string): Promise<SubscriptionCharge[]> {
    return this.subscriptionsRepository.listCharges(status);
  }
}
