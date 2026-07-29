import { DomainError } from '@/shared/domain';

export class DebtNotFoundError extends DomainError {
  readonly code = 'debts.not_found';
  constructor() {
    super('Debt not found');
  }
}

/** More than what is owed: a typo or a new agreement — never silently clamped. */
export class OverpaidError extends DomainError {
  readonly code = 'debts.overpaid';
  constructor() {
    super('That payment is more than what is owed');
  }
}

export class CounterpartyNotFoundError extends DomainError {
  readonly code = 'debts.counterparty_not_found';
  constructor() {
    super('That person does not exist');
  }
}

export class InvalidDebtError extends DomainError {
  readonly code = 'debts.invalid';
  constructor(message = 'Invalid debt') {
    super(message);
  }
}
