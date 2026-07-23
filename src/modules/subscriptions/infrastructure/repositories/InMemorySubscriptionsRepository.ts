import type { Subscription, SubscriptionsOverview } from '../../domain';
import type { SubscriptionsRepository } from '../../application';

const SUBSCRIPTIONS: readonly Subscription[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    icon: 'device-tv',
    color: 'coral',
    amount: 30_900,
    every: 30,
    account: 'BBVA Débito',
    nextInDays: 2,
    urgent: true,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'brand-spotify',
    color: 'mint',
    amount: 16_900,
    every: 30,
    account: 'BBVA Débito',
    nextInDays: 5,
    urgent: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: 'notebook',
    color: 'purple',
    amount: 45_000,
    every: 30,
    account: 'BBVA Crédito',
    nextInDays: 9,
    urgent: false,
  },
];

export class InMemorySubscriptionsRepository implements SubscriptionsRepository {
  async getOverview(): Promise<SubscriptionsOverview> {
    const monthly = SUBSCRIPTIONS.reduce((sum, s) => sum + s.amount, 0);
    return {
      subscriptions: SUBSCRIPTIONS,
      monthly,
      yearly: monthly * 12,
      count: SUBSCRIPTIONS.length,
    };
  }
}
