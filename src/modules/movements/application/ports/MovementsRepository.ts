import type {
  Movement,
  MovementPatch,
  MovementsSummary,
  MovementType,
  NewMovement,
} from '../../domain';

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
  /** Editing re-settles the money: the API reverts the old effect and applies the new one. */
  update(id: string, patch: MovementPatch): Promise<Movement>;
  /** Deleting gives the money back — this is what makes undo real. */
  remove(id: string): Promise<void>;
  /** Period aggregates, computed by the store (Home, categories, later budgets). */
  summarize(range: { from: string; to: string }): Promise<MovementsSummary>;
}
