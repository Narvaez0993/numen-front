import { useMemo } from 'react';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import type { AccentColor } from '@/shared/domain';

import type { SourceRef, SourceType } from '../../domain';

/** A movement's source, resolved for display. Carries its `type` because an id
 * alone cannot say whether it is an account or a card. */
export type ResolvedSource = {
  id: string;
  type: SourceType;
  name: string;
  icon: string;
  color: AccentColor;
};

export type ResolvedCategory = {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
};

export type MovementCatalogs = {
  categoryById: Record<string, ResolvedCategory>;
  sourceById: Record<string, ResolvedSource>;
  isLoading: boolean;
  isError: boolean;
};

/**
 * Joins a movement's ids with the category and source lists — both already
 * cached by their own screens, so this costs no extra request.
 *
 * The API stores only references on purpose: renaming a category then updates the
 * whole history for free, instead of leaving stale copies behind.
 */
export function useMovementCatalogs(): MovementCatalogs {
  const categories = useCategories();
  const accounts = useAccounts();

  return useMemo(() => {
    const categoryById: Record<string, ResolvedCategory> = {};
    for (const category of categories.data ?? []) {
      categoryById[category.id] = {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color === 'neutral' ? 'mint' : category.color,
      };
    }

    const sourceById: Record<string, ResolvedSource> = {};
    for (const account of accounts.data?.accounts ?? []) {
      sourceById[account.id] = {
        id: account.id,
        type: 'account',
        name: account.name,
        icon: account.icon,
        color: account.color,
      };
    }
    for (const card of accounts.data?.creditCards ?? []) {
      sourceById[card.id] = {
        id: card.id,
        type: 'credit_card',
        name: card.name,
        icon: card.icon,
        color: card.color,
      };
    }

    return {
      categoryById,
      sourceById,
      isLoading: categories.isLoading || accounts.isLoading,
      isError: categories.isError || accounts.isError,
    };
  }, [
    categories.data,
    categories.isLoading,
    categories.isError,
    accounts.data,
    accounts.isLoading,
    accounts.isError,
  ]);
}

/** The source shown on a row: a transfer is named by where the money landed. */
export function displaySource(
  catalogs: MovementCatalogs,
  source: SourceRef,
  destination: SourceRef | null,
): ResolvedSource | undefined {
  return catalogs.sourceById[destination?.id ?? source.id];
}
