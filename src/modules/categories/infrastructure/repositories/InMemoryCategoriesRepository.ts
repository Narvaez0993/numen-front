import type { CategoriesRepository } from '../../application';
import type {
  CategoriesOverview,
  Category,
  CategoryPatch,
  NewCategory,
} from '../../domain';

const STANDARD_CATEGORIES: readonly Category[] = [
  {
    id: 'mercado',
    name: 'Mercado',
    icon: 'shopping-cart',
    color: 'mint',
    flow: 'expense',
    isStandard: true,
    spent: 356_400,
    count: 9,
  },
  {
    id: 'domi',
    name: 'Domicilios',
    icon: 'truck',
    color: 'coral',
    flow: 'expense',
    isStandard: true,
    spent: 222_000,
    count: 10,
  },
  {
    id: 'transporte',
    name: 'Transporte',
    icon: 'car',
    color: 'purple',
    flow: 'expense',
    isStandard: true,
    spent: 136_000,
    count: 7,
  },
  {
    id: 'comida',
    name: 'Comida fuera',
    icon: 'tools-kitchen-2',
    color: 'pink',
    flow: 'expense',
    isStandard: true,
    spent: 198_500,
    count: 8,
  },
  {
    id: 'cafe',
    name: 'Café',
    icon: 'coffee',
    color: 'amber',
    flow: 'expense',
    isStandard: true,
    spent: 422_400,
    count: 14,
  },
  {
    id: 'entret',
    name: 'Entretenimiento',
    icon: 'movie',
    color: 'purple',
    flow: 'expense',
    isStandard: true,
    spent: 102_000,
    count: 3,
  },
  {
    id: 'subs',
    name: 'Suscripciones',
    icon: 'refresh',
    color: 'amber',
    flow: 'expense',
    isStandard: true,
    spent: 92_800,
    count: 3,
  },
  {
    id: 'servicios',
    name: 'Servicios',
    icon: 'bolt',
    color: 'amber',
    flow: 'expense',
    isStandard: true,
    spent: 127_000,
    count: 1,
  },
  {
    id: 'salud',
    name: 'Salud',
    icon: 'heart',
    color: 'mint',
    flow: 'expense',
    isStandard: true,
    spent: 23_400,
    count: 1,
  },
  {
    id: 'educacion',
    name: 'Educación',
    icon: 'school',
    color: 'purple',
    flow: 'expense',
    isStandard: true,
    spent: 0,
    count: 0,
  },
  {
    id: 'hogar',
    name: 'Hogar',
    icon: 'home-2',
    color: 'mint',
    flow: 'expense',
    isStandard: true,
    spent: 0,
    count: 0,
  },
  {
    id: 'otros',
    name: 'Otros',
    icon: 'dots',
    color: 'neutral',
    flow: 'expense',
    isStandard: true,
    spent: 18_500,
    count: 1,
  },
];

export class InMemoryCategoriesRepository implements CategoriesRepository {
  private custom: Category[] = [];
  private seq = 0;

  async getOverview(): Promise<CategoriesOverview> {
    const categories = [...STANDARD_CATEGORIES, ...this.custom];
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    const activeCount = categories.filter((c) => c.count > 0).length;
    return {
      categories,
      totalSpent,
      activeCount,
      totalCount: categories.length,
    };
  }

  async create(input: NewCategory): Promise<Category> {
    this.seq += 1;
    const category: Category = {
      id: `custom-${this.seq}`,
      ...input,
      isStandard: false,
      spent: 0,
      count: 0,
    };
    this.custom.push(category);
    return category;
  }

  async update(id: string, patch: CategoryPatch): Promise<Category> {
    const existing = this.custom.find((c) => c.id === id);
    if (!existing) {
      throw new Error('Category not found');
    }
    const updated: Category = { ...existing, ...patch };
    this.custom = this.custom.map((c) => (c.id === id ? updated : c));
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.custom = this.custom.filter((c) => c.id !== id);
  }
}
