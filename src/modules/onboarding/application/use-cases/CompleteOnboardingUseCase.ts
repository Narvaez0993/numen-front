import { Result, err, ok } from '@/shared/domain';

import type { OnboardingProfileDTO } from '../dto/OnboardingProfileDTO';
import type { OnboardingRepository } from '../ports/OnboardingRepository';

export class CompleteOnboardingUseCase {
  constructor(private readonly onboardingRepository: OnboardingRepository) {}

  async execute(
    profile: OnboardingProfileDTO,
  ): Promise<Result<OnboardingProfileDTO, Error>> {
    const trimmedName = profile.name.trim();
    if (trimmedName.length < 2) {
      return err(new Error('Name must be at least 2 characters'));
    }
    if (profile.balance < 0) {
      return err(new Error('Balance cannot be negative'));
    }
    const normalized: OnboardingProfileDTO = {
      name: trimmedName,
      goal: profile.goal,
      bankId: profile.bankId,
      balance: profile.balance,
    };
    try {
      await this.onboardingRepository.save(normalized);
      return ok(normalized);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to save onboarding'));
    }
  }
}
