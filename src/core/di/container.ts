import { LoginUseCase } from '@/modules/auth/application';
import { AuthRepository } from '@/modules/auth/domain';
import { InMemoryAuthRepository } from '@/modules/auth/infrastructure';
import { GetHomeOverviewUseCase } from '@/modules/home/application/use-cases/GetHomeOverviewUseCase';
import type { HomeRepository } from '@/modules/home/application/ports/HomeRepository';
import { InMemoryHomeRepository } from '@/modules/home/infrastructure/repositories/InMemoryHomeRepository';

const authRepository: AuthRepository = new InMemoryAuthRepository();
const homeRepository: HomeRepository = new InMemoryHomeRepository();

export const loginUseCase = new LoginUseCase(authRepository);
export const getHomeOverviewUseCase = new GetHomeOverviewUseCase(homeRepository);

export const container = {
  authRepository,
  homeRepository,
  loginUseCase,
  getHomeOverviewUseCase,
};
