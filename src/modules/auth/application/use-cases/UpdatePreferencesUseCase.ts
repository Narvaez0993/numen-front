import { Result, err, ok } from '@/shared/domain';

import { AuthRepository, PreferencesPatch } from '../../domain';
import { ProfileDTO, toProfileDTO } from '../dto/ProfileDTO';

export class UpdatePreferencesUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(patch: PreferencesPatch): Promise<Result<ProfileDTO, Error>> {
    try {
      const user = await this.authRepository.updatePreferences(patch);
      return ok(toProfileDTO(user));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown preferences error'));
    }
  }
}
