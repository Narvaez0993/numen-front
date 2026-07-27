import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';
import { MONEY_VIEW_KEYS } from '@/shared/presentation/query/moneyViews';

import type { AccountsOverview } from '../../domain';

/** Every accounts mutation invalidates this key. */
export const ACCOUNTS_OVERVIEW_KEY = MONEY_VIEW_KEYS.accounts;

export function useAccounts() {
  return useQuery<AccountsOverview>({
    queryKey: ACCOUNTS_OVERVIEW_KEY,
    queryFn: () => container.getAccountsOverviewUseCase.execute(),
  });
}
