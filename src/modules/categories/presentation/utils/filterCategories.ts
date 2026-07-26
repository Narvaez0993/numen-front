/** Generic over the row shape: the screen filters categories already joined
 * with the spend of the period, and only the name is searched. */
export function filterCategories<T extends { name: string }>(
  query: string,
  categories: readonly T[],
): readonly T[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories.filter((c) => c.name.toLowerCase().includes(q));
}
