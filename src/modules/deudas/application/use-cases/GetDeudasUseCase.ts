import type { DebtsSnapshot } from '../../domain';
import type { DeudasRepository } from '../ports/DeudasRepository';

export class GetDeudasUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(today: string): Promise<DebtsSnapshot> {
    return this.deudasRepository.getSnapshot(today);
  }
}
