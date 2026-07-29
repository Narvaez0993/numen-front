import type { AssistantUsage } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class GetAssistantUsageUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(today: string): Promise<AssistantUsage> {
    return this.repository.getUsage(today);
  }
}
