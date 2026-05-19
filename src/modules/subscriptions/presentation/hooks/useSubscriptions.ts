import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { SubscriptionsOverview } from '../../domain';

export function useSubscriptions() {
  return useQuery<SubscriptionsOverview>({
    queryKey: ['subscriptions', 'overview'],
    queryFn: () => container.getSubscriptionsUseCase.execute(),
  });
}
