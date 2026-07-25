import type { Movement } from '../../domain';
import type { MovementsFilters } from '../../application';
import type { MovementCatalogs } from '../hooks/useMovementCatalogs';

/**
 * Client-side filters only. The month is served by the API (`from`/`to`); these
 * narrow what is already in hand, so the chips feel instant.
 */
export function filterMovements(
  movements: readonly Movement[],
  filters: MovementsFilters,
  { categoryById, sourceById }: MovementCatalogs,
): Movement[] {
  const query = filters.query.trim().toLowerCase();

  return movements.filter((movement) => {
    if (filters.type && movement.type !== filters.type) return false;
    if (filters.categoryId && movement.categoryId !== filters.categoryId) return false;
    if (
      filters.sourceId &&
      movement.source.id !== filters.sourceId &&
      movement.destination?.id !== filters.sourceId
    ) {
      return false;
    }

    if (!query) return true;
    const category = movement.categoryId
      ? (categoryById[movement.categoryId]?.name ?? '')
      : '';
    const source = sourceById[movement.source.id]?.name ?? '';
    return (
      movement.description.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query) ||
      source.toLowerCase().includes(query) ||
      String(movement.amount).includes(query)
    );
  });
}
