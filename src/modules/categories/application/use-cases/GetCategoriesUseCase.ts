import type { Category } from '../../domain';
import type { CategoriesRepository } from '../ports/CategoriesRepository';

export class GetCategoriesUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<readonly Category[]> {
    return this.categoriesRepository.list();
  }
}
