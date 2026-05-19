import type { CategoriesOverview, Category } from '../../domain';
import type { CategoriesRepository } from '../../application';

const STANDARD_CATEGORIES: readonly Category[] = [
  {
    id: 'mercado',
    name: 'Mercado',
    icon: 'shopping-cart',
    color: 'mint',
    spent: 356_400,
    count: 9,
  },
  {
    id: 'domi',
    name: 'Domicilios',
    icon: 'truck',
    color: 'coral',
    spent: 222_000,
    count: 10,
  },
  {
    id: 'transporte',
    name: 'Transporte',
    icon: 'car',
    color: 'purple',
    spent: 136_000,
    count: 7,
  },
  {
    id: 'comida',
    name: 'Comida fuera',
    icon: 'tools-kitchen-2',
    color: 'pink',
    spent: 198_500,
    count: 8,
  },
  { id: 'cafe', name: 'Café', icon: 'coffee', color: 'amber', spent: 422_400, count: 14 },
  {
    id: 'entret',
    name: 'Entretenimiento',
    icon: 'movie',
    color: 'purple',
    spent: 102_000,
    count: 3,
  },
  {
    id: 'subs',
    name: 'Suscripciones',
    icon: 'refresh',
    color: 'amber',
    spent: 92_800,
    count: 3,
  },
  {
    id: 'servicios',
    name: 'Servicios',
    icon: 'bolt',
    color: 'amber',
    spent: 127_000,
    count: 1,
  },
  { id: 'salud', name: 'Salud', icon: 'heart', color: 'mint', spent: 23_400, count: 1 },
  {
    id: 'educacion',
    name: 'Educación',
    icon: 'school',
    color: 'purple',
    spent: 0,
    count: 0,
  },
  { id: 'hogar', name: 'Hogar', icon: 'home-2', color: 'mint', spent: 0, count: 0 },
  { id: 'otros', name: 'Otros', icon: 'dots', color: 'neutral', spent: 18_500, count: 1 },
];

export class InMemoryCategoriesRepository implements CategoriesRepository {
  async getOverview(): Promise<CategoriesOverview> {
    const totalSpent = STANDARD_CATEGORIES.reduce((sum, c) => sum + c.spent, 0);
    const activeCount = STANDARD_CATEGORIES.filter((c) => c.count > 0).length;
    return {
      categories: STANDARD_CATEGORIES,
      totalSpent,
      activeCount,
      totalCount: STANDARD_CATEGORIES.length,
    };
  }
}
