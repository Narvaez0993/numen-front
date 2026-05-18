import { LoginUseCase } from '@/modules/auth/application';
import { AuthRepository } from '@/modules/auth/domain';
import { InMemoryAuthRepository } from '@/modules/auth/infrastructure';
import type { HomeRepository } from '@/modules/home/application/ports/HomeRepository';
import { GetHomeOverviewUseCase } from '@/modules/home/application/use-cases/GetHomeOverviewUseCase';
import { InMemoryHomeRepository } from '@/modules/home/infrastructure/repositories/InMemoryHomeRepository';
import type { ProfileRepository } from '@/modules/profile/application/ports/ProfileRepository';
import { GetProfileUseCase } from '@/modules/profile/application/use-cases/GetProfileUseCase';
import { InMemoryProfileRepository } from '@/modules/profile/infrastructure/repositories/InMemoryProfileRepository';

const authRepository: AuthRepository = new InMemoryAuthRepository();
const homeRepository: HomeRepository = new InMemoryHomeRepository();
const profileRepository: ProfileRepository = new InMemoryProfileRepository();

export const loginUseCase = new LoginUseCase(authRepository);
export const getHomeOverviewUseCase = new GetHomeOverviewUseCase(homeRepository);
export const getProfileUseCase = new GetProfileUseCase(profileRepository);

export const container = {
  authRepository,
  homeRepository,
  profileRepository,
  loginUseCase,
  getHomeOverviewUseCase,
  getProfileUseCase,
};
