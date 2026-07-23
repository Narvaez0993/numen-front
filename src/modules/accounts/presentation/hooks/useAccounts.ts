import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { AccountsOverview } from '../../domain';

export function useAccounts() {
  return useQuery<AccountsOverview>({
    queryKey: ['accounts', 'overview'],
    queryFn: () => container.getAccountsOverviewUseCase.execute(),
  });
}
