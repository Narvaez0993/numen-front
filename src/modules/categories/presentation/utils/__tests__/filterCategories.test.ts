import type { Category } from '../../../domain';
import { filterCategories } from '../filterCategories';

const CATEGORIES: Category[] = [
  { id: 'cafe', name: 'Café', icon: 'coffee', color: 'amber', spent: 1000, count: 1 },
  {
    id: 'mercado',
    name: 'Mercado',
    icon: 'shopping-cart',
    color: 'mint',
    spent: 2000,
    count: 2,
  },
  {
    id: 'comida',
    name: 'Comida fuera',
    icon: 'tools-kitchen-2',
    color: 'pink',
    spent: 3000,
    count: 3,
  },
];

describe('filterCategories', () => {
  it('returns the same list when the query is empty or only whitespace', () => {
    expect(filterCategories('', CATEGORIES)).toEqual(CATEGORIES);
    expect(filterCategories('   ', CATEGORIES)).toEqual(CATEGORIES);
  });

  it('matches case-insensitively against the name', () => {
    expect(filterCategories('CAFÉ', CATEGORIES)).toEqual([CATEGORIES[0]]);
    expect(filterCategories('mer', CATEGORIES)).toEqual([CATEGORIES[1]]);
  });

  it('returns an empty list when there is no match', () => {
    expect(filterCategories('xyz', CATEGORIES)).toEqual([]);
  });

  it('preserves the input order of the matches', () => {
    expect(filterCategories('co', CATEGORIES).map((c) => c.id)).toEqual(['comida']);
  });
});
