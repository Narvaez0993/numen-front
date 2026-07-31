import type { AccountsRepository } from '@/modules/accounts/application/ports/AccountsRepository';
import { CreateAccountUseCase } from '@/modules/accounts/application/use-cases/CreateAccountUseCase';
import { CreateCreditCardUseCase } from '@/modules/accounts/application/use-cases/CreateCreditCardUseCase';
import { DeleteAccountUseCase } from '@/modules/accounts/application/use-cases/DeleteAccountUseCase';
import { DeleteCreditCardUseCase } from '@/modules/accounts/application/use-cases/DeleteCreditCardUseCase';
import { GetAccountsOverviewUseCase } from '@/modules/accounts/application/use-cases/GetAccountsOverviewUseCase';
import { UpdateAccountUseCase } from '@/modules/accounts/application/use-cases/UpdateAccountUseCase';
import { UpdateCreditCardUseCase } from '@/modules/accounts/application/use-cases/UpdateCreditCardUseCase';
import { HttpAccountsRepository } from '@/modules/accounts/infrastructure';
import type { AssistantRepository } from '@/modules/assistant/application/ports/AssistantRepository';
import { ConfirmDraftUseCase } from '@/modules/assistant/application/use-cases/ConfirmDraftUseCase';
import { DiscardDraftUseCase } from '@/modules/assistant/application/use-cases/DiscardDraftUseCase';
import { DismissInsightUseCase } from '@/modules/assistant/application/use-cases/DismissInsightUseCase';
import { DismissCorteUseCase } from '@/modules/assistant/application/use-cases/DismissCorteUseCase';
import { GetCorteUseCase } from '@/modules/assistant/application/use-cases/GetCorteUseCase';
import { ListCortesUseCase } from '@/modules/assistant/application/use-cases/ListCortesUseCase';
import { MarkCorteReadUseCase } from '@/modules/assistant/application/use-cases/MarkCorteReadUseCase';
import { GetAssistantFeedUseCase } from '@/modules/assistant/application/use-cases/GetAssistantFeedUseCase';
import { GetAssistantUsageUseCase } from '@/modules/assistant/application/use-cases/GetAssistantUsageUseCase';
import { ParseCaptureUseCase } from '@/modules/assistant/application/use-cases/ParseCaptureUseCase';
import { GetChatHistoryUseCase } from '@/modules/assistant/application/use-cases/GetChatHistoryUseCase';
import { SendChatMessageUseCase } from '@/modules/assistant/application/use-cases/SendChatMessageUseCase';
import { HttpAssistantRepository } from '@/modules/assistant/infrastructure/repositories/HttpAssistantRepository';
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
  UpdatePreferencesUseCase,
  VerifyEmailUseCase,
} from '@/modules/auth/application';
import { AuthRepository } from '@/modules/auth/domain';
import { HttpAuthRepository } from '@/modules/auth/infrastructure';
import { httpClient } from '@/shared/infrastructure/http/client';
import type { BudgetsRepository } from '@/modules/budgets/application';
import {
  CreateBudgetUseCase,
  DeleteBudgetUseCase,
  GetBudgetsUseCase,
  UpdateBudgetUseCase,
} from '@/modules/budgets/application';
import { HttpBudgetsRepository } from '@/modules/budgets/infrastructure/repositories/HttpBudgetsRepository';
import type { DeudasRepository } from '@/modules/deudas/application';
import type { GoalsRepository } from '@/modules/goals/application';
import {
  CreateGoalUseCase,
  DeleteGoalUseCase,
  GetGoalsUseCase,
  MoveGoalFundsUseCase,
  UpdateGoalUseCase,
} from '@/modules/goals/application';
import { HttpGoalsRepository } from '@/modules/goals/infrastructure/repositories/HttpGoalsRepository';
import {
  AddPaymentUseCase,
  CreateDebtUseCase,
  CreateSharedEventUseCase,
  DeleteDebtUseCase,
  GetDeudasUseCase,
  RemovePaymentUseCase,
} from '@/modules/deudas/application';
import { HttpDeudasRepository } from '@/modules/deudas/infrastructure/repositories/HttpDeudasRepository';
import type { HomeRepository } from '@/modules/home/application/ports/HomeRepository';
import { GetHomeOverviewUseCase } from '@/modules/home/application/use-cases/GetHomeOverviewUseCase';
import { HttpHomeRepository } from '@/modules/home/infrastructure';
import type { MovementsRepository } from '@/modules/movements/application/ports/MovementsRepository';
import { CreateMovementUseCase } from '@/modules/movements/application/use-cases/CreateMovementUseCase';
import { DeleteMovementUseCase } from '@/modules/movements/application/use-cases/DeleteMovementUseCase';
import { GetMovementsUseCase } from '@/modules/movements/application/use-cases/GetMovementsUseCase';
import { SummarizeMovementsUseCase } from '@/modules/movements/application/use-cases/SummarizeMovementsUseCase';
import { UpdateMovementUseCase } from '@/modules/movements/application/use-cases/UpdateMovementUseCase';
import { HttpMovementsRepository } from '@/modules/movements/infrastructure';
import type { OnboardingRepository } from '@/modules/onboarding/application/ports/OnboardingRepository';
import { CompleteOnboardingUseCase } from '@/modules/onboarding/application/use-cases/CompleteOnboardingUseCase';
import { InMemoryOnboardingRepository } from '@/modules/onboarding/infrastructure/repositories/InMemoryOnboardingRepository';
import type { PlanRepository } from '@/modules/plan/application/ports/PlanRepository';
import { GetPlanComparisonUseCase } from '@/modules/plan/application/use-cases/GetPlanComparisonUseCase';
import { InMemoryPlanRepository } from '@/modules/plan/infrastructure/repositories/InMemoryPlanRepository';
import type { SubscriptionsRepository } from '@/modules/subscriptions/application/ports/SubscriptionsRepository';
import { CreateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/CreateSubscriptionUseCase';
import { DeleteSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/DeleteSubscriptionUseCase';
import { GetChargesUseCase } from '@/modules/subscriptions/application/use-cases/GetChargesUseCase';
import { GetSubscriptionsUseCase } from '@/modules/subscriptions/application/use-cases/GetSubscriptionsUseCase';
import { SettleChargeUseCase } from '@/modules/subscriptions/application/use-cases/SettleChargeUseCase';
import { UpdateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/UpdateSubscriptionUseCase';
import { HttpSubscriptionsRepository } from '@/modules/subscriptions/infrastructure';

// Re-exported so the app layer can register a session-expiry handler without
// importing shared-infrastructure directly (boundaries: app → core is allowed).
export { setOnSessionExpired } from '@/shared/infrastructure/http/client';

const authRepository: AuthRepository = new HttpAuthRepository(httpClient);
const homeRepository: HomeRepository = new HttpHomeRepository(httpClient);
const movementsRepository: MovementsRepository = new HttpMovementsRepository(httpClient);
const budgetsRepository: BudgetsRepository = new HttpBudgetsRepository(httpClient);
const deudasRepository: DeudasRepository = new HttpDeudasRepository(httpClient);
const goalsRepository: GoalsRepository = new HttpGoalsRepository(httpClient);
const assistantRepository: AssistantRepository = new HttpAssistantRepository(httpClient);
const accountsRepository: AccountsRepository = new HttpAccountsRepository(httpClient);
const subscriptionsRepository: SubscriptionsRepository = new HttpSubscriptionsRepository(
  httpClient,
);
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
export const updatePreferencesUseCase = new UpdatePreferencesUseCase(authRepository);
export const getHomeOverviewUseCase = new GetHomeOverviewUseCase(homeRepository);
export const getMovementsUseCase = new GetMovementsUseCase(movementsRepository);
export const createMovementUseCase = new CreateMovementUseCase(movementsRepository);
export const updateMovementUseCase = new UpdateMovementUseCase(movementsRepository);
export const deleteMovementUseCase = new DeleteMovementUseCase(movementsRepository);
export const summarizeMovementsUseCase = new SummarizeMovementsUseCase(
  movementsRepository,
);
export const getBudgetsUseCase = new GetBudgetsUseCase(budgetsRepository);
export const createBudgetUseCase = new CreateBudgetUseCase(budgetsRepository);
export const updateBudgetUseCase = new UpdateBudgetUseCase(budgetsRepository);
export const deleteBudgetUseCase = new DeleteBudgetUseCase(budgetsRepository);
export const getDeudasUseCase = new GetDeudasUseCase(deudasRepository);
export const createDebtUseCase = new CreateDebtUseCase(deudasRepository);
export const createSharedEventUseCase = new CreateSharedEventUseCase(deudasRepository);
export const deleteDebtUseCase = new DeleteDebtUseCase(deudasRepository);
export const addDebtPaymentUseCase = new AddPaymentUseCase(deudasRepository);
export const removeDebtPaymentUseCase = new RemovePaymentUseCase(deudasRepository);
export const getGoalsUseCase = new GetGoalsUseCase(goalsRepository);
export const createGoalUseCase = new CreateGoalUseCase(goalsRepository);
export const updateGoalUseCase = new UpdateGoalUseCase(goalsRepository);
export const deleteGoalUseCase = new DeleteGoalUseCase(goalsRepository);
export const moveGoalFundsUseCase = new MoveGoalFundsUseCase(goalsRepository);
export const sendChatMessageUseCase = new SendChatMessageUseCase(assistantRepository);
export const getChatHistoryUseCase = new GetChatHistoryUseCase(assistantRepository);
export const getAssistantUsageUseCase = new GetAssistantUsageUseCase(assistantRepository);
export const confirmDraftUseCase = new ConfirmDraftUseCase(assistantRepository);
export const parseCaptureUseCase = new ParseCaptureUseCase(assistantRepository);
export const getAssistantFeedUseCase = new GetAssistantFeedUseCase(assistantRepository);
export const dismissInsightUseCase = new DismissInsightUseCase(assistantRepository);
export const discardDraftUseCase = new DiscardDraftUseCase(assistantRepository);
export const listCortesUseCase = new ListCortesUseCase(assistantRepository);
export const getCorteUseCase = new GetCorteUseCase(assistantRepository);
export const markCorteReadUseCase = new MarkCorteReadUseCase(assistantRepository);
export const dismissCorteUseCase = new DismissCorteUseCase(assistantRepository);
export const getAccountsOverviewUseCase = new GetAccountsOverviewUseCase(
  accountsRepository,
);
export const createAccountUseCase = new CreateAccountUseCase(accountsRepository);
export const updateAccountUseCase = new UpdateAccountUseCase(accountsRepository);
export const deleteAccountUseCase = new DeleteAccountUseCase(accountsRepository);
export const createCreditCardUseCase = new CreateCreditCardUseCase(accountsRepository);
export const updateCreditCardUseCase = new UpdateCreditCardUseCase(accountsRepository);
export const deleteCreditCardUseCase = new DeleteCreditCardUseCase(accountsRepository);
export const getSubscriptionsUseCase = new GetSubscriptionsUseCase(
  subscriptionsRepository,
);
export const createSubscriptionUseCase = new CreateSubscriptionUseCase(
  subscriptionsRepository,
);
export const updateSubscriptionUseCase = new UpdateSubscriptionUseCase(
  subscriptionsRepository,
);
export const deleteSubscriptionUseCase = new DeleteSubscriptionUseCase(
  subscriptionsRepository,
);
export const getChargesUseCase = new GetChargesUseCase(subscriptionsRepository);
export const settleChargeUseCase = new SettleChargeUseCase(subscriptionsRepository);
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
  updatePreferencesUseCase,
  getHomeOverviewUseCase,
  getMovementsUseCase,
  createMovementUseCase,
  updateMovementUseCase,
  deleteMovementUseCase,
  summarizeMovementsUseCase,
  getBudgetsUseCase,
  createBudgetUseCase,
  updateBudgetUseCase,
  deleteBudgetUseCase,
  getDeudasUseCase,
  createDebtUseCase,
  createSharedEventUseCase,
  deleteDebtUseCase,
  addDebtPaymentUseCase,
  removeDebtPaymentUseCase,
  getGoalsUseCase,
  createGoalUseCase,
  updateGoalUseCase,
  deleteGoalUseCase,
  moveGoalFundsUseCase,
  sendChatMessageUseCase,
  getChatHistoryUseCase,
  getAssistantUsageUseCase,
  confirmDraftUseCase,
  parseCaptureUseCase,
  getAssistantFeedUseCase,
  dismissInsightUseCase,
  discardDraftUseCase,
  listCortesUseCase,
  getCorteUseCase,
  markCorteReadUseCase,
  dismissCorteUseCase,
  getAccountsOverviewUseCase,
  createAccountUseCase,
  updateAccountUseCase,
  deleteAccountUseCase,
  createCreditCardUseCase,
  updateCreditCardUseCase,
  deleteCreditCardUseCase,
  getSubscriptionsUseCase,
  createSubscriptionUseCase,
  updateSubscriptionUseCase,
  deleteSubscriptionUseCase,
  getChargesUseCase,
  settleChargeUseCase,
  getCategoriesUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
  getPlanComparisonUseCase,
  completeOnboardingUseCase,
};
