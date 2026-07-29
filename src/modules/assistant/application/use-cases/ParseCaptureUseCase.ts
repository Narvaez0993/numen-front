import type { Result } from '@/shared/domain';
import { err, ok } from '@/shared/domain';

import type { CaptureSource, ParseOutcome } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../ports/AssistantRepository';

export class ParseCaptureUseCase {
  constructor(private readonly repository: AssistantRepository) {}

  async execute(
    text: string,
    source: CaptureSource,
    today: string,
  ): Promise<Result<ParseOutcome, Error>> {
    try {
      return ok(await this.repository.parseCapture(text, source, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
