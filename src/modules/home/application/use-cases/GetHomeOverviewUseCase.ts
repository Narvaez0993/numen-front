import type { HomeOverview } from '../../domain/types/HomeOverview';
import type { HomeRepository } from '../ports/HomeRepository';

export class GetHomeOverviewUseCase {
  constructor(private readonly homeRepository: HomeRepository) {}

  async execute(today: string): Promise<HomeOverview> {
    return this.homeRepository.getOverview(today);
  }
}
