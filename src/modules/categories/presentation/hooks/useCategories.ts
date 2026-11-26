import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { container } from '@/core/di/container';

import type { Category } from '../../domain';
import { categoryName } from '../utils/categoryName';

/**
 * The user's categories, named in the language the app is in.
 *
 * Every screen that lists or names a category reads it from here — the pickers,
 * the history (through `useMovementCatalogs`), the detail, Presupuesto, Home and
 * the filters — so translating the standard catalog here (HU-10) reaches all of
 * them at once. The cache keeps what the server sent; only what is handed out
 * is translated, so switching the language does not refetch anything.
 */
export function useCategories() {
  const { t } = useTranslation();
  const select = useCallback(
    (categories: readonly Category[]): readonly Category[] =>
      categories.map((category) => ({
        ...category,
        name: categoryName(category.id, category.name, t),
      })),
    [t],
  );

  return useQuery<readonly Category[], Error, readonly Category[]>({
    queryKey: ['categories', 'overview'],
    queryFn: () => container.getCategoriesUseCase.execute(),
    select,
  });
}
