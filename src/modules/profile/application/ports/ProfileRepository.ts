import type { UserProfile } from '../../domain/types/UserProfile';

export interface ProfileRepository {
  getProfile(): Promise<UserProfile>;
}
