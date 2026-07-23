import type { Category } from './Category';

export type CategoriesOverview = {
  categories: readonly Category[];
  totalSpent: number;
  activeCount: number;
  totalCount: number;
};
