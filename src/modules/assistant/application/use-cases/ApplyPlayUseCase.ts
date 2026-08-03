import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { AgentOutput } from '../../domain/types/AgentFeed';
import type { AssistantRepository } from '../ports/AssistantRepository';

export type ApplyPlayInput = {
  outputId: string;
  playId: string;
  accountId: string | null;
  today: string;
};

export class ApplyPlayUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(input: ApplyPlayInput): Promise<Result<AgentOutput, Error>> {
    try {
      return ok(
        await this.repository.applyPlay(
          input.outputId,
          input.playId,
          input.accountId,
          input.today,
        ),
      );
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
