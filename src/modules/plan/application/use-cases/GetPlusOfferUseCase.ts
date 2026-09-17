import type { PlusOffer } from '../../domain';
import type { PlanRepository } from '../ports/PlanRepository';

export class GetPlusOfferUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<PlusOffer> {
    return this.planRepository.getPlusOffer();
  }
}
