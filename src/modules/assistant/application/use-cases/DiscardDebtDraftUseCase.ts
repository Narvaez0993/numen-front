import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { DebtDraft } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

/** Discarding never touches the ledger — the draft only ever existed in chat. */
export class DiscardDebtDraftUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(draftId: string): Promise<Result<DebtDraft, Error>> {
    try {
      return ok(await this.repository.discardDebtDraft(draftId));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
