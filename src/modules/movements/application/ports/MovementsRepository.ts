import type { Movement, MovementType, NewMovement } from '../../domain';

/** Inclusive `YYYY-MM-DD` bounds; the month filter is served by the API. */
export type MovementsQuery = {
  from?: string;
  to?: string;
  type?: MovementType;
  sourceId?: string;
  categoryId?: string;
  limit?: number;
};

export interface MovementsRepository {
  list(query: MovementsQuery): Promise<Movement[]>;
  /**
   * `idempotencyKey` makes a retry (or a double tap on "save") return the
   * original movement instead of charging the user twice.
   */
  create(input: NewMovement, idempotencyKey?: string): Promise<Movement>;
}
