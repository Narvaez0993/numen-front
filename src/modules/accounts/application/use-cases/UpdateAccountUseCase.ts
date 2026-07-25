import { Result, err, ok } from '@/shared/domain';

import type { Account, AccountPatch } from '../../domain';
import type { AccountsRepository } from '../ports/AccountsRepository';

export class UpdateAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(id: string, patch: AccountPatch): Promise<Result<Account, Error>> {
    try {
      return ok(await this.accountsRepository.updateAccount(id, patch));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown account error'));
    }
  }
}
