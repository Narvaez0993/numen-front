import type { ChatHistory } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class GetChatHistoryUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(limit?: number, before?: string): Promise<ChatHistory> {
    return this.repository.getHistory(limit, before);
  }
}
