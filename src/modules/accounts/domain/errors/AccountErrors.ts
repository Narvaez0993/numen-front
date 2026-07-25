import { DomainError } from '@/shared/domain';

export class AccountLimitReachedError extends DomainError {
  readonly code = 'accounts.limit_reached';
  constructor() {
    super('Account limit reached');
  }
}

export class CreditCardLimitReachedError extends DomainError {
  readonly code = 'accounts.card_limit_reached';
  constructor() {
    super('Credit card limit reached');
  }
}

export class AccountNotFoundError extends DomainError {
  readonly code = 'accounts.not_found';
  constructor() {
    super('Account not found');
  }
}

export class InvalidAccountError extends DomainError {
  readonly code = 'accounts.invalid';
  constructor(message = 'Invalid account') {
    super(message);
  }
}
