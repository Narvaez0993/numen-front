import { AxiosInstance } from 'axios';

import type { CategoriesRepository } from '../../application';
import type {
  CategoriesOverview,
  Category,
  CategoryColor,
  CategoryFlow,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type CategoryResponse = {
  id: string;
  name: string;
  icon: string;
  color: string;
  flow: string;
  is_standard: boolean;
};

type CategoriesListResponse = {
  categories: CategoryResponse[];
};

export class HttpCategoriesRepository implements CategoriesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getOverview(): Promise<CategoriesOverview> {
    try {
      const { data } = await this.http.get<CategoriesListResponse>('/categories');
      const categories = data.categories.map(toCategory);
      // `spent`/`count` are movement-derived; 0 until the movements module lands.
      return {
        categories,
        totalSpent: 0,
        activeCount: 0,
        totalCount: categories.length,
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toCategory(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    color: dto.color as CategoryColor,
    flow: dto.flow as CategoryFlow,
    isStandard: dto.is_standard,
    spent: 0,
    count: 0,
  };
}
