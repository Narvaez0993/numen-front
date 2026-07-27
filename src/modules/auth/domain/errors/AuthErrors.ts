import { DomainError } from '@/shared/domain';

export class EmailNotVerifiedError extends DomainError {
  readonly code = 'auth.email_not_verified';
  constructor() {
    super('Email address is not verified');
  }
}

export class EmailAlreadyExistsError extends DomainError {
  readonly code = 'auth.user_already_exists';
  constructor() {
    super('Email is already registered');
  }
}

export class InvalidCodeError extends DomainError {
  readonly code = 'auth.verification_code_invalid';
  constructor() {
    super('Verification code is invalid');
  }
}

export class CodeExpiredError extends DomainError {
  readonly code = 'auth.verification_code_expired';
  constructor() {
    super('Verification code has expired');
  }
}

export class TooManyAttemptsError extends DomainError {
  readonly code = 'auth.verification_attempts_exceeded';
  constructor() {
    super('Too many attempts; request a new code');
  }
}

export class ResendCooldownError extends DomainError {
  readonly code = 'auth.resend_cooldown';
  constructor() {
    super('A code was requested recently; wait before resending');
  }
}

export class SessionExpiredError extends DomainError {
  readonly code = 'auth.session_expired';
  constructor() {
    super('Session expired; sign in again');
  }
}

/**
 * The home currency cannot change once money has been registered: amounts are
 * stored in the currency's minor unit and the exponent differs (COP 0, USD 2), so
 * re-labelling a history would move every decimal point.
 */
export class CurrencyChangeBlockedError extends DomainError {
  readonly code = 'auth.currency_change_blocked';
  constructor() {
    super('Your data is registered in another currency');
  }
}
