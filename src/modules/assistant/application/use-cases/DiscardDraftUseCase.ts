import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { MovementDraft } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class DiscardDraftUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(draftId: string): Promise<Result<MovementDraft, Error>> {
    try {
      return ok(await this.repository.discardDraft(draftId));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
