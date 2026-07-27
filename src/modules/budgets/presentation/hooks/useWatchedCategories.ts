import { useMemo } from 'react';

import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import type { AccentColor } from '@/shared/domain';

import type { CategoryCap } from '../../domain';

/** A cap with the label the user reads. Name and icon are never stored with the cap. */
export type WatchedCategory = CategoryCap & {
  name: string;
  icon: string;
  color: AccentColor;
};

/** A category the user could start watching, with what it has cost this month. */
export type CandidateCategory = {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
  spent: number;
};

const FALLBACK_ICON = 'dots';

/**
 * Joins caps and candidates with the categories catalog the client already caches.
 *
 * The API only ever sends ids, which is what makes renaming a category update this screen
 * for free. A cap on a category that has since been deleted keeps its id as the label
 * rather than disappearing — the number is real either way.
 */
export function useWatchedCategories(
  caps: CategoryCap[],
  spentByCategory: Record<string, number>,
) {
  const categories = useCategories();

  return useMemo(() => {
    const catalog = new Map(
      (categories.data ?? [])
        .filter((category) => category.flow === 'expense')
        .map((category) => [category.id, category] as const),
    );

    const watched: WatchedCategory[] = caps.map((cap) => {
      const category = catalog.get(cap.categoryId);
      return {
        ...cap,
        name: category?.name ?? cap.categoryId,
        icon: category?.icon ?? FALLBACK_ICON,
        color: normalize(category?.color),
      };
    });

    const capped = new Set(caps.map((cap) => cap.categoryId));
    const candidates: CandidateCategory[] = [...catalog.values()]
      .filter((category) => !capped.has(category.id))
      .map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: normalize(category.color),
        spent: spentByCategory[category.id] ?? 0,
      }))
      // The ones already costing the most are the ones worth watching first.
      .sort((a, b) => b.spent - a.spent);

    return { watched, candidates, isLoading: categories.isLoading };
  }, [caps, spentByCategory, categories.data, categories.isLoading]);
}

/** `neutral` has no accent of its own; the bars need a colour. */
function normalize(color: string | undefined): AccentColor {
  return !color || color === 'neutral' ? 'mint' : (color as AccentColor);
}
