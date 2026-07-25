import { Result, err, ok } from '@/shared/domain';

import type { CreditCard, CreditCardPatch } from '../../domain';
import type { AccountsRepository } from '../ports/AccountsRepository';

export class UpdateCreditCardUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(id: string, patch: CreditCardPatch): Promise<Result<CreditCard, Error>> {
    try {
      return ok(await this.accountsRepository.updateCard(id, patch));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown card error'));
    }
  }
}
