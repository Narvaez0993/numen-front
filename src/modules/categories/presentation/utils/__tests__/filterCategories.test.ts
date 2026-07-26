import type { Category } from '../../../domain';
import { filterCategories } from '../filterCategories';

const base = { flow: 'expense', isStandard: true } as const;

const CATEGORIES: Category[] = [
  {
    id: 'cafe',
    name: 'Café',
    icon: 'coffee',
    color: 'amber',
    ...base,
  },
  {
    id: 'mercado',
    name: 'Mercado',
    icon: 'shopping-cart',
    color: 'mint',
    ...base,
  },
  {
    id: 'comida',
    name: 'Comida fuera',
    icon: 'tools-kitchen-2',
    color: 'pink',
    ...base,
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
