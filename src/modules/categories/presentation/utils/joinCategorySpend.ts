import type { Category } from '../../domain';

/**
 * What a period's aggregation says about one category. Structurally identical to
 * the movements summary entry on purpose: the join needs no import from there.
 */
export type CategorySpendEntry = {
  categoryId: string | null;
  spent: number;
  count: number;
};

/** A category plus what was spent on it during the period on screen. */
export type CategoryWithSpend = Category & { spent: number; count: number };

/**
 * Spend is a fact of a period, not a field of a category: the catalog comes from
 * `/categories` and the numbers from the movements summary, joined here so the
 * server never keeps a denormalized total in sync.
 *
 * Entries with no matching category — including the unclassified `null` bucket —
 * are dropped: this list is the catalog, not the aggregation.
 */
export function joinCategorySpend(
  categories: readonly Category[],
  spend: readonly CategorySpendEntry[],
): CategoryWithSpend[] {
  const byId = new Map<string, CategorySpendEntry>();
  for (const entry of spend) {
    if (entry.categoryId !== null) byId.set(entry.categoryId, entry);
  }

  return categories.map((category) => {
    const entry = byId.get(category.id);
    return { ...category, spent: entry?.spent ?? 0, count: entry?.count ?? 0 };
  });
}
