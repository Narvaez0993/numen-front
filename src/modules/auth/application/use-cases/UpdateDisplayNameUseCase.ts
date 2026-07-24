import { Result, err, ok } from '@/shared/domain';

import { AuthRepository } from '../../domain';
import { ProfileDTO, toProfileDTO } from '../dto/ProfileDTO';

export class UpdateDisplayNameUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(displayName: string): Promise<Result<ProfileDTO, Error>> {
    try {
      const user = await this.authRepository.updateDisplayName(displayName.trim());
      return ok(toProfileDTO(user));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown update error'));
    }
  }
}
