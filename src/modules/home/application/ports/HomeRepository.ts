import type { HomeOverview } from '../../domain/types/HomeOverview';

export interface HomeRepository {
  /** `today` is the caller's local day (`YYYY-MM-DD`) — see `HttpHomeRepository`. */
  getOverview(today: string): Promise<HomeOverview>;
}
