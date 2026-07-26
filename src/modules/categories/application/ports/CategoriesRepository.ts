import type { Category, CategoryPatch, NewCategory } from '../../domain';

export interface CategoriesRepository {
  /** The catalog. Spend is a fact of a period, so it is not part of it. */
  list(): Promise<readonly Category[]>;
  create(input: NewCategory): Promise<Category>;
  update(id: string, patch: CategoryPatch): Promise<Category>;
  remove(id: string): Promise<void>;
}
