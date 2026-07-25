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

export class InvalidMovementError extends DomainError {
  readonly code = 'movements.invalid';
  constructor(message = 'Invalid movement') {
    super(message);
  }
}
