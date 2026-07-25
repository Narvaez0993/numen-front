import { Result, err, ok } from '@/shared/domain';

import type { AccountsRepository } from '../ports/AccountsRepository';

export class DeleteCreditCardUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    try {
      await this.accountsRepository.removeCard(id);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown card error'));
    }
  }
}
