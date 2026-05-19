import type { CategoriesOverview } from '../../domain';

export interface CategoriesRepository {
  getOverview(): Promise<CategoriesOverview>;
}
