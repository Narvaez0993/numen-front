import type { UserProfile } from '../../domain/types/UserProfile';
import type { ProfileRepository } from '../ports/ProfileRepository';

export class GetProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(): Promise<UserProfile> {
    return this.profileRepository.getProfile();
  }
}
