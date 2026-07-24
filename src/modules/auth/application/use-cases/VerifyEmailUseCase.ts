import { Result, err, ok } from '@/shared/domain';

import { AuthRepository, Email } from '../../domain';
import { AuthSessionDTO, toAuthSessionDTO } from '../dto/SessionDTO';
import type { VerifyEmailInputDTO } from '../dto/VerifyEmailDTO';

export class VerifyEmailUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: VerifyEmailInputDTO): Promise<Result<AuthSessionDTO, Error>> {
    try {
      const email = Email.create(input.email);
      const session = await this.authRepository.verifyEmail(email, input.code.trim());
      return ok(toAuthSessionDTO(session));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown verify error'));
    }
  }
}
