import { AxiosInstance } from 'axios';

import type { CategoriesRepository } from '../../application';
import type {
  Category,
  CategoryColor,
  CategoryFlow,
  CategoryPatch,
  NewCategory,
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

  async list(): Promise<readonly Category[]> {
    try {
      const { data } = await this.http.get<CategoriesListResponse>('/categories');
      return data.categories.map(toCategory);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async create(input: NewCategory): Promise<Category> {
    try {
      const { data } = await this.http.post<CategoryResponse>('/categories', {
        name: input.name,
        icon: input.icon,
        color: input.color,
        flow: input.flow,
      });
      return toCategory(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async update(id: string, patch: CategoryPatch): Promise<Category> {
    try {
      const { data } = await this.http.patch<CategoryResponse>(`/categories/${id}`, {
        name: patch.name,
        icon: patch.icon,
        color: patch.color,
      });
      return toCategory(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.http.delete(`/categories/${id}`);
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
  };
}
