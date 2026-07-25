import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { AccountsOverview } from '../../domain';

/** Every accounts mutation invalidates this key. */
export const ACCOUNTS_OVERVIEW_KEY = ['accounts', 'overview'] as const;

export function useAccounts() {
  return useQuery<AccountsOverview>({
    queryKey: ACCOUNTS_OVERVIEW_KEY,
    queryFn: () => container.getAccountsOverviewUseCase.execute(),
  });
}
