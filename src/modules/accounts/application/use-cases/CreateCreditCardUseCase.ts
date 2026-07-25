import { Result, err, ok } from '@/shared/domain';

import type { CreditCard, NewCreditCard } from '../../domain';
import type { AccountsRepository } from '../ports/AccountsRepository';

export class CreateCreditCardUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(input: NewCreditCard): Promise<Result<CreditCard, Error>> {
    try {
      return ok(await this.accountsRepository.createCard(input));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown card error'));
    }
  }
}
