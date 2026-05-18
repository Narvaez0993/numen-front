import { Result, err, ok } from '@/shared/domain';

import { AuthRepository, Email, InvalidCredentialsError, Password } from '../../domain';
import type { LoginInputDTO, LoginOutputDTO } from '../dto/LoginDTO';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: LoginInputDTO): Promise<Result<LoginOutputDTO, Error>> {
    try {
      const email = Email.create(input.email);
      const password = Password.create(input.password);
      const session = await this.authRepository.login({ email, password });
      return ok({
        userId: session.user.id,
        email: session.user.email.value,
        displayName: session.user.displayName,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return err(error);
      }
      if (error instanceof Error) {
        return err(error);
      }
      return err(new Error('Unknown login error'));
    }
  }
}
