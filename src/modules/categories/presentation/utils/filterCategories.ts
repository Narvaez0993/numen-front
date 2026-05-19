import type { Category } from '../../domain';

export function filterCategories(
  query: string,
  categories: readonly Category[],
): readonly Category[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories.filter((c) => c.name.toLowerCase().includes(q));
}
