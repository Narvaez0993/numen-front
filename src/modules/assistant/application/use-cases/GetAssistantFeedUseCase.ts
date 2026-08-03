import type { AgentFeed } from '../../domain/types/AgentFeed';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class GetAssistantFeedUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(today: string): Promise<AgentFeed> {
    return this.repository.getFeed(today);
  }
}
