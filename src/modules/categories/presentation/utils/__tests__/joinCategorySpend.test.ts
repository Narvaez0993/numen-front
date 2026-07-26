import type { Category } from '../../../domain';
import { joinCategorySpend } from '../joinCategorySpend';

const base = {
  icon: 'circle',
  color: 'mint',
  flow: 'expense',
  isStandard: true,
} as const;

const CATEGORIES: Category[] = [
  { id: 'cafe', name: 'Café', ...base },
  { id: 'mercado', name: 'Mercado', ...base },
];

describe('joinCategorySpend', () => {
  it('carries the spend of the period onto each category', () => {
    const joined = joinCategorySpend(CATEGORIES, [
      { categoryId: 'mercado', spent: 356_000, count: 9 },
    ]);

    expect(joined).toEqual([
      { ...CATEGORIES[0], spent: 0, count: 0 },
      { ...CATEGORIES[1], spent: 356_000, count: 9 },
    ]);
  });

  it('leaves every category at zero when the period has no movements', () => {
    const joined = joinCategorySpend(CATEGORIES, []);

    expect(joined.map((c) => c.spent)).toEqual([0, 0]);
    expect(joined.map((c) => c.count)).toEqual([0, 0]);
  });

  it('drops the unclassified bucket and any category no longer in the catalog', () => {
    const joined = joinCategorySpend(CATEGORIES, [
      { categoryId: null, spent: 45_000, count: 1 },
      { categoryId: 'deleted', spent: 10_000, count: 1 },
    ]);

    expect(joined).toHaveLength(2);
    expect(joined.every((c) => c.spent === 0)).toBe(true);
  });

  it('keeps the catalog order, so the screen decides how to sort', () => {
    const joined = joinCategorySpend(CATEGORIES, [
      { categoryId: 'cafe', spent: 1_000, count: 1 },
      { categoryId: 'mercado', spent: 9_000, count: 2 },
    ]);

    expect(joined.map((c) => c.id)).toEqual(['cafe', 'mercado']);
  });
});
