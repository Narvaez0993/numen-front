import { Result, err, ok } from '@/shared/domain';

import { AuthRepository, Email } from '../../domain';
import type { ResendCodeInputDTO } from '../dto/VerifyEmailDTO';

export class ResendCodeUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: ResendCodeInputDTO): Promise<Result<void, Error>> {
    try {
      await this.authRepository.resendCode(Email.create(input.email));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown resend error'));
    }
  }
}
