import { DomainError } from '@/shared/domain';

export class BudgetNotFoundError extends DomainError {
  readonly code = 'budgets.not_found';
  constructor() {
    super('Budget not found');
  }
}

/** A second ceiling, or a second cap on the same category: both are an edit. */
export class BudgetAlreadyExistsError extends DomainError {
  readonly code = 'budgets.already_exists';
  constructor() {
    super('You already have a cap for that');
  }
}

/** The third watched category on Free — the one place this screen upsells. */
export class BudgetLimitReachedError extends DomainError {
  readonly code = 'budgets.limit_reached';
  constructor() {
    super('Category cap limit reached for your plan');
  }
}

export class BudgetCategoryNotFoundError extends DomainError {
  readonly code = 'budgets.unknown_category';
  constructor() {
    super('That expense category does not exist');
  }
}

export class InvalidBudgetError extends DomainError {
  readonly code = 'budgets.invalid';
  constructor(message = 'Invalid budget') {
    super(message);
  }
}
