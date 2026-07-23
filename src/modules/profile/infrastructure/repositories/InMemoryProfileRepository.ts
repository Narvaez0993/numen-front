import type { UserProfile } from '../../domain/types/UserProfile';
import type { ProfileRepository } from '../../application/ports/ProfileRepository';

export class InMemoryProfileRepository implements ProfileRepository {
  async getProfile(): Promise<UserProfile> {
    return {
      id: 'usr-1',
      displayName: 'Sebastián Mejía',
      email: 'sebas@gastos.app',
      initials: 'SM',
      version: 'v2.0.0',
    };
  }
}
