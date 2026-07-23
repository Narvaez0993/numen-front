import type { AccountsOverview } from '../../domain';

export interface AccountsRepository {
  getOverview(): Promise<AccountsOverview>;
}
