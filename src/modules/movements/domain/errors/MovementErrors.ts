import { DomainError } from '@/shared/domain';

export class MovementNotFoundError extends DomainError {
  readonly code = 'movements.not_found';
  constructor() {
    super('Movement not found');
  }
}

export class MovementSourceNotFoundError extends DomainError {
  readonly code = 'movements.source_not_found';
  constructor() {
    super('Source not found');
  }
}

export class MovementCategoryNotFoundError extends DomainError {
  readonly code = 'movements.category_not_found';
  constructor() {
    super('Category not found for this movement');
  }
}

/** The one field the form can point at when the API refuses a movement. */
export type MovementField = 'amount';

export class InvalidMovementError extends DomainError {
  readonly code = 'movements.invalid';
  /** Which field the API refused, when its message names one — so the form can
   *  mark that field instead of showing a generic failure. */
  readonly field: MovementField | null;
  constructor(message = 'Invalid movement', field: MovementField | null = null) {
    super(message);
    this.field = field;
  }
}
