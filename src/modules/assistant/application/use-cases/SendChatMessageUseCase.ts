import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { ChatTurn } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class SendChatMessageUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(
    text: string,
    today: string,
    clientMessageId: string,
  ): Promise<Result<ChatTurn, Error>> {
    try {
      return ok(await this.repository.sendMessage(text, today, clientMessageId));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
