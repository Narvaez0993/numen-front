import type { AgentOutput } from '../../domain/types/AgentFeed';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class GetCorteUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  execute(outputId: string): Promise<AgentOutput> {
    return this.repository.getOutput(outputId);
  }
}
