import type { CategoriesOverview } from '../../domain';
import type { CategoriesRepository } from '../ports/CategoriesRepository';

export class GetCategoriesUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<CategoriesOverview> {
    return this.categoriesRepository.getOverview();
  }
}
