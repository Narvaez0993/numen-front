import { DomainError } from '@/shared/domain';

export class WeakPasswordError extends DomainError {
  readonly code = 'auth.weak_password';
}

const MIN_LENGTH = 8;

export class Password {
  private constructor(public readonly value: string) {}

  static create(raw: string): Password {
    if (raw.length < MIN_LENGTH) {
      throw new WeakPasswordError(`Password must be at least ${MIN_LENGTH} characters`);
    }
    return new Password(raw);
  }
}
