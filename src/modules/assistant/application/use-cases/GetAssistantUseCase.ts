import type { AssistantSnapshot } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class GetAssistantUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  async execute(): Promise<AssistantSnapshot> {
    return this.assistantRepository.getSnapshot();
  }
}
