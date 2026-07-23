import { DomainError } from '@/shared/domain';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'auth.invalid_credentials';
  constructor() {
    super('Invalid email or password');
  }
}
