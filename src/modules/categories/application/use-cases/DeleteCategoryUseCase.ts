import { type Result, err, ok } from '@/shared/domain';

import type { CategoriesRepository } from '../ports/CategoriesRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    try {
      await this.categoriesRepository.remove(id);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
