import type { HomeOverview } from '../../domain/types/HomeOverview';

export interface HomeRepository {
  getOverview(): Promise<HomeOverview>;
}
