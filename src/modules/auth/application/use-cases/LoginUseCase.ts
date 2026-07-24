import { Result, err, ok } from '@/shared/domain';

import { AuthRepository, Email, Password } from '../../domain';
import type { LoginInputDTO } from '../dto/LoginDTO';
import { AuthSessionDTO, toAuthSessionDTO } from '../dto/SessionDTO';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: LoginInputDTO): Promise<Result<AuthSessionDTO, Error>> {
    try {
      const email = Email.create(input.email);
      const password = Password.create(input.password);
      const session = await this.authRepository.login({ email, password });
      return ok(toAuthSessionDTO(session));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown login error'));
    }
  }
}
