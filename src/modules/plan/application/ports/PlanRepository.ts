import type { PlanComparison } from '../../domain';

export interface PlanRepository {
  getComparison(): Promise<PlanComparison>;
}
