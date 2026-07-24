import { DomainError } from '@/shared/domain';

export class CategoryLimitReachedError extends DomainError {
  readonly code = 'categories.limit_reached';
  constructor() {
    super('Custom category limit reached');
  }
}

export class CategoryNameTakenError extends DomainError {
  readonly code = 'categories.name_taken';
  constructor() {
    super('A category with that name already exists');
  }
}

export class CategoryNotFoundError extends DomainError {
  readonly code = 'categories.not_found';
  constructor() {
    super('Category not found');
  }
}

export class InvalidCategoryError extends DomainError {
  readonly code = 'categories.invalid';
  constructor(message = 'Invalid category') {
    super(message);
  }
}
