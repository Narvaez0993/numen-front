import type { AssistantSnapshot } from '../../domain/types/Assistant';

export interface AssistantRepository {
  getSnapshot(): Promise<AssistantSnapshot>;
}
