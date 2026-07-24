import type { AccountsRepository } from '@/modules/accounts/application/ports/AccountsRepository';
import { GetAccountsOverviewUseCase } from '@/modules/accounts/application/use-cases/GetAccountsOverviewUseCase';
import { InMemoryAccountsRepository } from '@/modules/accounts/infrastructure/repositories/InMemoryAccountsRepository';
import type { AssistantRepository } from '@/modules/assistant/application/ports/AssistantRepository';
import { GetAssistantUseCase } from '@/modules/assistant/application/use-cases/GetAssistantUseCase';
import { InMemoryAssistantRepository } from '@/modules/assistant/infrastructure/repositories/InMemoryAssistantRepository';
import type { CategoriesRepository } from '@/modules/categories/application/ports/CategoriesRepository';
import { CreateCategoryUseCase } from '@/modules/categories/application/use-cases/CreateCategoryUseCase';
import { DeleteCategoryUseCase } from '@/modules/categories/application/use-cases/DeleteCategoryUseCase';
import { GetCategoriesUseCase } from '@/modules/categories/application/use-cases/GetCategoriesUseCase';
import { UpdateCategoryUseCase } from '@/modules/categories/application/use-cases/UpdateCategoryUseCase';
import { HttpCategoriesRepository } from '@/modules/categories/infrastructure';
import {
  LoginUseCase,
  LogoutUseCase,
  RegisterUseCase,
  ResendCodeUseCase,
  UpdateDisplayNameUseCase,
  VerifyEmailUseCase,
} from '@/modules/auth/application';
import { AuthRepository } from '@/modules/auth/domain';
import { HttpAuthRepository } from '@/modules/auth/infrastructure';
import { httpClient } from '@/shared/infrastructure/http/client';
import type { BudgetsRepository } from '@/modules/budgets/application/ports/BudgetsRepository';
import { GetBudgetsUseCase } from '@/modules/budgets/application/use-cases/GetBudgetsUseCase';
import { InMemoryBudgetsRepository } from '@/modules/budgets/infrastructure/repositories/InMemoryBudgetsRepository';
import type { DeudasRepository } from '@/modules/deudas/application/ports/DeudasRepository';
import { GetDeudasUseCase } from '@/modules/deudas/application/use-cases/GetDeudasUseCase';
import { InMemoryDeudasRepository } from '@/modules/deudas/infrastructure/repositories/InMemoryDeudasRepository';
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
import type { PlanRepository } from '@/modules/plan/application/ports/PlanRepository';
import { GetPlanComparisonUseCase } from '@/modules/plan/application/use-cases/GetPlanComparisonUseCase';
import { InMemoryPlanRepository } from '@/modules/plan/infrastructure/repositories/InMemoryPlanRepository';
import type { ProfileRepository } from '@/modules/profile/application/ports/ProfileRepository';
import { GetProfileUseCase } from '@/modules/profile/application/use-cases/GetProfileUseCase';
import { InMemoryProfileRepository } from '@/modules/profile/infrastructure/repositories/InMemoryProfileRepository';
import type { SubscriptionsRepository } from '@/modules/subscriptions/application/ports/SubscriptionsRepository';
import { GetSubscriptionsUseCase } from '@/modules/subscriptions/application/use-cases/GetSubscriptionsUseCase';
import { InMemorySubscriptionsRepository } from '@/modules/subscriptions/infrastructure/repositories/InMemorySubscriptionsRepository';

// Re-exported so the app layer can register a session-expiry handler without
// importing shared-infrastructure directly (boundaries: app → core is allowed).
export { setOnSessionExpired } from '@/shared/infrastructure/http/client';

const authRepository: AuthRepository = new HttpAuthRepository(httpClient);
const homeRepository: HomeRepository = new InMemoryHomeRepository();
const profileRepository: ProfileRepository = new InMemoryProfileRepository();
const expenseRepository: ExpenseRepository = new InMemoryExpenseRepository();
const movementsRepository: MovementsRepository = new InMemoryMovementsRepository();
const budgetsRepository: BudgetsRepository = new InMemoryBudgetsRepository();
const deudasRepository: DeudasRepository = new InMemoryDeudasRepository();
const assistantRepository: AssistantRepository = new InMemoryAssistantRepository();
const accountsRepository: AccountsRepository = new InMemoryAccountsRepository();
const subscriptionsRepository: SubscriptionsRepository =
  new InMemorySubscriptionsRepository();
const categoriesRepository: CategoriesRepository = new HttpCategoriesRepository(
  httpClient,
);
const planRepository: PlanRepository = new InMemoryPlanRepository();
const onboardingRepository: OnboardingRepository = new InMemoryOnboardingRepository();

export const loginUseCase = new LoginUseCase(authRepository);
export const registerUseCase = new RegisterUseCase(authRepository);
export const verifyEmailUseCase = new VerifyEmailUseCase(authRepository);
export const resendCodeUseCase = new ResendCodeUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const updateDisplayNameUseCase = new UpdateDisplayNameUseCase(authRepository);
export const getHomeOverviewUseCase = new GetHomeOverviewUseCase(homeRepository);
export const getProfileUseCase = new GetProfileUseCase(profileRepository);
export const createExpensesUseCase = new CreateExpensesUseCase(expenseRepository);
export const getMovementsUseCase = new GetMovementsUseCase(movementsRepository);
export const getBudgetsUseCase = new GetBudgetsUseCase(budgetsRepository);
export const getDeudasUseCase = new GetDeudasUseCase(deudasRepository);
export const getAssistantUseCase = new GetAssistantUseCase(assistantRepository);
export const getAccountsOverviewUseCase = new GetAccountsOverviewUseCase(
  accountsRepository,
);
export const getSubscriptionsUseCase = new GetSubscriptionsUseCase(
  subscriptionsRepository,
);
export const getCategoriesUseCase = new GetCategoriesUseCase(categoriesRepository);
export const createCategoryUseCase = new CreateCategoryUseCase(categoriesRepository);
export const updateCategoryUseCase = new UpdateCategoryUseCase(categoriesRepository);
export const deleteCategoryUseCase = new DeleteCategoryUseCase(categoriesRepository);
export const getPlanComparisonUseCase = new GetPlanComparisonUseCase(planRepository);
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
  deudasRepository,
  assistantRepository,
  accountsRepository,
  subscriptionsRepository,
  categoriesRepository,
  planRepository,
  onboardingRepository,
  loginUseCase,
  registerUseCase,
  verifyEmailUseCase,
  resendCodeUseCase,
  logoutUseCase,
  updateDisplayNameUseCase,
  getHomeOverviewUseCase,
  getProfileUseCase,
  createExpensesUseCase,
  getMovementsUseCase,
  getBudgetsUseCase,
  getDeudasUseCase,
  getAssistantUseCase,
  getAccountsOverviewUseCase,
  getSubscriptionsUseCase,
  getCategoriesUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
  getPlanComparisonUseCase,
  completeOnboardingUseCase,
};
