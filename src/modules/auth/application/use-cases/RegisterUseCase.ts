import { Result, err, ok } from '@/shared/domain';

import { AuthRepository, Email, Password } from '../../domain';
import type { RegisterInputDTO, RegisterOutputDTO } from '../dto/RegisterDTO';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: RegisterInputDTO): Promise<Result<RegisterOutputDTO, Error>> {
    try {
      const email = Email.create(input.email);
      const password = Password.create(input.password);
      await this.authRepository.register({
        email,
        password,
        displayName: input.name.trim(),
      });
      return ok({ email: email.value });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown register error'));
    }
  }
}
