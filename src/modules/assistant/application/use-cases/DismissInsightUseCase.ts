import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { AssistantRepository } from '../ports/AssistantRepository';

export class DismissInsightUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(key: string): Promise<Result<void, Error>> {
    try {
      return ok(await this.repository.dismissInsight(key));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
