import type { OnboardingProfileDTO, OnboardingRepository } from '../../application';

export class InMemoryOnboardingRepository implements OnboardingRepository {
  private lastSaved: OnboardingProfileDTO | null = null;

  async save(profile: OnboardingProfileDTO): Promise<void> {
    this.lastSaved = profile;
  }

  getLastSaved(): OnboardingProfileDTO | null {
    return this.lastSaved;
  }
}
