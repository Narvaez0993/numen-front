import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { ConfirmedDraft, DraftOverrides } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class ConfirmDraftUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(
    draftId: string,
    overrides: DraftOverrides,
    today: string,
  ): Promise<Result<ConfirmedDraft, Error>> {
    try {
      return ok(await this.repository.confirmDraft(draftId, overrides, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
