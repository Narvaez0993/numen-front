import axios from 'axios';

import {
  CurrencyChangeBlockedError,
  CodeExpiredError,
  EmailAlreadyExistsError,
  EmailNotVerifiedError,
  InvalidCodeError,
  InvalidCredentialsError,
  ResendCooldownError,
  SessionExpiredError,
  TooManyAttemptsError,
  WeakPasswordError,
} from '../../domain';

const BY_CODE: Record<string, () => Error> = {
  'auth.invalid_credentials': () => new InvalidCredentialsError(),
  'auth.user_already_exists': () => new EmailAlreadyExistsError(),
  'auth.weak_password': () =>
    new WeakPasswordError('Password must be at least 8 characters'),
  'auth.email_not_verified': () => new EmailNotVerifiedError(),
  'auth.verification_code_invalid': () => new InvalidCodeError(),
  'auth.verification_code_expired': () => new CodeExpiredError(),
  'auth.verification_attempts_exceeded': () => new TooManyAttemptsError(),
  'auth.resend_cooldown': () => new ResendCooldownError(),
  'auth.invalid_refresh_token': () => new SessionExpiredError(),
  'auth.refresh_token_reused': () => new SessionExpiredError(),
  'auth.currency_change_blocked': () => new CurrencyChangeBlockedError(),
};

/** Translate a backend `{ code, message }` error into a domain error. */
export function mapApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: string; message?: string } | undefined;
    const factory = data?.code ? BY_CODE[data.code] : undefined;
    if (factory) {
      return factory();
    }
    return new Error(data?.message ?? error.message);
  }
  return error instanceof Error ? error : new Error('Network error');
}
