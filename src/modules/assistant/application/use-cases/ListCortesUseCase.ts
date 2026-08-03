import type { AgentOutput } from '../../domain/types/AgentFeed';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class ListCortesUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  execute(limit?: number): Promise<AgentOutput[]> {
    return this.repository.listOutputs('monthly_summary', limit);
  }
}
