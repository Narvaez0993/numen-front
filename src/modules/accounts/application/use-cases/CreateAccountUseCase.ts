import { Result, err, ok } from '@/shared/domain';

import type { Account, NewAccount } from '../../domain';
import type { AccountsRepository } from '../ports/AccountsRepository';

export class CreateAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(input: NewAccount): Promise<Result<Account, Error>> {
    try {
      return ok(await this.accountsRepository.createAccount(input));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown account error'));
    }
  }
}
