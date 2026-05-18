import type { AssistantRepository } from '@/modules/assistant/application/ports/AssistantRepository';
import { GetAssistantUseCase } from '@/modules/assistant/application/use-cases/GetAssistantUseCase';
import { InMemoryAssistantRepository } from '@/modules/assistant/infrastructure/repositories/InMemoryAssistantRepository';
import { LoginUseCase } from '@/modules/auth/application';
import { AuthRepository } from '@/modules/auth/domain';
import { InMemoryAuthRepository } from '@/modules/auth/infrastructure';
import type { BudgetsRepository } from '@/modules/budgets/application/ports/BudgetsRepository';
import { GetBudgetsUseCase } from '@/modules/budgets/application/use-cases/GetBudgetsUseCase';
import { InMemoryBudgetsRepository } from '@/modules/budgets/infrastructure/repositories/InMemoryBudgetsRepository';
import type { ExpenseRepository } from '@/modules/expenses/application/ports/ExpenseRepository';
import { CreateExpensesUseCase } from '@/modules/expenses/application/use-cases/CreateExpensesUseCase';
import { InMemoryExpenseRepository } from '@/modules/expenses/infrastructure/repositories/InMemoryExpenseRepository';
import type { HomeRepository } from '@/modules/home/application/ports/HomeRepository';
import { GetHomeOverviewUseCase } from '@/modules/home/application/use-cases/GetHomeOverviewUseCase';
import { InMemoryHomeRepository } from '@/modules/home/infrastructure/repositories/InMemoryHomeRepository';
import type { MovementsRepository } from '@/modules/movements/application/ports/MovementsRepository';
import { GetMovementsUseCase } from '@/modules/movements/application/use-cases/GetMovementsUseCase';
import { InMemoryMovementsRepository } from '@/modules/movements/infrastructure/repositories/InMemoryMovementsRepository';
import type { OnboardingRepository } from '@/modules/onboarding/application/ports/OnboardingRepository';
import { CompleteOnboardingUseCase } from '@/modules/onboarding/application/use-cases/CompleteOnboardingUseCase';
import { InMemoryOnboardingRepository } from '@/modules/onboarding/infrastructure/repositories/InMemoryOnboardingRepository';
import type { ProfileRepository } from '@/modules/profile/application/ports/ProfileRepository';
import { GetProfileUseCase } from '@/modules/profile/application/use-cases/GetProfileUseCase';
import { InMemoryProfileRepository } from '@/modules/profile/infrastructure/repositories/InMemoryProfileRepository';

const authRepository: AuthRepository = new InMemoryAuthRepository();
const homeRepository: HomeRepository = new InMemoryHomeRepository();
const profileRepository: ProfileRepository = new InMemoryProfileRepository();
const expenseRepository: ExpenseRepository = new InMemoryExpenseRepository();
const movementsRepository: MovementsRepository = new InMemoryMovementsRepository();
const budgetsRepository: BudgetsRepository = new InMemoryBudgetsRepository();
const assistantRepository: AssistantRepository = new InMemoryAssistantRepository();
const onboardingRepository: OnboardingRepository = new InMemoryOnboardingRepository();

export const loginUseCase = new LoginUseCase(authRepository);
export const getHomeOverviewUseCase = new GetHomeOverviewUseCase(homeRepository);
export const getProfileUseCase = new GetProfileUseCase(profileRepository);
export const createExpensesUseCase = new CreateExpensesUseCase(expenseRepository);
export const getMovementsUseCase = new GetMovementsUseCase(movementsRepository);
export const getBudgetsUseCase = new GetBudgetsUseCase(budgetsRepository);
export const getAssistantUseCase = new GetAssistantUseCase(assistantRepository);
export const completeOnboardingUseCase = new CompleteOnboardingUseCase(
  onboardingRepository,
);

export const container = {
  authRepository,
  homeRepository,
  profileRepository,
  expenseRepository,
  movementsRepository,
  budgetsRepository,
  assistantRepository,
  onboardingRepository,
  loginUseCase,
  getHomeOverviewUseCase,
  getProfileUseCase,
  createExpensesUseCase,
  getMovementsUseCase,
  getBudgetsUseCase,
  getAssistantUseCase,
  completeOnboardingUseCase,
};
