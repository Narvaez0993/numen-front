import type { PlanComparison } from '../../domain';
import type { PlanRepository } from '../ports/PlanRepository';

export class GetPlanComparisonUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<PlanComparison> {
    return this.planRepository.getComparison();
  }
}
