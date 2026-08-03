import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { AgentOutput } from '../../domain/types/AgentFeed';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class MarkCorteReadUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(outputId: string): Promise<Result<AgentOutput, Error>> {
    try {
      return ok(await this.repository.markOutputRead(outputId));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
