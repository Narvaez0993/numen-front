import { DomainError } from '@/shared/domain';

export class SubscriptionNotFoundError extends DomainError {
  readonly code = 'subscriptions.not_found';
  constructor() {
    super('Subscription not found');
  }
}

export class SubscriptionSourceNotFoundError extends DomainError {
  readonly code = 'subscriptions.source_not_found';
  constructor() {
    super('Source not found');
  }
}

export class SubscriptionCategoryNotFoundError extends DomainError {
  readonly code = 'subscriptions.category_not_found';
  constructor() {
    super('Category not found for this subscription');
  }
}

export class InvalidSubscriptionError extends DomainError {
  readonly code = 'subscriptions.invalid';
  constructor(message = 'Invalid subscription') {
    super(message);
  }
}

export class ChargeNotFoundError extends DomainError {
  readonly code = 'subscriptions.charge_not_found';
  constructor() {
    super('Charge not found');
  }
}

/** Confirming twice, or confirming right after the window closed on its own. */
export class ChargeAlreadySettledError extends DomainError {
  readonly code = 'subscriptions.charge_already_settled';
  constructor() {
    super('This charge was already settled');
  }
}

/**
 * The source and the home currency disagree. Its own error because it is the one
 * failure no form field can fix — it means the account was stamped in another
 * currency, and the message has to say which.
 */
export class SubscriptionSourceCurrencyMismatchError extends DomainError {
  readonly code = 'subscriptions.source_currency_mismatch';
  constructor(message = 'This source is in another currency') {
    super(message);
  }
}
