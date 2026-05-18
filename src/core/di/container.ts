import { LoginUseCase } from '@/modules/auth/application';
import { AuthRepository } from '@/modules/auth/domain';
import { InMemoryAuthRepository } from '@/modules/auth/infrastructure';

const authRepository: AuthRepository = new InMemoryAuthRepository();

export const loginUseCase = new LoginUseCase(authRepository);

export const container = {
  authRepository,
  loginUseCase,
};
