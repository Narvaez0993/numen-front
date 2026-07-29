import { Result, err, ok } from '@/shared/domain';

import type { DebtsSnapshot, NewSharedEvent } from '../../domain';
import type { DeudasRepository } from '../ports/DeudasRepository';

export class CreateSharedEventUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(
    input: NewSharedEvent,
    today: string,
  ): Promise<Result<DebtsSnapshot, Error>> {
    try {
      return ok(await this.deudasRepository.createSharedEvent(input, today));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown debt error'));
    }
  }
}
