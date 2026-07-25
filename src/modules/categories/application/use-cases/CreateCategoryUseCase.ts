import { type Result, err, ok } from '@/shared/domain';

import type { Category, NewCategory } from '../../domain';
import type { CategoriesRepository } from '../ports/CategoriesRepository';

export class CreateCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(input: NewCategory): Promise<Result<Category, Error>> {
    try {
      const category = await this.categoriesRepository.create(input);
      return ok(category);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
