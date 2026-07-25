import type {
  CategoriesOverview,
  Category,
  CategoryPatch,
  NewCategory,
} from '../../domain';

export interface CategoriesRepository {
  getOverview(): Promise<CategoriesOverview>;
  create(input: NewCategory): Promise<Category>;
  update(id: string, patch: CategoryPatch): Promise<Category>;
  remove(id: string): Promise<void>;
}
