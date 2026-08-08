import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type {
  ConfirmedDebtDraft,
  DebtDraftOverrides,
} from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

/**
 * Confirming is when the debt becomes real — and, when an account is named, when
 * the cash actually leaves it. Lending is not spending: it travels as a transfer,
 * so the month's expenses do not move.
 */
export class ConfirmDebtDraftUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(
    draftId: string,
    overrides: DebtDraftOverrides,
    today: string,
  ): Promise<Result<ConfirmedDebtDraft, Error>> {
    try {
      return ok(await this.repository.confirmDebtDraft(draftId, overrides, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
