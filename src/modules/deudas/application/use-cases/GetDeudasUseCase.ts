import type { DebtsSnapshot } from '../../domain/types/Deuda';
import type { DeudasRepository } from '../ports/DeudasRepository';

export class GetDeudasUseCase {
  constructor(private readonly deudasRepository: DeudasRepository) {}

  async execute(): Promise<DebtsSnapshot> {
    return this.deudasRepository.getSnapshot();
  }
}
