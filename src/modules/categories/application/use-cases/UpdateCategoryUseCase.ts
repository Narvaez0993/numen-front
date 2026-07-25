import { type Result, err, ok } from '@/shared/domain';

import type { Category, CategoryPatch } from '../../domain';
import type { CategoriesRepository } from '../ports/CategoriesRepository';

export class UpdateCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(id: string, patch: CategoryPatch): Promise<Result<Category, Error>> {
    try {
      const category = await this.categoriesRepository.update(id, patch);
      return ok(category);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
