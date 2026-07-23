import type { OnboardingProfileDTO } from '../dto/OnboardingProfileDTO';

export interface OnboardingRepository {
  save(profile: OnboardingProfileDTO): Promise<void>;
}
