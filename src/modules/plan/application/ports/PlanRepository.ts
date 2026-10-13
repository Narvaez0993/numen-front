import type { PlusOffer } from '../../domain';

export interface PlanRepository {
  getPlusOffer(): Promise<PlusOffer>;
}
