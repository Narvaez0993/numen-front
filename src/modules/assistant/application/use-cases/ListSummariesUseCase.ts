import type { AgentOutput } from '../../domain/types/AgentFeed';
import type { AssistantRepository } from '../ports/AssistantRepository';

/**
 * Everything the agent has delivered — Cortes and weekly reviews in one list,
 * newest first. Two calls because the endpoint filters by a single kind; the
 * merge lives here so the screen receives one ordered history.
 *
 * It replaced `ListCortesUseCase`: the archive used to hold only the monthly
 * story, which left the weekly reviews reachable from nowhere once they left
 * the chat.
 */
export class ListSummariesUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(limit?: number): Promise<AgentOutput[]> {
    const [cortes, weeklies] = await Promise.all([
      this.repository.listOutputs('monthly_summary', limit),
      this.repository.listOutputs('weekly_review', limit),
    ]);
    return [...cortes, ...weeklies].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
}
