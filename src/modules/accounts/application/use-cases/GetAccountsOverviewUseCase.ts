import type { AccountsOverview } from '../../domain';
import type { AccountsRepository } from '../ports/AccountsRepository';

export class GetAccountsOverviewUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(): Promise<AccountsOverview> {
    return this.accountsRepository.getOverview();
  }
}
