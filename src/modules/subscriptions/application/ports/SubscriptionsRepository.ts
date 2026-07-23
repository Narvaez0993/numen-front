import type { SubscriptionsOverview } from '../../domain';

export interface SubscriptionsRepository {
  getOverview(): Promise<SubscriptionsOverview>;
}
