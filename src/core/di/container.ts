import { LoginUseCase } from '@/modules/auth/application';
import { AuthRepository } from '@/modules/auth/domain';
import { InMemoryAuthRepository } from '@/modules/auth/infrastructure';
import type { ExpenseRepository } from '@/modules/expenses/application/ports/ExpenseRepository';
import { CreateExpensesUseCase } from '@/modules/expenses/application/use-cases/CreateExpensesUseCase';
import { InMemoryExpenseRepository } from '@/modules/expenses/infrastructure/repositories/InMemoryExpenseRepository';
import type { HomeRepository } from '@/modules/home/application/ports/HomeRepository';
import { GetHomeOverviewUseCase } from '@/modules/home/application/use-cases/GetHomeOverviewUseCase';
import { InMemoryHomeRepository } from '@/modules/home/infrastructure/repositories/InMemoryHomeRepository';
import type { MovementsRepository } from '@/modules/movements/application/ports/MovementsRepository';
import { GetMovementsUseCase } from '@/modules/movements/application/use-cases/GetMovementsUseCase';
import { InMemoryMovementsRepository } from '@/modules/movements/infrastructure/repositories/InMemoryMovementsRepository';
import type { ProfileRepository } from '@/modules/profile/application/ports/ProfileRepository';
import { GetProfileUseCase } from '@/modules/profile/application/use-cases/GetProfileUseCase';
import { InMemoryProfileRepository } from '@/modules/profile/infrastructure/repositories/InMemoryProfileRepository';

const authRepository: AuthRepository = new InMemoryAuthRepository();
const homeRepository: HomeRepository = new InMemoryHomeRepository();
const profileRepository: ProfileRepository = new InMemoryProfileRepository();
const expenseRepository: ExpenseRepository = new InMemoryExpenseRepository();
const movementsRepository: MovementsRepository = new InMemoryMovementsRepository();

export const loginUseCase = new LoginUseCase(authRepository);
export const getHomeOverviewUseCase = new GetHomeOverviewUseCase(homeRepository);
export const getProfileUseCase = new GetProfileUseCase(profileRepository);
export const createExpensesUseCase = new CreateExpensesUseCase(expenseRepository);
export const getMovementsUseCase = new GetMovementsUseCase(movementsRepository);

export const container = {
  authRepository,
  homeRepository,
  profileRepository,
  expenseRepository,
  movementsRepository,
  loginUseCase,
  getHomeOverviewUseCase,
  getProfileUseCase,
  createExpensesUseCase,
  getMovementsUseCase,
};
