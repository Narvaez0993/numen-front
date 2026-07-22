import type { OnboardingProfileDTO } from '../../dto/OnboardingProfileDTO';
import type { OnboardingRepository } from '../../ports/OnboardingRepository';
import { CompleteOnboardingUseCase } from '../CompleteOnboardingUseCase';

class FakeOnboardingRepository implements OnboardingRepository {
  saved: OnboardingProfileDTO | null = null;
  shouldThrow = false;

  async save(profile: OnboardingProfileDTO): Promise<void> {
    if (this.shouldThrow) {
      throw new Error('boom');
    }
    this.saved = profile;
  }
}

describe('CompleteOnboardingUseCase', () => {
  it('returns ok and persists the trimmed profile on a valid input', async () => {
    const repo = new FakeOnboardingRepository();
    const useCase = new CompleteOnboardingUseCase(repo);

    const result = await useCase.execute({
      name: '  Sebastián  ',
      goal: 'ahorrar',
      bankId: 'banco',
      balance: 5245000,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('Sebastián');
    }
    expect(repo.saved?.name).toBe('Sebastián');
  });

  it('returns err when the name is shorter than 2 chars', async () => {
    const repo = new FakeOnboardingRepository();
    const useCase = new CompleteOnboardingUseCase(repo);

    const result = await useCase.execute({
      name: 'S',
      goal: null,
      bankId: null,
      balance: 0,
    });

    expect(result.ok).toBe(false);
    expect(repo.saved).toBeNull();
  });

  it('returns err when balance is negative', async () => {
    const repo = new FakeOnboardingRepository();
    const useCase = new CompleteOnboardingUseCase(repo);

    const result = await useCase.execute({
      name: 'Sebastián',
      goal: null,
      bankId: 'banco',
      balance: -100,
    });

    expect(result.ok).toBe(false);
    expect(repo.saved).toBeNull();
  });

  it('wraps a repository failure into an err Result', async () => {
    const repo = new FakeOnboardingRepository();
    repo.shouldThrow = true;
    const useCase = new CompleteOnboardingUseCase(repo);

    const result = await useCase.execute({
      name: 'Sebastián',
      goal: 'gastos',
      bankId: null,
      balance: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('boom');
    }
  });
});
